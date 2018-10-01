// Copyright © 2018 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

import { getObject, logger } from '@bcgov/nodejs-common-utils';
import { google } from 'googleapis';
import request from 'request-promise-native';
import url from 'url';
import fs from 'fs';
import cp from 'child_process';
import util from 'util';
import path from 'path';
import shortid from 'shortid';
import config from '../config';
import shared from './shared';
import { fetchKeychainValue } from './utils';

const exec = util.promisify(cp.exec);
const writeFile = util.promisify(fs.writeFile);
const bucket = config.get('minio:bucket');

/* eslint-disable global-require */
/**
 * Get the signed appliaction package
 *
 * @param {String} signedApp The name of the signed app
 * @param {String} workspace The workspace to use
 * @returns The data stream of the signed app package
 */
const fetchFileFromStorage = async (signedApp, workspace) => {
  const apath = path.join(workspace, shortid.generate());
  const outFilePath = path.join(apath, signedApp);
  try {
    const buffer = await getObject(shared.minio, bucket, signedApp);
    if (!buffer) {
      throw new Error('Unable to fetch archive.');
    }
    await exec(`mkdir -p ${apath}`);
    await writeFile(outFilePath, buffer, 'utf8');

    return outFilePath;
  } catch (error) {
    const message = 'Unable to retrieve archive';
    logger.error(`${message}, err = ${error.message}`);
    throw error;
  }
};

/**
 * Get the bundle ID of the app package
 *
 * @param {String} apkPackage The name of the signed app
 * @returns The bundle ID
 */
const getApkBundleID = async apkPackage => {
  try {
    // Use Android Asset Packaging Tool to get package bundle ID:
    const apkBundle = await exec(`
    aapt dump badging ${apkPackage} | \
    grep package: | \
    cut -d "'" -f2
    `);
    // Get rid of the linebreak at the end:
    return apkBundle.stdout.replace(/(\r\n\t|\n|\r\t)/gm, '');
  } catch (error) {
    throw new Error(`Unable to find package name! ${error}`);
  }
};

/**
 * Google Edit to uploading apk for deployment
 *
 * @param {*} publisher The google android publisher
 * @param {String} editID A unique timestamp as a String
 * @param {*} signedAPK The signed android apk stored in minio
 * @returns The status of the committed the Edit
 */
