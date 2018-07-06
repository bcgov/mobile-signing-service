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

import { asyncMiddleware, errorWithCode, logger } from '@bcgov/common-nodejs';
import { Router } from 'express';
import DataManager from '../../libs/db';

const router = new Router();
const dm = new DataManager();
const {
  db,
  Job,
} = dm;

router.put('/:jobId', asyncMiddleware(async (req, res) => {
  const {
    jobId,
  } = req.params;
  const { job } = req.body;

  logger.info(`Updating status of job jobId = ${jobId}`);

  try {
    await Job.update(db, { id: jobId }, {
      deliveryFileName: job.deliveryFileName,
      deliveryFileEtag: job.deliveryFileEtag,
    });

    res.sendStatus(200).end();
  } catch (error) {
    const message = `Unable to update job ${job.id} status, error = ${error.message}`;
    logger.error(message);

    throw errorWithCode(message, 500);
  }
}));

module.exports = router;
