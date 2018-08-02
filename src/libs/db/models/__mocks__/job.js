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

export default class Model {
  static async update() {
    return {};
  }

  static async findById(db, id) {
    if (Number(id) === 10) return { id: 10 }; // Processing
    if (Number(id) === 20) return { id: 20, deliveryFileName: 'notExpiredFile' }; // Done
    if (Number(id) === 30) return { id: 30, deliveryFileName: 'expiredFile' }; // Done
    if (Number(id) === 21) return { id: 21, platform: 'android', deliveryFileName: 'notExpiredFile' }; // Deployment api test

    return undefined;
  }

  static async create(db, values) {
    return this.findById(db, 21);
  }
}
