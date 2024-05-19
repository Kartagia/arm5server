import { describe, it } from "mocha";
import { AssertionError, expect } from "chai";
import {
  LooseEquality,
  SameValueEquality,
  SameValueZeroEquality,
  StrictEquality,
} from "../src/arm5tools/utils_covenant.mjs";

/**
 * Convert valeu to string.
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
function toString(a) {
  switch (typeof a) {
    case "string":
      return `"${a}"`;
    case "function":
      return `Function ${a.name}`;
    case "symbol":
      return `Symbol:${Symbol.keyFor(a)}`;
    case "object":
      return Array.isArray(a) ? `[${a.map(toString).join(",")}]` : `{}`;
    default:
      return String(a);
  }
}

describe("Equality", function () {
  const defaultCases = [
    [0, 0],
    [undefined, undefined],
    [null, null],
    ["a", "a"],
    ["", ""],
    [[], []],
    [{}, {}],
    [-0, 0],
    ["0", 0],
    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
    [Number.NEGATOVE_INFINITY, Number.NEGATIVE_INFINITY],
    [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
    [undefined, null],
    [Number.NaN, Number.NaN],
  ];
  [
    ["Loose Equality", LooseEquality, (a,b) => (a==b)], 
  ["Strict equality", StrictEquality, (a,b) => (a===b)],
  ["Same Value equality", SameValueEquality, (a,b) => (Object.is(a,b))],
  ["Same Valeu Zero equality", SameValueZeroEquality, (a,b) => (a===b || (a !== a && b !== b))],

].forEach( ([name, tested, validator, testName=undefined, testOp = undefined]) => {
  describe(name, function () {
    const testFuncName = testName ?? tested.name;
    const testFuncOperator = testOp ?? ", ";
    defaultCases
      .map(([a, b]) => ({
        tested,
        name: `${testFuncName}(${toString(a)}${testFuncOperator}${toString(b)})`,
        param: [a, b],
        expected: validator(a,b)
      }))
      .forEach((testCase, index) => {
        const test = (tested, ...params) => {
          return tested(params[0], params[1]);
        };
        it(`Test #${index}: ${testCase.name}`, function () {
          if (testCase.exception) {
            expect(() => {
              test(testCase.tested, ...(testCase.param || []));
            }).to.throw(testCase.exception);
          } else {
            expect(() => {
              test(testCase.tested, ...(testCase.param || []));
            }).not.throw();
            const result = test(testCase.tested, ...(testCase.param || []));
            if ("expected" in testCase) {
              expect(result).to.equal(testCase.expected);
            }
            if ("tester" in testCase) {
              testCase.tester(result);
            }
          }
        });
      });
  });
});
});

describe("Predicate", function () {});

describe("Checker", function () {});

describe("List utilities - findListIndex", function () {});
