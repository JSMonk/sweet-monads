import * as fc from "fast-check";
import { left, merge, right } from "@sweet-monads/either";

describe("Either", () => {
  test("merge", () =>
    fc.assert(
      fc.property(fc.subarray(["1", "2", "3"]), fc.subarray(["4", "5", "6"]), (l, r) => {
        const mergedOne = merge([...l.map(x => left(x)), ...r.map(y => right(y))]);
        expect(mergedOne.isLeft()).toBe(l.length > 0);
        expect(mergedOne.isRight()).toBe(l.length === 0);

        const mergedTwo = merge([...r.map(y => right(y)), ...l.map(x => left(x))]);
        expect(mergedTwo.isLeft()).toBe(l.length > 0);
        expect(mergedTwo.isRight()).toBe(l.length === 0);
      })
    ));
});
