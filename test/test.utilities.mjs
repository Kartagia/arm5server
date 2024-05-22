import { describe, it } from "mocha";
import { AssertionError, expect } from "chai";
import {
  TrueSupplier,
  IteratorHelper,
  range,
} from "../src/arm5tools/utils.mjs";
import { toString } from "../src/testkit/testcase.mjs";

/**
 * The test library for testing utilities.
 * @module test/arm5tools/utilities
 */

/**
 * The iterator returnign Fibonacci sequence until the number is beyond maximum
 * safe integer.
 * @type {Iterator<number>}
 */
const fibonacci = (limit = Number.MAX_SAFE_INTEGER) => ({
  first: 0,
  second: 1,
  limit,
  next() {
    if (this.second <= this.limit) {
      const result = { done: false, value: this.second };
      [this.first, this.second] = [this.second, this.first + this.second];
      return result;
    } else {
      return { done: true };
    }
  },
  return() {
    if (this) {
      this.first = this.limit;
    }
    return { done: true };
  },
  throw() {
    if (this) {
      this.first = this.limit;
    }
    return { done: true };
  },
});

/**
 * A test function performing a test for value of type.
 *
 * The function may implement additional parameters.
 *
 * @template TYPE The type of the tested value.
 * @template [RESULT=undefined] The result value of the test function.
 * @template [PARAM=undefined] The type of the parameters.
 * @callback TestFunction
 * @param {TYPE} tested The tested value.
 * @param {PARAM} [parameters] The parameters of the test function.
 * @returns {RESULT} The result of hte test function.
 * @throws {AssertionError} The test failed.
 * @throws {SyntaxError} The test was called with an invalid parameters.
 */

/**
 * The test case.
 * @template TESTED The tested value type.
 * @tempalte [RESULT=undefined] The result value of the test function.
 * @template [PARAM=undefined] The parameter type.
 * @template [EXCEPTION=any] The possible exception type.
 * @typedef {Object} TestCase
 * @property {String} name The name of the test case.
 * @property {PARAM} [parameters] The parameters of the test case.
 * @property {TESTED} tested The tested value.
 * @property {TestFunction<TESTED, RESULT,PARAM>} [tester] The tester function of the test case.
 * @property {RESULT} [expected] The expected value of the test function.
 * @property {EXCEPTION} [exception] The excepted exception.
 */

/**
 * Creats a new test case.
 * @template TESTED The tested value type.
 * @template [RESULT=undefined] The type of the test function result.
 * @template [TYPE=undefined] The parameter type.
 * @template [EXCEPTION=any] The possible exception type.
 * @param {Partial<TestCase<TESTED, RESULT, TYPE,EXCEPTION>} param
 * @returns {TestCase<TESTED, RESULT, TYPE, EXCEPTION>}
 * @throws {TypeError} The parameter was invalid.
 */
function TestCase(param) {
  if (typeof param !== "object") {
    throw new TypeError("Invalid construction parameters for test case");
  } else if (typeof param.name !== "string") {
    throw new TypeError("Invalid test case name - not a string");
  }

  /**
   * The test case name.
   * @type {string}
   */
  this.name = param.name;

  /**
   * The additional parameters of the test function.
   * @type {TYPE|undefined}
   */
  this.parameters = param.parameters;
  /**
   * The tested value.
   * @type {TESTED}
   */
  this.tested = param.tested;
  /**
   * The test function.
   * @type {TestFunction<TESTED, RESULT, TYPE>}
   */
  this.tester = param.tester;
  /**
   * The expected result of the test function.
   * @type {RESULT|undefined}
   */
  this.expected = param.expected;

  /**
   * The expected exception thrown by the test case.
   * @type {EXCEPTION|undefined}
   */
  this.exception = param.exception;
}

/**
 * Test a test case.
 * The test title is generated from the index, and the test case name.
 * @template TESTED The tested type.
 * @template [RESULT=undefined] The result of the test function.
 * @template [PARAM=undefined] The additional parameter type of the test function.
 * @template [EXCEPTION=any] The possible exception thrown by the tester.
 * @param {TestCase<TESTED, RESULT, PARAM, EXCEPTION>} testCase
 * @param {number} [index] The index of the test case.
 */
