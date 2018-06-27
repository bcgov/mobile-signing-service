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
import fs from 'fs';
import util from 'util';
import request from 'request-promise-native';
import { Router } from 'express';
import multer from 'multer';
import config from '../../config';
import { logger } from '../../libs/logger';
import {
  asyncMiddleware,
  errorWithCode,
  cleanup,
} from '../../libs/utils';
import {
  createBucketIfRequired,
  bucketExists,
  putObject,
  isExpired,
  getPresignedUrl,
} from '../../libs/bucket';
import DataManager from '../../libs/db';
import { JOB_STATUS } from '../../constants';

const router = new Router();
const dm = new DataManager();
const {
  db,
  Job,
} = dm;
const upload = multer({ dest: config.get('temporaryUploadPath') });
const bucket = config.get('minio:bucket');
const client = new minio.Client({
  endPoint: config.get('minio:host'),
  port: config.get('minio:port'),
  secure: config.get('minio:secure'),
  accessKey: config.get('minio:accessKey'),
  secretKey: config.get('minio:secretKey'),
  region: config.get('minio:region'),
});

createBucketIfRequired(client, bucket)
  .then(() => logger.info(`Created bucket ${bucket}`))
  .catch((error) => {
    logger.error(error.message);
  });

router.post('/', upload.single('file'), asyncMiddleware(async (req, res) => {
  const { platform } = req.query;

  if (!req.file) {
    return res.status(400).json({ message: 'Unable to process attached form.' });
  }

  if (!bucketExists(client, bucket)) {
    return res.status(500).json({ message: 'Unable to store attached file.' });
  }

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
    const fpath = req.file.path;
    fs.access(fpath, fs.constants.R_OK, (err) => {
      if (err) {
        const message = 'Unable to access uploaded package';
        logger.error(message);
        return res.status(500).json({ message });
      }

      return null;
    });

    const readStream = fs.createReadStream(req.file.path);
    const etag = await putObject(client, bucket, req.file.originalname, readStream);
    if (etag) {
      await cleanup(req.file.path);
    }

    const job = await Job.create(db, {
      originalFileName: req.file.originalname,
      platform: platform.toLocaleLowerCase(),
      originalFileEtag: etag,
    });
    logger.info(`Created job with ID ${job.id}`);

    const options = {
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      uri: url.resolve(config.get('agent:hostUrl'), config.get('agent:signPath')),
      body: { ...job, ...{ ref: url.resolve(config.get('apiUrl'), `/api/v1/job/${job.id}`) } },
      json: true,
    };

    const status = await request(options);
    if (status !== 'OK') {
      throw errorWithCode(`Unable to send job ${job.id} to agent`, 500);
    }

    res.send(202).json({ id: job.id }); // Accepted

    return null;
  } catch (error) {
    const message = 'Unable to create signing job';
    logger.error(`${message}, err = ${error.message}`);
    throw errorWithCode(`${message}, err = ${error.message}`, 500);
  }
}));

router.get('/:jobId/status', asyncMiddleware(async (req, res) => {
  const {
    jobId,
  } = req.params;

  try {
    logger.info(`Checking status of job ${jobId}`);

    const job = await Job.findById(db, jobId);
    if (!job) {
      throw errorWithCode('No such job', 404);
    }

    if (job && !job.deliveryFile) {
      // The request has been accepted for processing,
      // but the processing has not been completed.
      return res.status(202).json({
        status: JOB_STATUS.PROCESSING,
      });
    }

    return res.json({
      status: JOB_STATUS.COMPLETED,
      url: `http://localhost:8000/v1/job/${job.id}/download`,
      durationInSeconds: job.duration,
    });
  } catch (error) {
    const message = `Unable to retrieve job with ID ${jobId}`;
    logger.error(`${message}, err = ${error.message}`);
    throw errorWithCode(`${message}, err = ${error.message}`, 500);
  }
}));

router.get('/:jobId/download', asyncMiddleware(async (req, res) => {
  const { jobId } = req.params;
  const expirationInDays = config.get('expirationInDays');

  try {
    const job = await Job.findById(db, jobId);
    const statObject = util.promisify(client.statObject);
    const stat = await statObject(bucket, `${job.deliveryFile}`);

    if (isExpired(stat, expirationInDays)) {
      throw errorWithCode('This artifact is expired', 400);
    }

    const link = await getPresignedUrl(client, bucket, job.deliveryFile);
    res.redirect(link);
  } catch (error) {
    const message = 'Unable to retrieve archive';
    logger.error(`${message}, err = ${error.message}`);
  }
}));

module.exports = router;
