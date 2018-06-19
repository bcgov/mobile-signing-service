//
// MyRA
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
// Created by Jason Leach on 2018-05-06.
//

'use strict';

import Model from './model';

export default class Job extends Model {
  static get fields() {
    // primary key *must* be first!
    return ['id', 'platform', 'original_file_name', 'original_file_etag', 'delivery_file_name',
      'delivery_file_etag']
      .map(field => `${this.table}.${field}`);
  }

  static get table() {
    return 'job';
  }

  get duration() {
    const delta = this.createdAt - this.updatedAt;
    return Math.abs(delta / 1000);
  }
}
