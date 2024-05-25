import { describe, it } from "mocha";
import { AssertionError, expect } from "chai";
import {
  testTestCase,
  createTestCase,
  toString,
  paramsToString,
} from "../src/testkit/testcase.mjs";
import { PyramidAdvancementScheme } from "../src/arm5tools/ability.mjs";

/**
 * Test library for the leveled values.
 * @module test/model/ability/Leveled
 */

describe("Advancement scheme", function () {
  describe("Pyramid Advancement Scheme", function () {
    describe("Static method pyramidCost", function () {
      [
        [0, 1, 1],
        [0, 2, 3],
        [1, 3, 5],
        [3, 1, -5],
        [-3, 0, undefined],
      ]
        .map(([start, end, expected, exception = undefined]) =>
          createTestCase({
            name: `Pyramid cost from ${start} to ${end}`,
            tested: PyramidAdvancementScheme.pyramidCost,
            params: [start, end],
            test: (tested, ...params) => tested(...params),
            expected,
            exception,
          })
        )
        .forEach((testCase, testIndex) => {
          testTestCase(testCase, testIndex);
        });
    });

    const defaultValidConstructions = [
      [{ initCost: undefined, initLevel: undefined, costMultplier: undefined }],
      [{ initCost: 0, initLevel: 0, costMultplier: undefined }],
      [{ initCost: undefined, initLevel: undefined, costMultplier: undefined }],
    ];
    describe("Construction", function () {
      defaultValidConstructions.forEach(([params, exception = undefined]) => {
        it(`Params ${toString(params)}`, function () {
          try {
            const result = new PyramidAdvancementScheme(params);
          } catch (err) {
            if (exception) {
              expect(() => {
                throw err;
              }).to.throw(exception);
            } else {
              throw new AssertionError("Construction failed", { cause: err });
            }
          }
        });
      });
    });
  });
});
