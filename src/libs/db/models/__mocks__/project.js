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

import Model from '../model';

export default class Project extends Model {
  static async findById(db, id) {
    if (Number(id) === 1) return { id: 1, project_name: 'hello', aw_group_id: 'ABC' };
    return undefined;
  }

  static async getAirwatchGroupCode(db, values) {
    return '123';
  }
}
