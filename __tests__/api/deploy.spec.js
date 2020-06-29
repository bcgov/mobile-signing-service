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
jest.mock('../../src/libs/db/models/project');
jest.mock('request-promise-native');
jest.mock('minio');

describe('Test deployment routes', () => {
  test('Test jobId must be present', async () => {
    const response = await request(app).post('/api/v1/deploy');
    expect(response.statusCode).toBe(404); // Required parameters missing
  });

  test('Test deployment platform must be in the request body', async () => {
    const response = await request(app).post('/api/v1/deploy/10');
    expect(response.statusCode).toBe(400); // Bad request
  });

  test('test deployment request must have a project', async () => {
    const response = await request(app)
      .post('/api/v1/deploy/21')
      .query({
        deploymentPlatform: 'public',
        projectId: 2,
      })
      .set('content-type', 'application/json');
    expect(response.statusCode).toBe(404); // Required parameters missing
  });

  test('Test public deployment request is accepted', async () => {
    const response = await request(app)
      .post('/api/v1/deploy/21')
      .query({
        deploymentPlatform: 'public',
        projectId: 1,
      })
      .set('content-type', 'application/json');
    expect(response.statusCode).toBe(202); // OK
  });

  test('test enterprise deployment request is accepted', async () => {
    const response = await request(app)
      .post('/api/v1/deploy/21')
      .query({
        deploymentPlatform: 'enterprise',
        projectId: 1,
      })
      .set('content-type', 'application/json');
    expect(response.statusCode).toBe(202); // OK
  })
});
