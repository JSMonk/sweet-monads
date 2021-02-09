import * as fc from "fast-check";
import { fromNullable, just, merge, none } from "@sweet-monads/maybe";

describe("Maybe", () => {
  test("merge", () =>
    fc.assert(
      fc.property(fc.subarray(["1", "2", "3"]), fc.subarray(["4", "5", "6"]), (noneItems, justItems) => {
        const mergedOne = merge([...noneItems.map(() => none()), ...justItems.map(y => just(y))]);
        expect(mergedOne.isNone()).toBe(noneItems.length > 0);
        expect(mergedOne.isJust()).toBe(noneItems.length === 0);

        const mergedTwo = merge([...justItems.map(y => just(y)), ...noneItems.map(() => none())]);
        expect(mergedTwo.isNone()).toBe(noneItems.length > 0);
        expect(mergedTwo.isJust()).toBe(noneItems.length === 0);
      })
    ));

  test("fromNullable", () =>
    fc.assert(
      fc.property(fc.option(fc.string()), option => {
        const nil = fromNullable(option);
        expect(nil.isJust()).toBe(option !== null && option !== undefined);
        expect(nil.isNone()).toBe(option === null || option === undefined);
      })
    ));
});
