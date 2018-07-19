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

import * as minio from 'minio';
import url from 'url';
import request from 'request-promise-native';
import { Router } from 'express';
import {
  logger,
  createBucketIfRequired,
  bucketExists,
  isExpired,
  asyncMiddleware,
  errorWithCode,
} from '@bcgov/nodejs-common-utils';
import config from '../../config';
import DataManager from '../../libs/db';

const router = new Router();
const dm = new DataManager();
const {
  db,
  Job,
} = dm;
const bucket = config.get('minio:bucket');
const client = new minio.Client({
  endPoint: config.get('minio:endPoint'),
  port: config.get('minio:port'),
  secure: config.get('minio:secure'),
  accessKey: config.get('minio:accessKey'),
  secretKey: config.get('minio:secretKey'),
  region: config.get('minio:region'),
});

try {
  createBucketIfRequired(client, bucket);
} catch (err) {
  logger.error(`Problem creating bucket ${bucket}`);
}

// curl -X POST http://localhost:8080/api/v1/deploy/8?platform=android
// option 2: deployment platform = public/enterprise
router.post('/:jobId', asyncMiddleware(async (req, res) => {
  const {
    jobId,
  } = req.params;

  // and platform:
  const { platform } = req.query;
  const expirationInDays = config.get('expirationInDays');

  if (!bucketExists(client, bucket)) {
    throw errorWithCode('Unable to store attached file.', 500);
  }

  try {
    // Get object from db:
    logger.info(`Checking the package name from job ${jobId}`);

    const signJob = await Job.findById(db, jobId);

    if (!signJob) {
      throw errorWithCode('No such job', 404);
    }

    if (signJob && !signJob.deliveryFileName) {
      // The signing job was not successfully completed!
      throw errorWithCode('Cannot find a signed package with this job!', 404);
    }

    const stat = await client.statObject(bucket, `${signJob.deliveryFileName}`);

    if (isExpired(stat, expirationInDays)) {
      throw errorWithCode('This artifact is expired', 400);
    }

    // create a new deploy-job in db:
    // remember to add deployment platform!!!!!!
    const job = await Job.create(db, {
      originalFileName: signJob.deliveryFileName,
      platform: platform.toLocaleLowerCase(),
      originalFileEtag: signJob.etag,
    });
    logger.info(`Created deployment job with ID ${job.id}`);

    const options = {
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      uri: url.resolve(config.get('agent:hostUrl'), config.get('agent:deployPath')),
      body: { ...job, ...{ ref: `http://${config.get('host')}:${config.get('port')}/v1/job/${job.id}` } },
      json: true,
    };
    const status = await request(options);
    if (status !== 'OK') {
      throw errorWithCode(`Unable to send job ${job.id} to agent`, 500);
    }

    res.send(202).json({ id: job.id }); // Accepted
  } catch (error) {
    const message = 'Unable to create deployment job';
    logger.error(`${message}, err = ${error.message}`);
    throw errorWithCode(`${message}, err = ${error.message}`, 500);
  }
}));

module.exports = router;
