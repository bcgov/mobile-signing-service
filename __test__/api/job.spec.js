
import { default as request } from 'supertest'; // eslint-disable-line
import app from '../../src';

describe('Test job routes', () => {
  // Pre-set request headers:
  // TODO: (sh) mock passport instead of using actual token
  const authToken = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ5RDIxNGV5aGdoVUt1dThDdDYyREJ2SHd5ekZOZjZ2a1RMaUowcV9OcE5nIn0.eyJqdGkiOiJlMGI1MmZhYy1iZmQxLTQ1OGItOWE0OC0xZGM5ZjAwYjc3Y2IiLCJleHAiOjE1MzkwNjI4MjgsIm5iZiI6MCwiaWF0IjoxNTM5MDYyNTI4LCJpc3MiOiJodHRwczovL3Nzby1kZXYucGF0aGZpbmRlci5nb3YuYmMuY2EvYXV0aC9yZWFsbXMvZGV2aHViIiwiYXVkIjoic2lnbmluZy1hcGkiLCJzdWIiOiJjYWRiZDg0Ny0xMmZlLTRkZGMtYWM2NC0yMjNlOTJjNWNmZjUiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzaWduaW5nLWFwaSIsImF1dGhfdGltZSI6MCwic2Vzc2lvbl9zdGF0ZSI6IjUxZWMzNzJmLTRlMDEtNDQyNS05ZjRkLWMwZjFlMTVlOTk3NyIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOltdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJjbGllbnRJZCI6InNpZ25pbmctYXBpIiwiY2xpZW50SG9zdCI6IjE3Mi41MS4yMC4xIiwicHJlZmVycmVkX3VzZXJuYW1lIjoic2VydmljZS1hY2NvdW50LXNpZ25pbmctYXBpIiwiY2xpZW50QWRkcmVzcyI6IjE3Mi41MS4yMC4xIiwiZW1haWwiOiJzZXJ2aWNlLWFjY291bnQtc2lnbmluZy1hcGlAcGxhY2Vob2xkZXIub3JnIn0.ApFX3PljNLi8UPDyLqVt2BYVsrSmwq-ybWuGhLbjhArhxnEg2gkKEnx6ncSe4bPMkTj2L5imarGRHR7be8u69mAK42XYsEUoWku73xspt_SdCd0lzMZTQyMqaEu6l7kBRrIvhPipyeYV78-DiuwGWiTUaEENIRteBPFpbJsWEgGY75C6h4fnHenFqzYLl3454PvYP-mnfKXzq8YWkKJ7DOlcvGH1w2DSe_8FXdYtytz0iGPuZTpeJZ5HT5k2AhRXKHWdJH15-SGqiLBFefNoe0tgyFvwqvk8MCHI9aXTSuFJamYCU1nyfn5pUk1QKUyILbihjB4ahED8qtKrXrJyXg';
  let signingAgent;
  let deploymentAgent;

  beforeAll(() => {
    signingAgent = request(app)
      .post('/v1/job/sign')
      .set({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      });
    
    deploymentAgent = request(app)
      .post('/v1/job/deploy')
      .set({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      });
  });

  test('The signing route should respond with 200', async () => {
    await signingAgent
      .send({
        platform: 'moon',
      })
      .expect(200);
  });

  test('The signing route must receive a job', async () => {
    await signingAgent.expect(400);
  });

  test('The deployment route should respond with 200', async () => {
    await deploymentAgent
      .send({
        platform: 'moon',
        deploymentPlatform: 'cake',
      })
      .expect(200);
  });

  test('The deployment route must receive a job', async () => {
    await deploymentAgent.expect(400);
  });

  test('The deployment route must receive a job containing platform information', async () => {
    await deploymentAgent
      .send({
        deploymentPlatform: 'cake',
      })
      .expect(400);
  });
});
