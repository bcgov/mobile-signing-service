/* eslint-disable no-unused-vars */

'use strict';

const cp = jest.genMockFromModule('child_process');

function execAsync(command, cb) {
  cb(null, { stdout: 'standard output', stderr: 'null' });
}

cp.exec = execAsync;

module.exports = cp;
