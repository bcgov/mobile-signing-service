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

'use strict';

import cp from 'child_process';
import util from 'util';
import path from 'path';
import shortid from 'shortid';

const exec = util.promisify(cp.exec);

/**
 * Package a signed artifact for delivery into a ZIP.
 *
 * @param {string} archiveFilePath The path to the uploaded archive (ZIP)
 * @param {string} workspace The workspace to use
 * @returns A `string` containing the path to extracted contents
 */
const extractArchiveContents = async (archiveFilePath, workspace) => {
  const apath = path.join(workspace, shortid.generate());

  await exec(`
    mkdir -p ${apath} && \
    unzip -q ${archiveFilePath} -d ${apath}
  `);

  return apath;
};

/**
 * Package a signed artifact for delivery into a ZIP.
 *
 * @param {string} apath The path to the signed artifacts
 * @param {string} items The items to be included in the archive
 * @returns A `string` containing the path to the newly minted ZIP archive
 */
const packageForDelivery = async (apath, items) => {
  const fileName = `${shortid.generate()}.zip`;
  const zipResult = await exec(`
    cd ${apath} && \
    zip -6rq -n 'ipa' ${fileName} ${items.map(i => path.basename(i)).join(' ')} && \
    echo 'OK' || echo 'FAIL'
  `);

  if (zipResult.stderr !== '' || zipResult.stdout.includes('FAIL')) {
    throw new Error('Unable to create delivery package');
  }

  return Promise.resolve(path.join(apath, fileName));
};

/**
 * Sign an xcode xcarchive file.
 *
 * @param {string} archiveFilePath The path to the xcarchive file
 * @param {string} [workspace='/tmp/'] The workspace to use
 * @returns A `string` containing the path to the newly minted archive
 */
// eslint-disable-next-line import/prefer-default-export
export const signxcarchive = async (archiveFilePath, workspace = '/tmp/') => {
  try {
    const outputDir = 'signed';
    const apath = await extractArchiveContents(archiveFilePath, workspace);
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

    const deliveryFile = packageForDelivery(path.join(apath, outputDir), items);

    return deliveryFile;
  } catch (error) {
    console.log(error.message);
  }

  return Promise.reject();
};

/**
 * Sign an xcode ipa file.
 *
 * @param {string} archiveFilePath The path to the ipa file
 * @param {string} [workspace='/tmp/'] The workspace to use
 * @returns A `string` containing the path to the newly minted archive
 */
// eslint-disable-next-line no-unused-vars
export const signipaarchive = async (archiveFilePath, workspace = '/tmp/') => {
  throw new Error('Not Implemented');
};

/**
 * Sign an xcode ipa file.
 *
 * @param {string} archiveFilePath The path to the ipa file
 * @param {string} [workspace='/tmp/'] The workspace to use
 * @returns A `string` containing the path to the newly minted archive
 */
// eslint-disable-next-line no-unused-vars
export const signapkarchive = async (archiveFilePath, workspace = '/tmp/') => {
  throw new Error('Not Implemented');
};