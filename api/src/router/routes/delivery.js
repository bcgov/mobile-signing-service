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

import { asyncMiddleware, errorWithCode, getObject, isExpired, logger, statObject } from '@bcgov/common-nodejs-utils';
import { Router } from 'express';
import { PassThrough } from 'stream';
import config from '../../config';
import DataManager from '../../libs/db';
import shared from '../../libs/shared';

const router = new Router();
const dm = new DataManager();
const { db, Job } = dm;
const bucket = config.get('minio:bucket');

router.get(
  '/:jobId',
  asyncMiddleware(async (req, res) => {
    const { jobId } = req.params;
    const { token } = req.query;
    const expirationInDays = config.get('expirationInDays');

    try {
      const job = await Job.findById(db, jobId);
      const stat = await statObject(shared.minio, bucket, job.deliveryFileName);

      if (!token || job.token !== token) {
        throw errorWithCode('You are not able to download this artifact', 400);
      }

      if (isExpired(stat, expirationInDays)) {
        throw errorWithCode('This artifact is expired', 400);
      }

      const [name] = job.originalFileName.split('.');
      const obj = await getObject(shared.minio, bucket, job.deliveryFileName);
      const bstream = new PassThrough();
      bstream.end(obj);

      res.set({
        'Content-Disposition': `attachment;filename=${name}-signed.zip`,
        'Content-Type': 'application/zip',
        'Content-Length': obj.byteLength,
      });

      bstream.pipe(res);
    } catch (error) {
      const message = `Unable to retrieve archive for job with ID ${jobId}`;
      logger.error(`${message}, err = ${error.message}`);

      if (error.code) {
        throw error;
      }

      throw errorWithCode(`${message}, err = ${error.message}`, 500);
    }
  })
);

module.exports = router;
