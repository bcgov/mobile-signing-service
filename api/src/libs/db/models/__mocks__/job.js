//
// Code Sign
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
// Created by Jason Leach on 2018-07-23.
//

/* eslint-disable no-unused-vars */

'use strict';

import { JOB_STATUS } from '../../../../constants';
import Model from '../model';

export default class Job extends Model {
  static async update() {
    return {};
  }

  static async findById(db, id) {
    if (Number(id) === 10) return { id: 10, status: JOB_STATUS.CREATED };
    if (Number(id) === 11) return { id: 11, status: JOB_STATUS.PROCESSING };
    if (Number(id) === 20)
      return {
        id: 20,
        originalFileName: 'hello-file.zip',
        deliveryFileName: 'notExpiredFile',
        token: '123abc',
        status: JOB_STATUS.COMPLETED,
      }; // Done
    if (Number(id) === 21)
      return {
        id: 21,
        platform: 'android',
        originalFileName: 'hello-file.zip',
        deliveryFileName: 'notExpiredFile',
        status: JOB_STATUS.COMPLETED,
      }; // Deployment api test
    if (Number(id) === 30)
      return {
        id: 30,
        originalFileName: 'hello-file.zip',
        deliveryFileName: 'expiredFile',
        token: '123abc',
        status: JOB_STATUS.COMPLETED,
      }; // Done
    if (Number(id) === 40)
      return {
        id: 21,
        platform: 'ios',
        status: JOB_STATUS.FAILED,
      };

    return undefined;
  }

  static async create(db, values) {
    return this.findById(db, 21);
  }
}
