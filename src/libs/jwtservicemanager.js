//
// Code Sign
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
// Created by Jason Leach on 2018-07-23.
//

'use strict';

import { fetchServiceAccountToken } from '@bcgov/nodejs-common-utils';

// eslint-disable-next-line import/prefer-default-export
export class JWTServiceManager {
  constructor(options) {
    this.options = options;
  }

  async fetchToken() {
    this.data = await fetchServiceAccountToken(this.options);
    this.lastFetchedAt = new Date();
  }

  get isTokenExpired() {
    if (!this.lastFetchedAt) return true;
    const then = new Date(this.lastFetchedAt.getTime());
    then.setSeconds(then.getSeconds() + this.data.expires_in);

    return then < new Date();
  }

  get accessToken() {
    return (async () => {
      if (this.isTokenExpired) {
        await this.fetchToken();
      }

      return this.data.access_token;
    })();
  }
}
