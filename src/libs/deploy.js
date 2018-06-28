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

import * as minio from 'minio';
import fs from 'fs';
import cp from 'child_process';
import util from 'util';
import path from 'path';
import shortid from 'shortid';
import config from '../config';
import { getObject } from './bucket';
import { logger } from './logger';

const exec = util.promisify(cp.exec);
const writeFile = util.promisify(fs.writeFile);

const bucket = config.get('minio:bucket');
const client = new minio.Client({
  endPoint: config.get('minio:endPoint'),
  port: config.get('minio:port'),
  secure: config.get('minio:secure'),
  accessKey: config.get('minio:accessKey'),
  secretKey: config.get('minio:secretKey'),
  region: config.get('minio:region'),
});

/**
 * Get the signed appliaction package
 *
 * @param {String} appPath The path to the signed app
 * @returns The data stream of the signed app package
 */
const fetchFileFromStorage = async (signedAppPath) => {
  try {
    const buffer = await getObject(client, bucket, signedAppPath);
    if (!buffer) {
      throw errorWithCode('Unable to fetch archive.', 500);
    }
    logger.info(`Get the bucket ${bucket} `);
    return buffer;
  } catch (error) {
    const message = 'Unable to retrieve archive';
    logger.error(`${message}, err = ${error.message}`);
    throw error;
  }
};

/**
 * Google Edit for apk deployment
 *
 * @param {*} publisher The google android publisher
 * @param {String} editID A unique timestamp as a String
 * @param {*} signedAPK The signed android apk stored in minio
 * @param {String} trackType The track could be alpha, beta, production, rollout or internal.
 * @returns The status of the committed the Edit
 */
const googleDeployEdit = async (publisher, editID, signedAPK, trackType) => {
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
    const uploadedApk = await publisher.edits.apks.upload({
      editId: newEditID,
      media: {
        mimeType: 'application/vnd.android.package-archive',
        body: signedAPK,
      },
    });
    // Assign a track for the current Edit:
    await publisher.edits.tracks.update({
      editId: newEditID,
      track: trackType,
      body: {
        releases: [{
          name: 'CICD release',
          versionCodes: [uploadedApk.data.versionCode],
          status: 'completed',
        }],
      },
    });
    // Commit the Edit after all actions done:
    const commitEdit = await publisher.edits.commit({
      editId: newEditID,
    });
    return commitEdit.status;
  } catch (error) {
    throw error;
  }
};

/**
 * Google Play Store Deployment
 *
 * @param {String} signedAppPath The path to the signed app
 * @returns The status of the deployment
 */
// eslint-disable-next-line import/prefer-default-export
export const deployApk = async (signedAppPath) => {
  try {
    const signedAPK = await fetchFileFromStorage(signedAppPath);
  } catch (error) {
    throw new Error(`Unable to fetch file ${signedAppPath} from storage`);
  }
  // ---- TO BE UPDATED: Setup the Google OAuth and JWT for the Android Publisher, get from agent ----
  const key = require('../path/to/key.json');
  const apkName = 'the app bundle ID';
  const trackType = 'alpha';
  // ----
  const scopes = ['https://www.googleapis.com/auth/androidpublisher'];
  const editID = String(new Date().getTime()); // unique id using timestamp
  const oauth2Client = new google.auth.OAuth2();
  const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    scopes,
    null,
  );
  const publisher = google.androidpublisher({
    version: 'v3',
    auth: oauth2Client,
    params: {
      packageName: apkName,
    },
  });

  try {
    const token = await jwtClient.authorize();
    await oauth2Client.setCredentials(token);

    return googleDeployEdit(publisher, editID, signedAPK, trackType);
  } catch (error) {
    const message = 'Unable to deploy';
    logger.error(`${message}, err = ${error.message}`);
  }

  return Promise.reject();
};

