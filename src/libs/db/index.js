//
// Copyright (c) 2018 Fullboar Creative, Corp. All rights reserved.
//
// This software and documentation is the confidential and proprietary
// information of Fullboar Creative, Corp.
// ("Confidential Information"). You shall not disclose such Confidential
// Information and shall use it only in accordance with the terms of the
// license agreement you entered into with Fullboar Creative, Corp.
//

/* eslint-env es6 */

'use strict';

import knex from 'knex';
import Job from './models/job';

export default class DataManager {
  constructor() {
    const k = knex({
      client: 'sqlite3',
      debug: false,
      connection: {
        filename: './cache.sqlite',
      },
      migrations: {
        tableName: 'migration',
      },
    });

    this.db = k;
    this.Job = Job;
  }
}
