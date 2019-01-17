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
// Created by Jason Leach on 2018-05-19.
//

'use strict';

import {
  isExpired,
  listBucket,
  logger,
  removeObject,
  statObject,
} from '@bcgov/nodejs-common-utils';
import * as minio from 'minio';
import config from '../src/config';

const bucket = config.get('minio:bucket');
const fileExpirationInDays = config.get('expirationInDays');

const main = async () => {
  try {
    const client = new minio.Client({
      endPoint: config.get('minio:host'),
      port: config.get('minio:port'),
      useSSL: config.get('minio:useSSL'),
      accessKey: config.get('minio:accessKey'),
      secretKey: config.get('minio:secretKey'),
      region: config.get('minio:region'),
    });

    const prefix = '';
    const contents = await listBucket(client, bucket, prefix);
    const objectStats = contents.map(async e => [
      await statObject(client, bucket, e.name),
      { prefix: e.name },
    ]);

    const results = (await Promise.all(objectStats))
      .map(i => {
        const [a, b] = i;
        return { ...a, ...b };
      })
      .filter(i => isExpired(i, fileExpirationInDays))
      .map(o => removeObject(client, bucket, o.prefix));

    await Promise.all(results);

    if (results.length === 0) {
      logger.info('No objects to prune.');
    } else {
      logger.info(`Pruned ${results.length} objects.`);
    }

    process.exit();
  } catch (error) {
    const message = 'There was a error pruning objects';
    logger.error(`${message}, err = ${error.message}`);

    process.exit(1);
  }
};

main();
