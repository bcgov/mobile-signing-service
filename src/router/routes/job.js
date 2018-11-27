//
// SecureImage
//
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
//
// Created by Jason Leach on 2018-01-10.
//

/* eslint-env es6 */

'use strict';

import { logger, asyncMiddleware, errorWithCode, putObject } from '@bcgov/nodejs-common-utils';
import request from 'request-promise-native';
import util from 'util';
import { Router } from 'express';
import fs from 'fs-extra';
import path from 'path';
import config from '../../config';
import shared from '../../libs/shared';
import { signipaarchive, signxcarchive, signapkarchive } from '../../libs/sign';
import { deployToGooglePlayStore, deployToAirWatch, deployToiTunesStore } from '../../libs/deploy';
import { JOB_STATUS } from '../../constants';
import { isEmpty } from '../../libs/utils';

const router = new Router();
const bucket = config.get('minio:bucket');

/**
 * Cleanup artifacts left over from the signing process
 *
 * @param {*} apath The locaton of the artifacts
 */
const cleanup = async apath => {
  const rm = util.promisify(fs.remove);
  try {
    await rm(apath);

    fs.access(apath, fs.constants.R_OK, err => {
      if (!err) {
        const message = 'Path exists after cleanup.';
        logger.error(message);

        throw new Error(message);
      }

      return null;
    });
  } catch (error) {
    const message = 'Unable to clean path.';
    logger.error(message);

    throw error;
  }
};

const reportJobStatus = async job => {
  const options = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await shared.sso.accessToken}`,
    },
    method: 'PUT',
    uri: job.ref,
    body: { job },
    json: true,
  };

  try {
    const status = await request(options);
    if (status !== 'OK') {
      logger.error(`Unable to report job ${job.id} status`);
      return;
    }

    logger.info(`Updated status for job ${job.id}`);
  } catch (err) {
    const message = `Unable to report job ${job.id} status`;
    logger.error(`${message}, err = ${err.message}`);
  }
};

/**
 * Call the corresponding deployment method based on the deployment platform
 *
 * @param {String} deployPlatform The deployment platform, ios/android
 * @param {String} fileName The file to be deployed
 */
const selectDeploymentPath = async (deployPlatform, fileName) => {
  try {
    switch (deployPlatform) {
      case 'ios': {
        return await deployToiTunesStore(fileName);
      }
      case 'android': {
        return await deployToGooglePlayStore(fileName);
      }
      default:
        throw new Error('Unsupported application type');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Start processing a signing `Job`
 *
 * @param {Job} job The `Job` to process
 * @param {boolean} [clean=true] Cleanup after processing is done
 */
const handleJob = async (job, clean = true) => {
  logger.info(`Processing job with ID ${job.id}`);

  try {
    let deliveryFile;
    switch (job.platform) {
      case 'ios': {
        const oname = job.originalFileName;
        if (path.extname(oname).includes('ipa')) {
          deliveryFile = await signipaarchive(oname);
        } else {
          // this is expected to be a zip file because an xcarchive is a
          // form of package on macOS
          deliveryFile = await signxcarchive(oname);
        }
        break;
      }
      case 'android':
        deliveryFile = await signapkarchive(job.originalFileName);
        break;
      default:
        throw new Error('Unsupported platform');
    }

    const readStream = fs.createReadStream(deliveryFile);
    const filename = path.basename(deliveryFile);
    const etag = await putObject(shared.minio, bucket, filename, readStream, undefined);

    if (etag) {
      const message = 'Uploaded file for delivery';
      logger.info(`${message}, etag = ${etag}`);
    }

    if (clean) {
      const basePath = path.dirname(deliveryFile);
      const workSpace = path.dirname(basePath);
      const message = 'Cleaned working directory';
      logger.info(`${message}, path = ${workSpace}`);

      cleanup(workSpace);
    }
    // Instead of updating the job, return a job object with delivery file info:
    return {
      ...job,
      ...{ deliveryFileName: filename, deliveryFileEtag: etag, status: JOB_STATUS.COMPLETED },
    };
  } catch (error) {
    const message = 'Unable to sign archive';
    logger.error(`${message}, err = ${error.message}`);
    // Instead of throwing an error, return a job object with error message:
    return {
      ...job,
      ...{ status: JOB_STATUS.FAILED, message: error.message },
    };
  }
};

/**
 * Start processing a deployment `Job`
 *
 * @param {Job} job The `Job` to process
 * @param {boolean} [clean=true] Cleanup after processing is done
 */
const handleDeploymentJob = async (job, clean = true) => {
  logger.info(`Processing job with ID ${job.id}`);

  try {
    let deployedAppPath;

    switch (job.deploymentPlatform) {
      // Enterprise deployment refer to Airwatch:
      case 'enterprise': {
        deployedAppPath = await deployToAirWatch(
          job.originalFileName,
          job.platform,
          job.awOrgID,
          job.awFileName
        ); // Pass in extra parameters for AW
        break;
      }
      // Public deployment refer to Apple or Google Store, depends on application type:
      case 'public': {
        deployedAppPath = await selectDeploymentPath(job.platform, job.originalFileName);
        break;
      }
      default:
        throw new Error('Unsupported deployment platform');
    }

    if (clean) {
      const workSpace = path.dirname(deployedAppPath);
      const message = 'Cleaned working directory';
      logger.info(`${message}, path = ${workSpace}`);

      cleanup(workSpace);
    }

    // No need to update the deployment job.
  } catch (error) {
    const message = 'Unable to deploy app';
    logger.error(`${message}, err = ${error.message}`);

    throw new Error(`${message}, err = ${error.message}`);
  }
};

// create a new job
router.post(
  '/sign',
  asyncMiddleware(async (req, res) => {
    const job = req.body;

    if (!job || isEmpty(job)) {
      throw errorWithCode('No such job exists', 400);
    }

    res.sendStatus(200).end();

    try {
      // result is the updated job object:
      const result = await handleJob(job);
      await reportJobStatus(result);
    } catch (signErr) {
      const signMessage = 'Unable to sign job';
      logger.error(`${signMessage}, err = ${signErr.message}`);

      await reportJobStatus({
        ...job,
        ...{
          status: JOB_STATUS.FAILED,
          message: signErr.message,
        },
      });
    }
  })
);

// create a new job for Deployment:
router.post(
  '/deploy',
  asyncMiddleware(async (req, res) => {
    const job = req.body;

    if (!job || isEmpty(job)) {
      throw errorWithCode('No such job exists', 400);
    }

    if (!job.platform || !job.deploymentPlatform) {
      throw errorWithCode('Missing platforms', 400);
    }

    res.sendStatus(200).end();

    await handleDeploymentJob(job);
  })
);

module.exports = router;
