/**
 * Copyright (c) 2014, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

'use strict';

const chalk = require('chalk');
const prettyFormat = require('pretty-format');

export type ValueType =
  | 'array'
  | 'boolean'
  | 'function'
  | 'null'
  | 'number'
  | 'object'
  | 'regexp'
  | 'string'
  | 'symbol'
  | 'undefined';

const EXPECTED_COLOR = chalk.green;
const RECEIVED_COLOR = chalk.red;

const NUMBERS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
];

// get the type of a value with handling the edge cases like `typeof []`
// and `typeof null`
const getType = (value: any): ValueType => {
  if (typeof value === 'undefined') {
    return 'undefined';
  } else if (value === null) {
    return 'null';
  } else if (Array.isArray(value)) {
    return 'array';
  } else if (typeof value === 'boolean') {
    return 'boolean';
  } else if (typeof value === 'function') {
    return 'function';
  } else if (typeof value === 'number') {
    return 'number';
  } else if (typeof value === 'string') {
    return 'string';
  } else if (typeof value === 'object') {
    if (value.constructor === RegExp) {
      return 'regexp';
    }
    return 'object';
  // $FlowFixMe https://github.com/facebook/flow/issues/1015
  } else if (typeof value === 'symbol') {
    return 'symbol';
  }

  throw new Error(`value of unknown type: ${value}`);
};

const stringify = (object: any): string => {
  try {
    return prettyFormat(object, {
      maxDepth: 10,
      min: true,
    });
  } catch (e) {
    return prettyFormat(object, {
      callToJSON: false,
      maxDepth: 10,
      min: true,
    });
  }
};

const printReceived = (object: any) => RECEIVED_COLOR(stringify(object));
const printExpected = (value: any) => EXPECTED_COLOR(stringify(value));

const printWithType = (
  name: string,
  received: any,
  print: (value: any) => string,
) => {
  const type = getType(received);
  return (
    name + ':' +
    (type !== 'null' && type !== 'undefined'
      ? '\n  ' + type + ': '
      : ' ') +
    print(received)
  );
};

const ensureNoExpected = (expected: any, matcherName: string) => {
  matcherName || (matcherName = 'This');
  if (typeof expected !== 'undefined') {
    throw new Error(
      matcherHint('[.not]' + matcherName, undefined, '') + '\n\n' +
      'Matcher does not accept any arguments.\n' +
      printWithType('Got', expected, printExpected),
    );
  }
};

const ensureActualIsNumber = (actual: any, matcherName: string) => {
  matcherName || (matcherName = 'This matcher');
  if (typeof actual !== 'number') {
    throw new Error(
      matcherHint('[.not]' + matcherName) + '\n\n' +
      `Actual value must be a number.\n` +
      printWithType('Received', actual, printReceived),
    );
  }
};

const ensureExpectedIsNumber = (expected: any, matcherName: string) => {
  matcherName || (matcherName = 'This matcher');
  if (typeof expected !== 'number') {
    throw new Error(
      matcherHint('[.not]' + matcherName) + '\n\n' +
      `Expected value must be a number.\n` +
      printWithType('Got', expected, printExpected),
    );
  }
};

const ensureNumbers = (actual: any, expected: any, matcherName: string) => {
  ensureActualIsNumber(actual, matcherName);
  ensureExpectedIsNumber(expected, matcherName);
};

const pluralize =
  (word: string, count: number) =>
    (NUMBERS[count] || count) + ' ' + word + (count === 1 ? '' : 's');

const matcherHint = (
  matcherName: string,
  received: string = 'received',
  expected: string = 'expected',
) => {
  return (
    chalk.dim('expect(') + RECEIVED_COLOR(received) +
    chalk.dim(')' + matcherName + '(') +
    EXPECTED_COLOR(expected) + chalk.dim(')')
  );
};

module.exports = {
  EXPECTED_COLOR,
  RECEIVED_COLOR,
  ensureActualIsNumber,
  ensureExpectedIsNumber,
  ensureNoExpected,
  ensureNumbers,
  getType,
  matcherHint,
  pluralize,
  printExpected,
  printReceived,
  printWithType,
  stringify,
};
