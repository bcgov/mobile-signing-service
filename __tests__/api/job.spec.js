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
jest.mock('request-promise-native');
jest.mock('minio');

describe('Test job routes', () => {
  test('Test jobId must be present', async () => {
    await request(app)
      .put('/api/v1/job')
      .send({})
      .expect(404); // Not Found
  });

  test('Test job object must be in the request body', async () => {
    await request(app)
      .put('/api/v1/job/10')
      .expect(400); // Bad Request
  });

  test('Test job request body contains all required fields', async () => {
    await request(app)
      .put('/api/v1/job/10')
      .set('content-type', 'application/json')
      .send({
        job: {
          name: 'moon',
          type: 'cake',
        },
      })
      .expect(400) // Bad Request
      .expect('Content-Type', /json/);
  });

  test('Test job request body fields are accepted', async () => {
    await request(app)
      .put('/api/v1/job/10')
      .set('content-type', 'application/json')
      .send({
        job: {
          deliveryFileName: 'moon',
          deliveryFileEtag: 'cake',
        },
      })
      .expect(200); // Ok
  });
  test('Job 10 status should be Created', async () => {
    await request(app)
      .get('/api/v1/job/10/status')
      .expect(202) // Processing
      .expect(res => {
        expect(res.body.status).toBe('Created');
      });
  });

  test('Job 11 status should be Processing', async () => {
    await request(app)
      .get('/api/v1/job/11/status')
      .expect(202) // Processing
      .expect(res => {
        expect(res.body.status).toBe('Processing');
      });
  });

  test('Job 20 status should be Completed', async () => {
    await request(app)
      .get('/api/v1/job/20/status')
      .expect(200)
      .expect(res => {
        expect(res.body.status).toBe('Completed');
      });
  });

  test('Job 40 status should be Failed', async () => {
    await request(app)
      .get('/api/v1/job/40/status')
      .expect(200)
      .expect(res => {
        expect(res.body.status).toBe('Failed');
      });
  });

  test('Job 50 to not exists', async () => {
    await request(app)
      .get('/api/v1/job/50/status')
      .expect(404); // Not Found
  });
});
