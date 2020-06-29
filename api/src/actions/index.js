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
// Created by Jason Leach on 2018-08-24.
//

import { API_ERROR, AUTHENTICATION, JOB_STATUS } from '../constants';

export const authenticateSuccess = () => {
  return {
    type: AUTHENTICATION.SUCCESS,
  };
};

export const authenticateFailed = () => {
  return {
    type: AUTHENTICATION.FAILED,
  };
};

export const jobCreating = () => {
  return {
    type: JOB_STATUS.CREATING,
  };
};

export const jobCreated = data => {
  return {
    type: JOB_STATUS.CREATED,
    jobId: data.jobId,
  };
};

export const jobCreationFailed = () => {
  return {
    type: JOB_STATUS.FAILED,
    jobId: undefined,
  };
};

export const jobProcessing = () => {
  return {
    type: JOB_STATUS.PROCESSING,
  };
};

export const jobCompleted = data => {
  return {
    type: JOB_STATUS.COMPLETED,
    url: data.url,
  };
};

export const jobFailed = data => {
  return {
    type: JOB_STATUS.FAILED,
    message: data.statusMessage,
  };
};

export const apiRequestFailed = (message, code) => {
  return {
    type: API_ERROR.JOB_STATUS_CHECK_FAILED,
    message,
    code,
  };
};
