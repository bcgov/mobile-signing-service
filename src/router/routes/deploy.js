//
// Code Signing
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

// eslint-disable-next-line object-curly-newline
import {
  asyncMiddleware,
  bucketExists,
  errorWithCode,
  isExpired,
  logger,
  statObject,
} from '@bcgov/nodejs-common-utils';
import { Router } from 'express';
import request from 'request-promise-native';
import url from 'url';
import config from '../../config';
import DataManager from '../../libs/db';
import shared from '../../libs/shared';

const router = new Router();
const dm = new DataManager();
const { db, Job } = dm;
const bucket = config.get('minio:bucket');

router.post(
  '/:jobId',
  asyncMiddleware(async (req, res) => {
    const { jobId } = req.params;

    const { deploymentPlatform } = req.query;
    const expirationInDays = config.get('expirationInDays');

    if (!bucketExists(shared.minio, bucket)) {
      throw errorWithCode('Unable to store or accesss attached file.', 500);
    }

    if (!jobId || !deploymentPlatform) {
      throw errorWithCode('Required parameters missing', 400);
    }

    try {
      // Get object from db:
      logger.info(`Checking the package name from job ${jobId}`);

      const signedJob = await Job.findById(db, jobId);

      if (!signedJob) {
        throw errorWithCode('No such job', 404);
      }

      if (signedJob && !signedJob.deliveryFileName) {
        // The signing job was not successfully completed!
        throw errorWithCode('Cannot find a signed package with this job!', 404);
      }

      const stat = await statObject(shared.minio, bucket, signedJob.deliveryFileName);

      if (isExpired(stat, expirationInDays)) {
        throw errorWithCode('This artifact is expired', 400);
      }

      // create a new deployment job in db:
      const job = await Job.create(db, {
        originalFileName: signedJob.deliveryFileName,
        platform: signedJob.platform.toLocaleLowerCase(),
        originalFileEtag: signedJob.etag,
        deploymentPlatform: deploymentPlatform.toLocaleLowerCase(),
      });

      logger.info(`Created deployment job with ID ${job.id}`);

      const options = {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        uri: url.resolve(config.get('agent:hostUrl'), config.get('agent:deployPath')),
        body: {
          ...job,
          ...{ ref: `http://${config.get('host')}:${config.get('port')}/v1/job/${job.id}` },
        },
        json: true,
      };
      const status = await request(options);
      if (status !== 'OK') {
        throw errorWithCode(`Unable to send job ${job.id} to agent`, 500);
      }

      res.status(202).json({ id: job.id }); // Accepted
    } catch (error) {
      const message = 'Unable to create deployment job';
      logger.error(`${message}, err = ${error.message}`);
      throw errorWithCode(`${message}, err = ${error.message}`, 500);
    }
  })
);

module.exports = router;
