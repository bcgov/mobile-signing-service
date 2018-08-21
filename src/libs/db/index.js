//
// Copyright (c) 2018 Fullboar Creative, Corp. All rights reserved.
//
// This software and documentation is the confidential and proprietary
// information of Fullboar Creative, Corp.
// ("Confidential Information"). You shall not disclose such Confidential
// Information and shall use it only in accordance with the terms of the
// license agreement you entered into with Fullboar Creative, Corp.
//

'use strict';

import knex from 'knex';
import config from '../../config';
import Job from './models/job';

export default class DataManager {
  constructor() {
    const k = knex({
      client: 'postgresql',
      connection: {
        user: config.get('db:user'),
        database: config.get('db:database'),
        port: 5432,
        host: config.get('db:host'),
        password: config.get('db:password'),
      },
      searchPath: ['public'],
      debug: false,
      pool: {
        min: 1,
        max: 64,
      },
      migrations: {
        tableName: 'migration',
      },
    });

    this.db = k;
    this.Job = Job;
  }
}
