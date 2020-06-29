//
// SecureImage
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
// Created by Jason Leach on 2018-01-10.
//

'use strict';

// eslint-disable-next-line import/prefer-default-export
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
};

export const JOB_STATUS = {
  CREATED: 'Created',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

export const PACKAGE_FORMAT = {
  ANDROID: '.apk',
  IOS: '.ipa',
  UNKNOWN: '',
};

export const AW = {
  AW_DEVICE_TYPES: {
    ANDROID: '5',
    IPHONE: '2',
    IPAD: '1',
    UNKNOWN: '0',
  },
  AW_DEVICE_MODELS: {
    ANDROID: 5,
    IOS: 1,
    UNKNOWN: 0,
  },
};

export const ACCESS_CONTROL = {
  AGENT_CLIENT_ID: 'signing-api',
  AGENT_USER: 'service-account-signing-api',
};

export const LOCAL_PATHS = {
  JKS_PATH: '/Users/xcode/apk-certs/',
  SIGNED_PACKAGE_SUB_PATH: 'signed',
  KEYCHAIN_NAME: 'cicd.keychain',
};
