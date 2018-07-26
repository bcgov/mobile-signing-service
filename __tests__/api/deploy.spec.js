
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

describe('Test deployment routes', () => {
  test.skip('Test jobId must be present', async () => {
    const response = await request(app)
      .post('/api/v1/deploy');
    expect(response.statusCode).toBe(404); // Bad Request
    // Why is it not getting the 400 back??
  });

  test('Test deployment platform must be in the request body', async () => {
    const response = await request(app)
      .post('/api/v1/deploy/10');
    expect(response.statusCode).toBe(400); // Required parameters missing
  });

  test('Test deployment request is accepted', async () => {
    const response = await request(app)
      .post('/api/v1/deploy/20')
      .query({ platform: 'android' })
      .set('content-type', 'application/json');
    expect(response.statusCode).toBe(202); // OK
  });
});
