//
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
// Created by Jason Leach on 2018-11-05.
//

/* eslint-env es6 */

'use strict';

import fs from 'fs';
import path from 'path';
import { verify } from '../src/libs/authmware';

const path0 = path.join(__dirname, 'fixtures/jwt-decoded-norole-20181105.json');
const decodedNoRole = JSON.parse(fs.readFileSync(path0, 'utf8'));

const path1 = path.join(__dirname, 'fixtures/jwt-decoded-roleok-20181105.json');
const decodedWithRole = JSON.parse(fs.readFileSync(path1, 'utf8'));

describe('Test Authentication', () => {
  test('A JWT without the correct role is not accepted', () => {
    const fn = (err, user) => {
      expect(err).toBeDefined();
      expect(user).toBeNull();
    };

    verify({}, decodedNoRole, fn);
  });

  test('A JWT with the correct role is accepted', () => {
    const fn = (err, user) => {
      expect(err).toBeNull();
      expect(user).toBeDefined();
      expect(user.roles).toBeDefined();
      expect(user.preferredUsername).toBeDefined();
      expect(user.givenName).toBeDefined();
      expect(user.familyName).toBeDefined();
      expect(user.email).toBeDefined();
    };

    verify({}, decodedWithRole, fn);
  });
});
