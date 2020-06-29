//
// DevHub
//
// Copyright © 2018 Province of British Columbia
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
// Created by Jason Leach on 2018-09-04.
//

import axios from 'axios';
import {
  apiRequestFailed,
  jobCompleted,
  jobCreated,
  jobCreating,
  jobCreationFailed,
  jobFailed,
  jobProcessing,
} from '../actions';
import implicitAuthManager from '../auth';
import { API } from '../constants';

const axi = axios.create({
  baseURL: API.BASE_URL(),
});
const apiPollTimeout = 3000; // Timout in Ms.
const maxStatusCheckCount = (10 * 60 * 1000) / apiPollTimeout; // delayInMin * sec * Ms / timeout
let statusCheckCount = 0;

const authenticationHeaderValue = () => {
  let token = '';
  try {
    token = implicitAuthManager.idToken.bearer;
  } catch (err) {
    console.log('No JWT for authentication.');
  }

  return `Bearer ${token}`;
};

export const createSigningJob = (files, platform) => dispatch => {
  const form = new FormData();
  form.append('file', files[0]);

  dispatch(jobCreating());
  apiRequestFailed(); // clear any errors

  return axi
    .post(API.CREATE_JOB(platform), form, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: authenticationHeaderValue(),
      },
    })
    .then(res => {
      dispatch(jobCreated({ jobId: res.data.id }));
      checkJobStatus(res.data.id, dispatch);
    })
    .catch(err => {
      dispatch(jobCreationFailed());

      const code = typeof err.response.status !== 'undefined' ? err.response.status : 0;
      let message = 'Unable to create signing job';
      if (err.response.data.error) {
        message = err.response.data.error;
      }

      dispatch(apiRequestFailed(message, code));
    });
};

const checkJobStatus = (jobId, dispatch) => {
  statusCheckCount += 1;

  apiRequestFailed(); // clear any errors

  return axi
    .get(API.CHECK_JOB_STATUS(jobId), {
      headers: {
        Accept: 'application/json',
        Authorization: authenticationHeaderValue(),
      },
    })
    .then(res => {
      if (
        res.status === 202 &&
        res.data.status === 'Processing' &&
        statusCheckCount < maxStatusCheckCount
      ) {
        dispatch(jobProcessing());

        setTimeout(() => {
          checkJobStatus(jobId, dispatch);
        }, apiPollTimeout);
      } else if (res.status === 200 && res.data.status === 'Completed') {
        dispatch(jobCompleted(res.data));
      } else if (res.status === 200 && res.data.status === 'Failed') {
        dispatch(jobFailed(res.data));
      }
    })
    .catch(err => {
      let message = 'Unable to check job status';
      const code = typeof err.response.status != 'undefined' ? err.response.status : 0;
      if (err.response.data.error) {
        message = err.response.data.error;
      }
      console.log(`error = ${message}, code = ${code}`);
      dispatch(apiRequestFailed(message, code));
    });
};
