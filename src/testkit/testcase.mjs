/**
 * A module for test cases.
 * @module testkit/testcase
 */

import { expect, AssertionError } from "chai";
import { it } from "mocha";

/**
 * A function performing a testing.
 * @template TESTED The tested value type.
 * @template [PARAMS=...any] The parameter type of test parameters.
 * @template [RESULT=undefined] The test return value type.
 * @template [ERROR=Error] The error types of the failed tests.
 * @callback TestFunction
 * @param {TESTED} tested The tested value.
 * @param {PARAMS} params The parameters of the test.
 * @returns {RESULT} The result of the test.
 * @throws {ERROR} The test failed due an error.
 */

/**
 * A test case.
 * @template TESTED The tested value type.
 * @template [PARAMS=...any] The parameter type of test parameters.
 * @template [RESULT=undefined] The test return value type.
 * @template [ERROR=Error] The error types of the failed tests.
 * @typedef {Object} TestCase
 * @property {string} [name] The test case name. Defaults to the test case name and
 * parameter stringificatin.
 * @property {TESTED} tested The tested value.
 * @property {PARAMS} params The parameters of the test.
 * @property {TestFunction<TESTED, PARAMS, RESULT, ERROR>} test The testing function.
 * @property {ERROR} [exception] The expected exception thrown.
 * @property {RESULT} [result] The expected result.
 */

/**
 * Convert parameters into a string.
 * @template [PARAMS=...any] The parameter type of test parameters.
 * @param {PARAMS} params The stringified params.
 */
export function paramsToString(params) {
  if (params) {
    if (Array.isArray(params)) {
      // The parameters is an array.
      return params.map(toString).join(", ");
    } else {
      // The parameter is a single value.
      return toString(params);
    }
  } else {
    return "";
  }
}

/**
 * A run time test checking validity of the test case.
 * @param {any} testCase The tested test case.
 * @returns {boolean} True, if and only if the test case is a valid test case.
 */
export function validTestCase(testCase) {
  return (
    testCase instanceof Object &&
    [
      ["tested", () => true],
      ["params", () => true],
      ["test", (val) => val instanceof Function],
    ].every(([prop, test]) => prop in testCase && test(testCase[prop])) &&
    [
      ["name", (val) => typeof val === "string"],
      ["result", () => true],
      ["exception", () => true],
    ].every(([prop, test]) => !(prop in testCase) || test(testCase[prop]))
  );
}

/**
 * Create a new test case. If name is absent, generates a name from test function name and
 * parameters.
 * @template TESTED The tested value type.
 * @template [PARAMS=...any] The parameter type of test parameters.
 * @template [RESULT=undefined] The test return value type.
 * @template [ERROR=Error] The error types of the failed tests.
 * @param {TestCase<TESTED,PARAMS,RESULT,ERROR>} options The parameters of the created test case.
 * @returns {TestCase<TESTED,PARAMS,RESULT,ERROR>}
 */
export function createTestCase(options) {
  return {
    name:
      options.name ||
      `${options.test.name}(${
        options.params ? paramsToString(options.params) : ""
      })`,
    tested: options.tested,
    params: options.params,
    test: options.test,
    exception: options.exception,
    result: options.result,
  };
}

/**
 * Test a test case.
 * @template TESTED The tested value type.
 * @template [PARAMS=...any] The parameter type of test parameters.
 * @template [RESULT=undefined] The test return value type.
 * @template [ERROR=Error] The error types of the failed tests.
 * @param {TestCase<TESTED, PARAMS, RESULT, ERROR>} testCase THe tested test case.
 * @param {number} [index] The indes of the test case.
 * @throws {AssertionError} The test failed.
 */
export function testTestCase(testCase, index = undefined) {
  if (validTestCase(testCase)) {
    it(`TestCase${index == null ? "" : ` #${index}`}: ${
      testCase.name
    }`, function () {
      if (testCase.exception) {
        expect(() => {
          testCase.test(testCase.tested, testCase.params);
        }).throw(testCase.exception);
      } else {
        expect(() => {
          testCase.test(testCase.tested, testCase.params);
        }).not.throw();
        const result = testCase.test(testCase.tested, testCase.params);
        expect(result).equal(testCase.result);
      }
    });
  } else {
    throw new AssertionError("Invalid test case");
  }
}

/**
 * Convert value to string.
 * @param {any} a The outputted value.
 * @returns {string} The string containing information of the value.
 * - Functions are reprsented by the string "function <functonname>"
 * - Symbols are represented by th estirng "Symbol:" followed by the global key
 * of the symbol, if it has any.
 * - String is reprsented by a quoted string.
 * - Array is represented by the array member stringifications separated with "," and
 * printed between "[" and "]".
 * - An object is represented by the JSONification of the object.
 * @todo Object outputting.
 * @todo Add escape of the quotes within the string.
 */
export function toString(a) {
  switch (typeof a) {
    case "string":
      return `"${a}"`;
    case "function":
      return `Function ${a.name}`;
    case "symbol":
      return `Symbol:${Symbol.keyFor(a)}`;
    case "object":
      if (a === null) return "null";
      if (a === undefined) return "undefined";
      return Array.isArray(a)
        ? `[${paramsToString(a)}]`
        : `{${
            // Converting object to result.
            [
              ...Object.getOwnPropertyNames(a),
              ...Object.getOwnPropertySymbols(a),
            ]
              .map((property, index) => {
                const value = a[property];
                if (value instanceof Function) {
                  return `method ${toString(a)}`;
                } else {
                  return `property ${toString(a)}=${toString(value)}`;
                }
              })
              .join(", ")
          }}`;
    default:
      return String(a);
  }
}
