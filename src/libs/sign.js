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
// Created by Jason Leach on 2018-06-10.
//

/* eslint-env es6 */

'use strict';

import cp from 'child_process';
import util from 'util';
import path from 'path';
import shortid from 'shortid';

const exec = util.promisify(cp.exec);


/**
 * Helper function to wrap express rountes to handle rejected promises
 *
 * @param {Function} fn The `next()` function to call
 */
// eslint-disable-next-line import/prefer-default-export
export const signxcarchive = async (archiveFilePath, workspace = '/tmp/') => {
  try {
    const apath = path.join(workspace, shortid.generate());
    const outputDir = 'signed';

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
        -exportPath ${path.join(apath, outputDir, path.basename(element).split('.')[0])}  \
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

    const fileName = `${shortid.generate()}.zip`;
    const zipResult = await exec(`
      cd ${path.join(apath, outputDir)} && \
      zip -6rq -n 'ipa' ${fileName} ${items.map(i => path.basename(i)).join(' ')} && \
      echo 'OK' || echo 'FAIL'
    `);

    if (zipResult.stderr !== '' || zipResult.stdout.includes('FAIL')) {
      throw new Error('Unable to create delivery package');
    }

    return Promise.resolve(path.join(apath, outputDir, fileName));
  } catch (error) {
    console.log(error.message);
  }

  return Promise.reject();
};
