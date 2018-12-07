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
import { isAuthorized, verify } from '../src/libs/authmware';

const path0 = path.join(__dirname, 'fixtures/jwt-decoded-norole-20181105.json');
const noRole = JSON.parse(fs.readFileSync(path0, 'utf8'));

const path1 = path.join(__dirname, 'fixtures/jwt-decoded-roleok-20181105.json');
const withRole = JSON.parse(fs.readFileSync(path1, 'utf8'));

const path2 = path.join(__dirname, 'fixtures/jwt-decoded-sa-20181107.json');
const saOk = JSON.parse(fs.readFileSync(path2, 'utf8'));

const path3 = path.join(__dirname, 'fixtures/jwt-decoded-sa-badid-20181107.json');
const saBadId = JSON.parse(fs.readFileSync(path3, 'utf8'));

const path4 = path.join(__dirname, 'fixtures/jwt-decoded-sa-badname-20181107.json');
const saBadName = JSON.parse(fs.readFileSync(path4, 'utf8'));

describe('Authentication tests', () => {
  test('A JWT without the correct role is not accepted', () => {
    expect(isAuthorized(noRole)).toBeFalsy();
  });

  test('A JWT with the correct role is accepted', () => {
    expect(isAuthorized(withRole)).toBeTruthy();
  });

  test('A service account JWT with valid accepted', () => {
    expect(isAuthorized(saOk)).toBeTruthy();
  });

  test('A service account JWT with an invalid ID is rejected', () => {
    expect(isAuthorized(saBadId)).toBeFalsy();
  });

  test('A service account JWT with an invalid name is rejected', () => {
    expect(isAuthorized(saBadName)).toBeFalsy();
  });
});

describe('Authentication integration tests', () => {
  test('A JWT without the correct role is not accepted', () => {
    const fn = (err, user) => {
      expect(err).toBeDefined();
      expect(user).toBeNull();
    };

    verify({}, noRole, fn);
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

    verify({}, withRole, fn);
  });
});
