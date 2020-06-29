//
// secure-code-sign
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
// Created by Jason Leach on 2018-05-31.
//

'use strict';

import cp from 'child_process';
import util from 'util';
// import fs from 'fs';
import path from 'path';
import shortid from 'shortid';

const file = {
  fieldname: 'file',
  originalname: 'IMG_0112.jpg',
  encoding: '7bit',
  mimetype: 'octet/binary',
  destination: 'uploads/',
  filename: '1f105fe3d6a937028056f545c83e13c0',
  path: 'uploads/1f105fe3d6a937028056f545c83e13c0',
  size: 2000636,
};

const main = async () => {
  try {
    const exec = util.promisify(cp.exec);
    const apath = path.join('work', shortid.generate());
    await exec(`
      mkdir -p ${apath} && \
      unzip -q ${file.path} -d ${apath}
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

    const items = [];
    const response = await Promise.all(promises);
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

    console.log('so far so good.');
  } catch (error) {
    console.log(error.message);
  }
};

main();
