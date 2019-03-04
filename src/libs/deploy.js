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

import { getObject, logger } from '@bcgov/common-nodejs-utils';
import cp from 'child_process';
import fs from 'fs';
import { google } from 'googleapis';
import path from 'path';
import request from 'request-promise-native';
import shortid from 'shortid';
import url from 'url';
import util from 'util';
import xml2js from 'xml2js';
import config from '../config';
import { AW, PACKAGE_FORMAT } from '../constants';
import shared from './shared';
import { fetchKeychainValue } from './utils';

const exec = util.promisify(cp.exec);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFileSync);
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
 * Parse the error message from apple application loader
 *
 * @param {String} altoolError The error message from altool stdout
 * @returns The bundle ID
 */
const handleAltoolErrorResponse = async altoolError => {
  try {
    // Use xml parser to read error message from altool, at specific path:
    const parser = new xml2js.Parser();
    const parseString = util.promisify(parser.parseString);
    const result = parseString(altoolError);
    const errorMessages = result.plist.dict[0].array[0].dict[0].string;
    throw errorMessages;
  } catch (error) {
    throw new Error(error);
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
export const deployToGooglePlayStore = async (signedApp, workspace = '/tmp/') => {
  try {
    // Get apk:
    const signedApkPath = await fetchFileFromStorage(signedApp, workspace);
    // Get the bundle ID for the apk:
    const apkBundleId = await getApkBundleID(signedApkPath);
    // Turn data stream into a package-archive file for deployment:
    const signedAPK = await readFile(signedApkPath);
    // Get the Google client-service key to deployment:
    const keyFull = await exec(`security find-generic-password -w -s deployKey -a ${apkBundleId}`);
    const keyPath = keyFull.stdout.trim().split('\n');
    const key = JSON.parse(await readFile(keyPath));

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
 * App Store Deployment
 *
 * @param {String} signedApp The name of the signed app, ONLY accepts .ipa / .pkg format
 * @param {string} [workspace='/tmp/'] The workspace to use
 * @returns The status of the deployment
 */
// eslint-disable-next-line import/prefer-default-export
export const deployToiTunesStore = async (signedApp, workspace = '/tmp/') => {
  try {
    // Get app binary:
    const signedAppPath = await fetchFileFromStorage(signedApp, workspace);
    const signedAPP = fs.readFileSync(signedAppPath);

    // Get altool access:
    // This array serves as the constant key names
    const iosKeys = ['appleAccount', 'appleKey'];
    const iosKeyPairs = await fetchKeychainValue(iosKeys, 'altool');

    // Step 1. Use altool to validate the app:
    // TODO: (sh) only accepting iOS apps, could provide more option for tvOS, OS X and macOS apps
    await exec(`
    xcrun altool --validate-app \
    -t ios \
    -f ${signedAPP} \
    -u ${iosKeyPairs[iosKeys[0]]} \
    -p ${iosKeyPairs[iosKeys[1]]} \
    --output-format xml`);

    // Step 2. Use altool to upload the app to Apple Store Connect:
    await exec(`
    xcrun altool --upload-app \
    -t ios \
    -f ${signedAPP} \
    -u ${iosKeyPairs[iosKeys[0]]} \
    -p ${iosKeyPairs[iosKeys[1]]} \
    --output-format xml`);

    return signedAppPath;
  } catch (err) {
    if (err.stdout) {
      // only altool's error has stdout
      await handleAltoolErrorResponse(err.stdout);
    }

    throw err;
  }
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
export const deployToAirWatch = async (signedApp, platform, awOrgID, awFileName, workspace = '/tmp/') => {
  // The urls for airwatch api:
  const awHost = config.get('airwatch:host');
  const awUploadAPI = config.get('airwatch:upload');
  const awInstallAPI = config.get('airwatch:install');
  const awAccountName = config.get('airwatch:account');

  // TODO: (sh) Update the user account to a device-account:
  // This array serves as the constant key names
  const awKeys = ['awUsername', 'awPassword', 'awCode'];
  const awKeyPairs = await fetchKeychainValue(awKeys, awAccountName);

  /*
  TODO:(sh) Move these to constant
  Values for airwatch api v8_1:
    DeviceType: android -> '5'; Apple -> '2'
    ModelId: android -> 5; iPhone -> 1; iPad -> 2
    ApplicationName: android -> apk; Apple -> ipa
  */

  let deviceType = AW.AW_DEVICE_TYPES.UNKNOWN;
  let applicationName = '';
  let modelId = AW.AW_DEVICE_MODELS.UNKNOWN;

  switch (platform) {
    case 'ios': {
      applicationName = awFileName + PACKAGE_FORMAT.IOS;
      deviceType = AW.AW_DEVICE_TYPES.IPHONE;
      modelId = AW.AW_DEVICE_MODELS.IOS;
      break;
    }
    case 'android': {
      applicationName = awFileName + PACKAGE_FORMAT.ANDROID;
      deviceType = AW.AW_DEVICE_TYPES.ANDROID;
      modelId = AW.AW_DEVICE_MODELS.ANDROID;
      break;
    }
    default:
      throw new Error('Unsupported application type for airWatch deployment');
  }

  // Get app binary:
  const signedAppPath = await fetchFileFromStorage(signedApp, workspace);
  const appBinary = fs.readFileSync(signedAppPath);

  logger.info('Start to deploy to airwatch..');

  // Step 1: Upload app as blob
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
          Model: [
            {
              ModelId: modelId,
            },
          ],
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
