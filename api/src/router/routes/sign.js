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

import { asyncMiddleware, errorWithCode, logger, putObject } from '@bcgov/common-nodejs-utils';
import crypto from 'crypto';
import { Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import request from 'request-promise-native';
import url from 'url';
import config from '../../config';
import { JOB_STATUS } from '../../constants';
import DataManager from '../../libs/db';
import shared from '../../libs/shared';
import { cleanup } from '../../libs/utils';

const router = new Router();
const dm = new DataManager();
const { db, Job } = dm;
const upload = multer({ dest: config.get('temporaryUploadPath') });
const bucket = config.get('minio:bucket');

router.post(
  '/',
  upload.single('file'),
  asyncMiddleware(async (req, res) => {
    const { platform } = req.query;

    if (!platform || !['ios', 'android'].includes(platform.toLocaleLowerCase())) {
      throw errorWithCode('Invalid platform parameter.', 400);
    }

    if (!req.file) {
      throw errorWithCode('To file attachment found.', 400);
    }

    logger.info(`API received file`);

    /* This is the document format from multer:
  {
    destination: "uploads"
    encoding: "7bit",
    fieldname: "file",
    filename: "77ab791eb4af8f823c8d783fec03b7af",
    mimetype: "application/octet-stream",
    originalname: "SecureImage-20180531.zip",
    path: "uploads/77ab791eb4af8f823c8d783fec03b7af",
    size: 163501760,
  }
  */

    try {
      logger.info(`Uploading ${req.file.path} to bucket`);

      const fpath = req.file.path;
      fs.access(fpath, fs.constants.R_OK, err => {
        if (err) {
          const message = 'Unable to access uploaded package';
          logger.error(`${message}, , error = ${err.message}`);
          throw errorWithCode(message, 501);
        }
      });

      const readStream = fs.createReadStream(req.file.path);
      // readStream.on('end', () => readStream.destroy());
      const etag = await putObject(shared.minio, bucket, req.file.originalname, readStream);
      // readStream.destroy();

      if (etag) {
        logger.info(`Uploaded complete, etag = ${etag}`);

        // Don't let a failed cleanup disrupt the workflow.
        try {
          await cleanup(req.file.path);
        } catch (err) {
          const message = `Unable to cleanup file ${req.file.path}`;
          logger.error(`${message}, err = ${err.message}`);
        }
      }

      logger.info(`Recording job in db`);

      const job = await Job.create(db, {
        originalFileName: req.file.originalname,
        platform: platform.toLocaleLowerCase(),
        originalFileEtag: etag,
        token: crypto.randomBytes(8).toString('hex'),
        status: JOB_STATUS.CREATED,
      });

      logger.info(`Recorded job, ID = ${job.id}`);

      logger.info(`Triggering signing on Agent for job ID ${job.id}`);

      const options = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await shared.sso.accessToken}`,
        },
        method: 'POST',
        uri: url.resolve(config.get('agent:hostUrl'), config.get('agent:signPath')),
        body: { ...job, ...{ ref: url.resolve(config.get('apiUrl'), `/api/v1/job/${job.id}`) } },
        json: true,
      };
      const status = await request(options);

      if (status !== 'OK') {
        throw errorWithCode(`Unable to send job ${job.id} to agent`, 500);
      }

      logger.info(`Signing job ${job.id} accepted by Agent`);

      logger.info(`Updating job ${job.id} status in db`);

      await Job.update(
        db,
        { id: job.id },
        {
          status: JOB_STATUS.PROCESSING,
        }
      );

      logger.info(`Sending response to client for job ID ${job.id}`);

      res.status(202).json({ id: job.id }); // Accepted

      logger.info('Done');
    } catch (err) {
      const message = 'Unable to create signing job';
      logger.error(`${message}, err = ${err.message}`);

      if (err.code) {
        throw err;
      }

      throw errorWithCode(`${message}, err = ${err.message}`, 500);
    }
  })
);

module.exports = router;
