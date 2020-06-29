//
// Copyright (c) 2016 Fullboar Creative, Corp. All rights reserved.
//
// This software and documentation is the confidential and proprietary
// information of Fullboar Creative, Corp.
// ("Confidential Information"). You shall not disclose such Confidential
// Information and shall use it only in accordance with the terms of the
// license agreement you entered into with Fullboar Creative, Corp.
//

'use strict';

module.exports = {
  verbose: false,
  testURL: 'http://localhost/',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  globals: {
    NODE_ENV: 'test',
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  moduleDirectories: ['node_modules', 'src/frontend', 'src/shared'],
};
