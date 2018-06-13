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
// Created by Jason Leach on 2018-05-23.
//

'use strict';

/* eslint-disable no-unused-vars */

const table = 'job';

exports.up = async knex =>
  knex.schema.createTable(table, async (t) => {
    t.string('id', 16).index().primary();
    t.string('platform', 8).notNull();
    t.string('original_name', 128).notNull();
    t.string('archive_path', 64).notNull();
    t.string('etag', 33);
    t.string('delivery_file', 64);
    t.dateTime('created_at').notNull();
    t.dateTime('updated_at').notNull();
  });

exports.down = knex =>
  knex.schema.dropTable(table);
