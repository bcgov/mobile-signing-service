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

import util from 'util';
import shortid from 'shortid';
import { Router } from 'express';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import config from '../../config';
import { logger } from '../../libs/logger';
import {
  asyncMiddleware,
  errorWithCode,
} from '../../libs/utils';
import { signipaarchive, signxcarchive } from '../../libs/sign';
import {
  putObject,
  createBucketIfRequired,
  bucketExists,
  statObject,
  getObject,
  isExpired,
} from '../../libs/bucket';
import DataManager from '../../libs/db';
import { JOB_STATUS } from '../../constants';

const bucket = config.get('minio:bucket');
const upload = multer({ dest: config.get('temporaryUploadPath') });
const router = new Router();
const dm = new DataManager();
const {
  db,
  Job,
} = dm;

try {
  createBucketIfRequired(bucket);
} catch (err) {
  logger.error(`Problem creating bucket ${bucket}`);
}

const cleanup = async (apath) => {
  const rm = util.promisify(fs.remove);
  try {
    await rm(apath);

    fs.access(apath, fs.constants.R_OK, (err) => {
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

const handleJob = async (job, clean = true) => {
  logger.info(`Processing job with ID ${job.id}`);

  try {
    let deliveryFile;
    switch (job.platform) {
      case 'ios':
      {
        const oname = job.originalName;
        if (path.extname(oname).includes('ipa')) {
          deliveryFile = await signipaarchive(job.archivePath);
        } else {
          // this is expected to be a zip file because an xcarchive is a
          // form of package on macOS
          deliveryFile = await signxcarchive(job.archivePath);
        }
        break;
      }
      case 'android':
        // deliveryFile = await signapkarchive(apath);
        break;
      default:
        throw new Error('Unsupported platform');
    }

    if (deliveryFile && clean) {
      // remove the temporary upload file.
      fs.unlinkSync(job.archivePath, (err) => {
        logger.error(`Unable to unlink upload file, error = ${err.message}`);
      });
    }

    const stream = fs.createReadStream(deliveryFile);
    const filename = path.basename(deliveryFile);
    const etag = await putObject(bucket, filename, stream);

    if (etag) {
      const message = 'Uploaded file for delivery';
      logger.info(`${message}, etag = ${etag}`);
    }

    await Job.update(db, { id: job.id }, { etag, delivery_file: filename });

    if (clean) {
      const basePath = path.dirname(deliveryFile);
      const message = 'Cleaned working directory';
      logger.info(`${message}, path = ${basePath}`);

      cleanup(basePath);
    }
  } catch (error) {
    const message = 'Unable to sign archive';
    logger.error(`${message}, err = ${error.message}`);
  }
};

router.post('/', upload.single('file'), asyncMiddleware(async (req, res) => {
  const { platform } = req.query;

  if (!req.file) {
    return res.status(400).json({ message: 'Unable to process attached form.' });
  }

  if (!bucketExists(bucket)) {
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

  const fpath = req.file.path;
  fs.access(fpath, fs.constants.R_OK, (err) => {
    if (err) {
      const message = 'Unable to access uploaded package';
      logger.error(message);
      return res.status(500).json({ message });
    }

    return null;
  });

  const id = shortid.generate();
  const job = await Job.create(db, {
    id,
    original_name: req.file.originalname,
    platform: platform.toLocaleLowerCase(),
    archive_path: fpath,
  });
  logger.info(`Created job with ID ${job.id}`);

  res.status(202).json({ id }); // Accepted

  await handleJob(job);

  return null;
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
      url: `http://localhost:8000/v1/sign/${job.id}/download`,
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
    const stat = await statObject(bucket, `${job.deliveryFile}`);

    if (isExpired(stat, expirationInDays)) {
      throw errorWithCode('This artifact is expired', 400);
    }

    const buffer = await getObject(bucket, job.deliveryFile);

    if (!buffer) {
      throw errorWithCode('Unable to fetch archive.', 500);
    }

    res.contentType(stat.contentType);

    logger.info(`Download album ZIP archive from bucket ${bucket}, object ${job.deliveryFile}`);

    res.end(buffer, 'binary');
  } catch (error) {
    const message = 'Unable to retrieve archive';
    logger.error(`${message}, err = ${error.message}`);
  }
}));

module.exports = router;