function testTestCase(testCase, index = undefined) {
  it(`Test case${index == null ? "" : ` #${index}`}: ${
    testCase.name || ""
  }`, function () {
    try {
      const result = testCase.tester(testCase.tested, testCase.parameters);
      if (testCase.exception) {
        throw new AssertionError(
          `Expected exception ${testCase.exception} test case was not thrown`
        );
      } else {
        expect(result).deep.equal(testCase.expected);
      }
    } catch (err) {
      if (err instanceof AssertionError) {
        throw err;
      } else if (testCase.exception) {
        expect(() => {
          throw err;
        }).to.throw(testCase.exception);
      } else {
        if ("cause" in err) {
          console.error(`UNexpected exception caused by ${err.cause}`);
        }
        throw new AssertionError(`Unexpected exception ${err} thrown`);
      }
    }
  });
}

/**
 * Get the basic cases of the iterator helper testing.
 * @returns {Array<TestCase<IteratorHelper<number>, Iterator<number>>>} The default
 * test scases.
 */
function getBasicTestCases() {
  return [
    [
      "Empty iterator",
      /** @type {IteratorHelper<number>>} */ new IteratorHelper(),
      /** @type {number[]} */ [][Symbol.iterator](),
    ],
    ...[
      [],
      [1, 2, 3, 4, 5],
      [1, 1, 2, 3, 5, 8],
      [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
    ].map((array) => [
      `From array [${array.join(",")}] iterator`,
      /** @type {IteratorHelper<number>} */ new IteratorHelper(
        array[Symbol.iterator]()
      ),
      array[Symbol.iterator](),
    ]),
    [
      "Fibonacci",
      /** @type {IteratorHelper<number>} */ new IteratorHelper(fibonacci(55)),
      [1, 1, 2, 3, 5, 8, 13, 21, 34, 55][Symbol.iterator](),
    ],
  ].map(([name, tested, expected]) => new TestCase({ name, tested, expected }));
}

it("Test getBasicTestCases", function () {
  expect(() => {
    getBasicTestCases();
  }).not.throw;
  const result = getBasicTestCases();
  expect(result).instanceOf(Array);
  expect(result).property("length", 6);
  expect(result.every((testCase) => testCase instanceof TestCase)).true;
});

/**
 * Mocha test tetsting iterator helper.
 */
describe("IteratorHelper", function () {
  describe("Construction", function () {
    [
      [
        "Without parameters",
        [],
        (result) => {
          expect(result).instanceof(IteratorHelper);
          expect(() => {
            let value = result.next();
            expect(value).not.null;
            expect(value.done).true;
          }).to.not.throw();
        },
      ],
      [
        "From array iterator",
        [[1, 2, 3][Symbol.iterator]()],
        (result) => {
          expect(result).instanceof(IteratorHelper);
          expect(() => {
            let expectedIter = [1, 2, 3][Symbol.iterator]();
            let value = result.next();
            let expected = expectedIter.next();
            while (!expected.done) {
              expect(value).not.null;
              expect(expected.done).equal(value.done);
              expect(expected.value).equal(value.value);
              expected = expectedIter.next();
              value = result.next();
            }
            expect(value).not.null;
            expect(value.done).true;
          }).to.not.throw();
        },
      ],
      [
        "From iterator",
        [
          {
            value: 5,
            next() {
              if (this.value > 255) {
                return { done: true };
              } else {
                const result = {
                  done: false,
                  value: this.value,
                };
                this.value *= 5;
                return result;
              }
            },
          },
        ],
        (result) => {
          expect(result).instanceof(IteratorHelper);
          let expectedIter = [5, 25, 125][Symbol.iterator]();
          let value = result.next();
          let index = 0;
          let expected = expectedIter.next();
          while (!expected.done) {
            expect(value).not.null;
            expect(
              expected.done,
              `Value on iteration ${index} value ${value.value} done ${value.done}`
            ).equal(value.done);
            expect(
              expected.value,
              `Value on iteration ${index} was ${value.value} instead of ${expected.value}`
            ).equal(value.value);
            expected = expectedIter.next();
            value = result.next();
            index++;
          }
          expect(value).not.null;
          expect(value.done, `Iterator returned value of ${value.value}`).true;
        },
      ],
      [
        "With Fibonacci numbers",
        [fibonacci()],
        (result) => {
          expect(result).instanceof(IteratorHelper);
          const expectedIter = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55][
            Symbol.iterator
          ]();
          let expected = expectedIter.next();
          while (!expected.done) {
            const value = result.next();
            expect(value.done).false;
            expect(value.value).equal(expected.value);
            expected = expectedIter.next();
          }
        },
      ],
    ].forEach(
      ([name, param, tester = () => {}, exception = undefined], index) => {
        it(`Test case #${index}: ${name}`, function () {
          if (exception === undefined) {
            expect(() => new IteratorHelper(...param)).to.not.throw;
            console.log("Iterator helper created");
            const result = new IteratorHelper(...param);
            tester(result);
          } else {
            expect(() => new IteratorHelper(...param)).to.throw(exception);
          }
        });
      }
    );
  });

  describe("Method return", function () {
    getBasicTestCases()
      .map((testCase) => {
        return {
          ...testCase,
          tester: (result, param = undefined) => {
            const value = result.return();
            expect(value).not.null;
            expect(value.done).true;
            expect(value.value).undefined;
            expect(result.next()).property("done", true);
          },
          expected: undefined,
        };
      })
      .forEach((testCase, index) => {
        testTestCase(testCase, index);
      });
  });

  describe("Method throw", function () {
    getBasicTestCases()
      .map((testCase) => {
        return {
          ...testCase,
          tester: (result, param = undefined) => {
            const value = result.throw();
            expect(value).not.null;
            expect(value.done).true;
            expect(value.value).undefined;
            expect(result.next()).property("done", true);
          },
          expected: undefined,
        };
      })
      .forEach((testCase, index) => {
        testTestCase(testCase, index);
      });
  });

  describe("Method some", function () {
    [
      ...getBasicTestCases().reduce((result, testCase, index) => {
        if (testCase.expected && testCase.expected.length > 0) {
          result.push({
            ...testCase,
            name: testCase.name.concat(" success"),
            tester: (result, param = undefined) => {
              const value = result.some(
                (tested) =>
                  testCase.expected && testCase.expected.includes(tested)
              );
              expect(value).not.null;
              return value;
            },
            expected: testCase.expected.length > 0,
          });
        }
        return result;
      }, []),
      ...getBasicTestCases().reduce((result, testCase, index) => {
        result.push({
          ...testCase,
          name: testCase.name.concat(" failure seeking undefined"),
          tester: (result, param = undefined) => {
            const value = result.some((tested) => tested === undefined);
            expect(value).not.null;
            return value;
          },
          expected: false,
        });
        return result;
      }, []),
    ].forEach((testCase, index) => {
      testTestCase(testCase, index);
    });
  });

  describe("Method every", function () {
    [
      ...getBasicTestCases().reduce((result, testCase, index) => {
        const expected = [...testCase.expected];
        result.push({
          ...testCase,
          name: testCase.name.concat(" success"),
          tester: (result, param = undefined) => {
            const value = result.every(
              (tested) => testCase.expected && expected.includes(tested)
            );
            expect(value).not.null;
            return value;
          },
          expected: true,
        });
        return result;
      }, []),
      ...getBasicTestCases().reduce((result, testCase, index) => {
        const expected = [...(testCase.expected || [])];
        if (expected && expected.length > 1) {
          const expectedValue = expected[0];
          result.push({
            ...testCase,
            name: testCase.name.concat(` seeking ${expectedValue}`),
            tester: (result, param = undefined) => {
              return result.every((tested) => tested === expectedValue);
            },
            expected: false,
          });
          return result;
        }
        return result;
      }, []),
    ].forEach((testCase, index) => {
      testTestCase(testCase, index);
    });
  });

  describe("Method find", function () {
    [
      ...getBasicTestCases().reduce((result, testCase, index) => {
        if (testCase.expected && testCase.expected.length) {
          const expectedIndex = Math.floor(
            Math.random() * testCase.expected.length
          );
          const expected = testCase.expected[expectedIndex];
          result.push({
            ...testCase,
            name: testCase.name.concat(` seeking ${expected} succeeding`),
            tester(result, index) {
              return result.find((tested) => tested === expected);
            },
            expected,
          });
        } else {
          result.push({
            ...testCase,
            name: testCase.name.concat(` seeking undefined failing`),
            tester(result, index) {
              return (
                result.find((tested) => tested === undefined) === undefined
              );
            },
            expected: true,
          });
        }
        return result;
      }, []),
      ...getBasicTestCases().reduce((result, testCase, index) => {
        if (testCase.expected && testCase.expected.length) {
          const expectedIndex = Math.floor(
            Math.random() * testCase.expected.length
          );
          const expected = -testCase.expected[expectedIndex];
          result.push({
            ...testCase,
            name: testCase.name.concat(` seeking ${expected} failing`),
            tester(result, index) {
              return result.find((tested) => tested === expected) === undefined;
            },
            expected: true,
          });
        }
        return result;
      }, []),
    ].forEach((testCase, index) => {
      testTestCase(testCase, index);
    });
  });

  describe("Method filter", function () {
    [
      ...getBasicTestCases().reduce((result, testCase, index) => {
        if (testCase.expected && testCase.expected.length) {
          const expectedIndex = Math.floor(
            Math.random() * testCase.expected.length
          );
          const expected = testCase.expected[expectedIndex];
          result.push({
            ...testCase,
            name: testCase.name.concat(` seeking ${expected} in test case`),
            tester(result, index) {
              const value = result.filter((tested) => tested === expected);
              expect(value).not.null;
              const expectedIter = testCase.expected.filter(
                (tested) => tested === expected
              );
              let expectedCursor = expectedIter.next();
              while (!expectedCursor.done) {
                const cursor = value.next();
                expect(cursor).property("done", false);
                expect(cursor).property("value", expected);
                expectedCursor = expectedIter.next();
              }
              expect(cursor.next()).property("done", true);
            },
            expected: undefined,
          });
        } else {
          result.push({
            ...testCase,
            name: testCase.name.concat(` seeking undefined not in test cases`),
            tester(result, index) {
              const value = result.filter((tested) => tested === undefined);
              expect(value).not.null;
              const cursor = value.next();
              expect(cursor).property("done", true);
            },
            expected: undefined,
          });
        }
        return result;
      }, []),
    ].forEach((testCase, index) => {
      testTestCase(testCase, index);
    });
  });

  describe("method map basic test", function () {
    const mapper = (value, index) => `${index}:${toString(value)}`;
    it("Empty iterator", function () {
      const tested = new IteratorHelper();
      expect(tested).instanceof(IteratorHelper);
      let result = undefined;
      expect(() => {
        result = tested.map(mapper);
      }).not.throw();
      expect(result).instanceof(IteratorHelper);
      expect(result).property("next");
      let cursor = result.next();
      expect(cursor, "Next returned undefined").not.undefined;
      expect(cursor, "The iteration is not done").property("done", true);
    });
    it("Fibonacci(5)", function () {
      const tested = new IteratorHelper(fibonacci(5));
      expect(tested).instanceof(IteratorHelper);
      let cursor = tested.next();
      let f1 = 0,
        f2 = 1;
      while (!cursor.done) {
        expect(cursor.value).equal(f2);
        [f1, f2] = [f2, f1 + f2];
        cursor = tested.next();
      }
      expect(f1).equal(5);
    });
  });

  describe("Method map", function () {
    [
      ...getBasicTestCases().reduce((result, testCase, index) => {
        const func = (/** @type {number} */ entry, entryIndex) =>
          `Entry #${entryIndex}:${toString(entry)}`;
        const expectedIter = testCase.expected;
        result.push({
          ...testCase,
          name: testCase.name.concat(
            ` mapping values to strings`
          ),
          tester(/** @type {IteratorHelper<number>} */ result, index) {
            const value = result.map(func);
            expect(value).not.null;
            let iterIndex = 0;
            expect(expectedIter).instanceof(Object);
            expect(expectedIter).property("next");
            let expected = expectedIter.next();
            let cursor = value.next();
          },
          expected: undefined
        });
        return result;
      }, []),
    ].forEach((testCase, index) => {
      testTestCase(testCase, index);
    });
  });

  describe.skip("Method drop", function () {
    [
      ...getBasicTestCases().reduce((result, testCase, index) => {
        return result;
      }, []),
    ].forEach((testCase, index) => {
      testTestCase(testCase, index);
    });
  });

  describe.skip("Method take", function () {
    [
      ...getBasicTestCases().reduce((result, testCase, index) => {
        return result;
      }, []),
    ].forEach((testCase, index) => {
      testTestCase(testCase, index);
    });
  });

  describe.skip("Method map", function () {
    [
      ...getBasicTestCases().reduce((result, testCase, index) => {
        return result;
      }, []),
    ].forEach((testCase, index) => {
      testTestCase(testCase, index);
    });
  });

  describe.skip("Method flat map", function () {
    [
      ...getBasicTestCases().reduce((result, testCase, index) => {
        return result;
      }, []),
    ].forEach((testCase, index) => {
      testTestCase(testCase, index);
    });
  });
});

/**
 * Mocha test testing generic range.
 */
describe.skip("Generic range", function () {});
