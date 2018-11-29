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

import fs from 'fs';
import path from 'path';
import { parseXcodebuildError, parseApksignerbuildError } from '../src/libs/sign';

const p0 = path.join(__dirname, 'fixtures/xcarchive-fail.txt');
const xcodeBuildError = fs.readFileSync(p0, 'utf8');

describe('Signing helper functions', () => {
  test('An xcode build error is correctly parsed', async () => {
    const aResponse = `Couldn't load -exportOptionsPlist: The file “options.plist” couldn’t be opened because there is no such file.`;
    const message = parseXcodebuildError(xcodeBuildError);

    expect(message).toBe(aResponse);
  });

  test('An apksigner build error is correctly parsed', async () => {
    const signerFailErr = 'Keystore was tampered with, or password was incorrect';
    const errorPath = path.join(__dirname, 'fixtures/apksigner-fail.txt');
    const apksignerError = fs.readFileSync(errorPath, 'utf8');
    const signerFailMsg = parseApksignerbuildError(apksignerError);

    expect(signerFailMsg).toBe(signerFailErr);
  });

  test('An apksigner file-not-found error is correctly parsed', async () => {
    const noFileErr = './app.apk (No such file or directory)';
    const errorPath = path.join(__dirname, 'fixtures/apksigner-fai-no-file.txt');
    const apksignerError = fs.readFileSync(errorPath, 'utf8');
    const noFileMsg = parseApksignerbuildError(apksignerError);

    expect(noFileMsg).toBe(noFileErr);
  });

  test('An apksigner wrong-key error is correctly parsed', async () => {
    const noKeyErr = `./ca.bc.gov.appKey.jks entry "ca.bc.gov.appKey" does not contain a key`;
    const errorPath = path.join(__dirname, 'fixtures/apksigner-fail-no-key.txt');
    const apksignerError = fs.readFileSync(errorPath, 'utf8');
    const noKeyMsg = parseApksignerbuildError(apksignerError);

    expect(noKeyMsg).toBe(noKeyErr);
  });

  test('An apksigner error paser failure is correctly parsed', async () => {
    const parserErr = `APK error is not read properly. Update error message paser, err = Cannot read property 'split' of undefined`;
    const errorPath = path.join(__dirname, 'fixtures/apksigner-paser-fail.txt');
    const apksignerParserError = fs.readFileSync(errorPath, 'utf8');
    const parserMsg = parseApksignerbuildError(apksignerParserError);

    expect(parserMsg).toBe(parserErr);
  });
});
