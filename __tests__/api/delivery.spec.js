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
// Created by Jason Leach on 2018-07-20.
//

import { default as request } from 'supertest'; // eslint-disable-line
import app from '../../src';

jest.mock('../../src/libs/db/models/job');
jest.mock('fs');
jest.mock('multer');
jest.mock('request-promise-native');
jest.mock('minio');

// const sample = path.join(__dirname, '../', 'fixtures/test.zip');

describe('Test download route', () => {
  test('Job 30 is expired can can not be downloaded', async () => {
    await request(app)
      .get('/api/v1/delivery/30?token=123abc')
      .expect(400); // Bad Request
  });

  test.skip('Job 20 is OK and can be downloaded', async () => {
    await request(app)
      .get('/api/v1/delivery/20?token=123abc')
      .expect(200);
  });
});
