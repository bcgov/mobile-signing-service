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

import { asyncMiddleware, errorWithCode, logger } from '@bcgov/common-nodejs-utils';
import { Router } from 'express';
import url from 'url';
import config from '../../config';
import { JOB_STATUS } from '../../constants';
import DataManager from '../../libs/db';

const router = new Router();
const dm = new DataManager();
const { db, Job } = dm;

router.put(
  '/:jobId',
  asyncMiddleware(async (req, res) => {
    const { jobId } = req.params;
    const { job } = req.body;

    if (!jobId || !job) {
      throw errorWithCode('Required parameters missing', 400);
    }

    // if the job has error message, then log; else check for delivery file info:
    if (job.errmsg) {
      logger.error(`Job ${jobId} failed due to: ${job.errmsg}`);
    } else if (
      !Object.prototype.hasOwnProperty.call(job, 'deliveryFileName') ||
      !Object.prototype.hasOwnProperty.call(job, 'deliveryFileEtag')
    ) {
      throw errorWithCode('Required job properties', 400);
    }

    logger.info(`Updating status of job jobId = ${jobId}`);
    try {
      await Job.update(
        db,
        { id: jobId },
        {
          deliveryFileName: job.deliveryFileName || null,
          deliveryFileEtag: job.deliveryFileEtag || null,
          status: job.status,
          statusMessage: job.message || null,
        }
      );

      res.sendStatus(200).end();
    } catch (error) {
      const message = `Unable to update job ${job.id} status, error = ${error.message}`;
      logger.error(message);

      throw errorWithCode(message, 500);
    }
  })
);

router.get(
  '/:jobId/status',
  asyncMiddleware(async (req, res) => {
    const { jobId } = req.params;

    logger.info(`Checking status of job ${jobId}`);

    const job = await Job.findById(db, jobId);
    if (!job) {
      throw errorWithCode('No such job', 404);
    }

    try {
      if (job && (job.status === JOB_STATUS.CREATED || job.status === JOB_STATUS.PROCESSING)) {
        // The request has been accepted for processing,
        // but the processing has not been completed.
        return res.status(202).json({
          status: job.status,
          statusMessage: job.statusMessage,
        });
      }

      const deliveryUrl = url.resolve(config.get('apiUrl'), `/api/v1/delivery/${job.id}`);

      return res.status(200).json({
        status: job.status,
        statusMessage: job.statusMessage || null,
        url: `${deliveryUrl}?token=${job.token}`,
        durationInSeconds: job.duration,
      });
    } catch (error) {
      const message = `Unable to retrieve job with ID ${jobId}`;
      logger.error(`${message}, err = ${error.message}`);
      throw errorWithCode(`${message}, err = ${error.message}`, 500);
    }
  })
);

module.exports = router;