const googleDeployEdit = async (publisher, editID, signedAPK) => {
  try {
    // start a new Google Edit:
    const newEdit = await publisher.edits.insert({
      resource: {
        id: editID,
        // this edit will be valid for 10 minutes
        expiryTimeSeconds: 600,
      },
    });
    const newEditID = newEdit.data.id;

    // Upload the signed apk to the current Edit:
    await publisher.edits.apks.upload({
      editId: newEditID,
      media: {
        mimeType: 'application/vnd.android.package-archive',
        body: signedAPK,
      },
    });

    // Commit the Edit after all actions done:
    await publisher.edits.commit({
      editId: newEditID,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Google Play Store Deployment
 *
 * @param {String} signedApp The name of the signed app
 * @param {string} [workspace='/tmp/'] The workspace to use
 * @returns The status of the deployment
 */
// eslint-disable-next-line import/prefer-default-export
export const deployGoogle = async (signedApp, workspace = '/tmp/') => {
  try {
    // Get apk:
    const signedApkPath = await fetchFileFromStorage(signedApp, workspace);
    // Get the bundle ID for the apk:
    const apkBundleId = await getApkBundleID(signedApkPath);
    // Turn data stream into a package-archive file for deployment:
    const signedAPK = fs.readFileSync(signedApkPath);
    // shelly: use fetchKeychainValue:
    // Get the Google client-service key to deployment:
    const keyFull = await exec(`security find-generic-password -w -s deployKey -a ${apkBundleId}`);
    const keyPath = keyFull.stdout.trim().split('\n');
    // eslint-disable-next-line import/no-dynamic-require
    const key = require(`${keyPath}`); // TODO:(jl) This require should go.

    // Set up Google publisher:
    const scopes = [process.env.ANDROID_PUBLISHER_URL];
    const editID = String(new Date().getTime()); // unique id using timestamp
    const oauth2Client = new google.auth.OAuth2();
    const jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, scopes, null);
    const publisher = google.androidpublisher({
      version: 'v3',
      auth: oauth2Client,
      params: {
        packageName: apkBundleId,
      },
    });

    // Authorize client:
    const token = await jwtClient.authorize();
    await oauth2Client.setCredentials(token);
    // Start Google Edit:
    await googleDeployEdit(publisher, editID, signedAPK);
    return signedApkPath;
  } catch (error) {
    const message = 'Unable to deploy';
    logger.error(`${message}, err = ${error.message}`);
  }

  return Promise.reject();
};

/**
 * Apple Store Deployment
 *
 * @param {String} signedApp The name of the signed app
 * @param {string} [workspace='/tmp/'] The workspace to use
 * @returns The status of the deployment
 */
// eslint-disable-next-line no-unused-vars
export const deployAppleStore = async (signedApp, workspace = '/tmp/') => {
  // TODO
};

/**
 * AirWatch Deployment
 *
 * @param {String} job The name of the signed app
 * @param {String} platform Define if it's android or iOS app
 * @param {String} awOrgID The airwatch organization group ID to distribute the app
 * @param {String} awFileName The name of the app to appear in airwatch
 * @param {string} [workspace='/tmp/'] The workspace to use
 * @returns The status of the deployment
 */
// eslint-disable-next-line import/prefer-default-export
export const deployAirWatch = async (signedApp, platform, awOrgID, awFileName, workspace = '/tmp/') => {
  /*
  TODO:(sh) Move these to constant
  Values for airwatch api v8_1:
    DeviceType: android -> '5'; Apple -> '2'
    ModelId: android -> 5; iPhone -> 1; iPad -> 2
    ApplicationName: android -> apk; Apple -> ipa
  */

  let deviceType = '';
  let applicationName = '';
  let modelId = 0;

  switch (platform) {
    case 'ios':
    {
      applicationName = awFileName + '.ipa';
      deviceType = '2';
      modelId = 1;
      break;
    }
    case 'android':
    {
      applicationName = awFileName + '.apk';
      deviceType = '5';
      modelId = 5;
      break;
    }
    default:
      throw new Error('Unsupported application type for airWatch deployment');
  }

  // The constant url for api:
  const awHost = process.env.AIRWATCH_HOST;
  const awUploadAPI = process.env.AIRWATCH_UPLOAD_ROUTE;
  const awInstallAPI = process.env.AIRWATCH_INSTALL_ROUTE;
  const awAccountName = process.env.AIRWATCH_SECRET;
  const awKeys = ['awUsername', 'awPassword', 'awCode'];

  // shelly: use fetchKeychainValue
  // Update the user account to a device-account:
  const awKeyPairs = await fetchKeychainValue(awKeys, awAccountName);

  // const awUsernameF = await exec('security find-generic-password -w -s awUsername');
  // const awPasswordF = await exec('security find-generic-password -w -s awPassword');
  // const awTenantCodeF = await exec('security find-generic-password -w -s awCode');

  // // Extract value from stdout:
  // const awUsername = awUsernameF.stdout.trim().split('\n')[0];
  // const awPassword = awPasswordF.stdout.trim().split('\n')[0];
  // const awTenantCode = awTenantCodeF.stdout.trim().split('\n')[0];

  // Get app binary:
  const signedAppPath = await fetchFileFromStorage(signedApp, workspace);
  const appBinary = fs.readFileSync(signedAppPath);

  logger.info('Start to deploy to airwatch..');

  // Step 1: Upload app as blob
  // TODO (sh): code refactor for options
  const uploadOptions = {
    headers: {
      'Content-Type': 'application/octet-stream',
      'aw-tenant-code': awKeyPairs[awKeys[2]],
      Accept: 'application/json',
    },
    auth: {
      user: awKeyPairs[awKeys[0]],
      password: awKeyPairs[awKeys[1]],
    },
    method: 'POST',
    uri: url.resolve(awHost, awUploadAPI),
    encoding: null,
    body: appBinary,
    qs: {
      filename: signedApp,
      organizationgroupid: awOrgID,
    },
  };

  try {
    const awUploadRes = await request(uploadOptions);

    // get the blob id:
    const blobID = JSON.parse(awUploadRes.toString()).Value;
    logger.info(`The blob id is ${blobID}`);

    // Step 2: Install app to an Organization Group
    const installOptions = {
      headers: {
        'content-type': 'application/json',
        'aw-tenant-code': awKeyPairs[awKeys[2]],
      },
      auth: {
        user: awKeyPairs[awKeys[0]],
        password: awKeyPairs[awKeys[1]],
      },
      method: 'POST',
      uri: url.resolve(awHost, awInstallAPI),
      body: {
        BlobId: blobID,
        DeviceType: deviceType,
        ApplicationName: applicationName,
        PushMode: 'OnDemand',
        SupportedModels: {
          Model: [{
            ModelId: modelId,
          }],
        },
      },
      json: true,
    };

    await request(installOptions);
    logger.info('Finished deploying to airwatch...');
    return signedAppPath;
  } catch (err) {
    const message = 'Unable to deploy to AirWatch';
    logger.error(`${message}, err = ${err.message}`);
  }

  return Promise.reject();
};
