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

import { logger } from '@bcgov/nodejs-common-utils';
import cp from 'child_process';
import util from 'util';
import path from 'path';
import shortid from 'shortid';

const exec = util.promisify(cp.exec);

// eslint-disable-next-line import/prefer-default-export
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

    const promises = findResult.stdout
      .trim()
      .split('\n')
      .map(async element =>
        exec(`
        xcodebuild \
        -exportArchive \
        -archivePath ${element} \
        -exportPath ${path.join(apath, 'signed', path.basename(element).split('.')[0])}  \
        -exportOptionsPlist ${path.join(apath, 'options.plist')} 
      `)
      );

    const response = await Promise.all(promises);

    const items = [];
    response.forEach(value => {
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
    logger.error(error.message);
  }

  return Promise.reject();
};

/**
 * Fetch the values from keychain
 *
 * @param {object} keyNames The names of target keys in keychain
 * @param {string} keyAccount The account registered with the keys
 * @returns An object with the keychain name:value pairs
 */
export const fetchKeychainValue = async (keyNames, keyAccount) => {
  try {
    const keyPairs = await keyNames.reduce(async (accumulator, currentValue) => {
      const keyValue = {};

      // use macos security to fetch keychain value:
      let result = await exec(`security find-generic-password -w -s ${currentValue} -a ${keyAccount}`);
      result = result.stdout.trim().split('\n');

      const tmp = result[0];
      keyValue[currentValue] = tmp;

      return { ...(await accumulator), ...keyValue };
    }, {});

    return keyPairs;
  } catch (error) {
    throw new Error(`Unable to find the keychain! ${error}`);
  }
};

/**
 * Check if the object is empty
 *
 * @param {object} obj The object to be checked
 * @returns Boolean
 */
export const isEmpty = obj => {
  let result = true;
  if (obj === null) {
    return result;
  }

  Object.keys(obj).forEach(key => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) result = false;
  });

  return result;
};
