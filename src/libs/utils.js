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

'use strict';

import fs from 'fs-extra';
import cp from 'child_process';
import util from 'util';
import path from 'path';
import shortid from 'shortid';

const exec = util.promisify(cp.exec);

/**
 * Check if a string consits of [Aa-Az], [0-9], -, _, and %.
 *
 * @param {String} message The error message
 * @param {Number} code    The error code (property)
 * @returns An `Error` object with the message and code set
 */
export const errorWithCode = (message, code) => {
  const error = new Error(message);
  error.code = code;

  return error;
};

/**
 * Helper function to wrap express rountes to handle rejected promises
 *
 * @param {Function} fn The `next()` function to call
 */
export const asyncMiddleware = fn =>
  // Make sure to `.catch()` any errors and pass them along to the `next()`
  // middleware in the chain, in this case the error handler.
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

export const signxcarchive = async (archiveFilePath, workspace = '/tmp/') => {
  try {
    const apath = path.join(workspace, shortid.generate());

    await exec(`
      mkdir -p ${apath} && \
      unzip -q ${archiveFilePath} -d ${apath}
    `);

    const findResult = await exec(`find ${apath} -iname '*.xcarchive'`);
    if (findResult.stderr !== '') {
      throw new Error('Unable to find xcarchive(s) in package');
    }

    const promises = findResult.stdout.trim().split('\n').map(async element =>
      exec(`
        xcodebuild \
        -exportArchive \
        -archivePath ${element} \
        -exportPath ${path.join(apath, 'signed', path.basename(element).split('.')[0])}  \
        -exportOptionsPlist ${path.join(apath, 'options.plist')} 
      `));

    const response = await Promise.all(promises);

    const items = [];
    response.forEach((value) => {
      const { stdout } = value;
      if (stdout.includes('EXPORT SUCCEEDED')) {
        const lines = stdout.trim().split('\n');
        const components = lines[0].split(' ');
        if (components.length !== 4) {
          throw new Error('Unexpected response from archive export');
        }

        items.push(components.pop());
      }
    });

    const deliveryFile = path.join(apath, `${shortid.generate()}.zip`);
    const zipResult = await exec(`
      zip -6rq -n 'ipa' ${deliveryFile} ${items} && \
      echo 'OK' || echo 'FAIL'
    `);

    if (zipResult.stderr !== '' || zipResult.stdout.includes('FAIL')) {
      throw new Error('Unable to create delivery package');
    }

    return Promise.resolve(deliveryFile);
  } catch (error) {
    console.log(error.message);
  }

  return Promise.reject();
};

/**
 * Cleanup artifacts left over from the signing process
 *
 * @param {*} apath The locaton of the artifacts
 */
export const cleanup = async (apath) => {
  const rm = util.promisify(fs.remove);
  try {
    await rm(apath);

    fs.access(apath, fs.constants.R_OK, (err) => {
      if (!err) {
        const message = `Path exists after cleanup, err = ${err.message}`;
        throw new Error(message);
      }

      return null;
    });
  } catch (err) {
    const message = `Unable to clean path, err = ${err.message}`;
    throw new Error(message);
  }
};
