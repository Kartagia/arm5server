import { describe, it } from "mocha";
import { AssertionError, expect } from "chai";
import {
  LooseEquality,
  SameValueEquality,
  SameValueZeroEquality,
  StrictEquality,
} from "../src/arm5tools/utils_covenant.mjs";

import {toString} from "../src/testkit/testcase.mjs";

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
