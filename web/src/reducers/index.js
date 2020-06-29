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

import { combineReducers } from 'redux';
import implicitAuthManager from '../auth';
import { API_ERROR, AUTHENTICATION, JOB_STATUS } from '../constants';

const authentication = (state = { isAuthenticated: false }, action) => {
  switch (action.type) {
    case AUTHENTICATION.SUCCESS:
      return { isAuthenticated: true };
    case AUTHENTICATION.FAILED:
      implicitAuthManager.clearAuthLocalStorage();
      return { isAuthenticated: false };
    default:
      return state;
  }
};

const job = (state = {}, action) => {
  switch (action.type) {
    case JOB_STATUS.CREATING:
      return {
        status: JOB_STATUS.CREATING,
        message: undefined,
        jobId: undefined,
        url: undefined,
      };
    case JOB_STATUS.CREATED:
      return {
        status: JOB_STATUS.CREATED,
        message: undefined,
        jobId: action.jobId,
        url: undefined,
      };
    case JOB_STATUS.FAILED:
      return {
        status: JOB_STATUS.FAILED,
        message: action.message,
        jobId: undefined,
        url: undefined,
      };
    case JOB_STATUS.PROCESSING:
      return {
        status: JOB_STATUS.PROCESSING,
        message: undefined,
        jobId: state.jobId,
        url: undefined,
      };
    case JOB_STATUS.COMPLETED:
      return {
        status: JOB_STATUS.COMPLETED,
        jobId: state.jobId,
        url: action.url,
      };
    default:
      return state;
  }
};

const api = (state = {}, action) => {
  switch (action.type) {
    case API_ERROR.JOB_STATUS_CHECK_FAILED:
      return {
        status: API_ERROR.JOB_STATUS_CHECK_FAILED,
        message: action.message,
        code: action.code,
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({ job, api, authentication });

export default rootReducer;
