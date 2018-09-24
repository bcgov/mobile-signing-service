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
// Created by Jason Leach on 2018-05-23.
//

/* eslint-disable no-unused-vars */
/* eslint-disable newline-per-chained-call */

'use strict';

import { JOB_STATE } from '../constants';

exports.up = async knex => {
  const values = Object.values(JOB_STATE)
    .map(s => `'${s}'`)
    .join(',');

  const query = `CREATE TYPE enum_job_status AS ENUM (${values});`;

  await knex.schema.raw(query);
};

exports.down = async knex => knex.schema.raw('DROP TYPE enum_item_type;');
