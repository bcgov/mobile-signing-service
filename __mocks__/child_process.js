
/* eslint-disable no-unused-vars */

'use strict';

let cp = jest.genMockFromModule('child_process');

function execAsync(command, cb) {
  cb(null, {stdout: 'standard output', stderr: 'null'});
}

cp.exec = execAsync;

module.exports = cp;
