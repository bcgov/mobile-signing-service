'use strict';

import { default as request } from 'supertest'; // eslint-disable-line
import app from '../../src';

describe('Test job routes', () => {
  test('The signing route should respond with 200', async () => {
    await request(app)
      .post('/v1/job/sign')
      .send({
        platform: 'moon',
      })
      .expect(200);
  });

  test('The signing route must receive a job', async () => {
    const response = await request(app).post('/v1/job/sign');

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('No such job exists');
  });

  test('The deployment route should respond with 200', async () => {
    await request(app)
      .post('/v1/job/deploy')
      .send({
        platform: 'moon',
        deploymentPlatform: 'cake',
      })
      .expect(200);
  });

  test('The deployment route must receive a job', async () => {
    const response = await request(app).post('/v1/job/deploy');

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('No such job exists');
  });

  test('The deployment route must receive a job containing platform information', async () => {
    const response = await request(app)
      .post('/v1/job/deploy')
      .send({
        deploymentPlatform: 'cake',
      });
      
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Missing platforms');
  });
});
