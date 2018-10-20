//
// Code Sign
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
// Created by Jason Leach on 2018-10-20.
//

'use strict';

const fs = jest.requireActual('fs');

function access(path, flag, cb) {
  if (path === 'no-file-access') {
    return cb(new Error('No access to this file - mock'));
  }

  return cb(undefined);
}

function readFile(path, options, cb) {
  if (path === 'no-file') {
    return cb(new Error('No such file - mock'), undefined);
  }

  return cb(undefined, Buffer.from('Hello World', 'utf8'));
}

fs.readFile = readFile;
fs.access = access;

module.exports = fs;
