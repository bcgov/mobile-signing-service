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
// Created by Jason Leach on 2018-09-17.
//

export const AC_ROLE = 'devhub_sign';

export const AUTHENTICATION = {
  SUCCESS: 'AUTHENTICATE_SUCCESS',
  FAILED: 'AUTHENTICATE_FAILED',
};

export const JOB_STATUS = {
  CREATING: 'JOB_STATUS_CREATING',
  CREATED: 'JOB_STATUS_CREATED',
  PROCESSING: 'JOB_STATUS_PROCESSING',
  COMPLETED: 'JOB_STATUS_COMPLETED',
  FAILED: 'JOB_STATUS_FAILED',
};

export const API = {
  BASE_URL: () =>
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8089/api/v1/'
      : `${window.location.origin}/api/v1/`,
  CREATE_JOB: platformId => `sign?platform=${platformId}`,
  CHECK_JOB_STATUS: jobId => `job/${jobId}/status`,
};

export const API_ERROR = {
  JOB_STATUS_CHECK_FAILED: 'JOB_STATUS_CHECK_FAILED',
};

export const XML_SAMPLES = {
  PLIST: `
  <?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
  <plist version="1.0">
    <dict>
      <key>method</key>
      <string>app-store</string>
      <key>signingStyle</key>
      <string>automatic</string>
      <key>stripSwiftSymbols</key>
      <true/>
      <key>uploadSymbols</key>
      <true/>
    </dict>
  </plist>
  `,
};
