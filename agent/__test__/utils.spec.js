//
// SecureImage
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
// Created by Jason Leach on 2018-01-10.
//

/* eslint-env es6 */

'use strict';

import { fetchKeychainValue, isEmpty } from '../src/libs/utils';

jest.mock('child_process');

describe('Test isEmpty()', () => {
  test('isEmpty handles a not null object', async () => {
    const testObject = { a: 1, b: 2 };

    expect(isEmpty(testObject)).toBe(false);
  });

  test('isValid handles null object', async () => {
    const testObject = null;
    const testObject2 = {};

    expect(isEmpty(testObject)).toBe(true);
    expect(isEmpty(testObject2)).toBe(true);
  });
});

describe('Test fetchKeychainValue()', () => {
  test('fetchKeychainValue handles multiple keychain fetch', async () => {
    const testInput = ['a', 'b', 'c'];
    const expectedOutput = JSON.stringify({
      a: 'standard output',
      b: 'standard output',
      c: 'standard output',
    });
    const actualOutput = JSON.stringify(await fetchKeychainValue(testInput, 'testAccount'));

    expect(actualOutput).toBe(expectedOutput);
  });
});
