import * as fc from "fast-check";
import { failure, initial, merge, success, pending } from "@sweet-monads/result";

describe("Result", () => {
  test.each([
    [initial(), true, false, false, false],
    [pending(), false, true, false, false],
    [success("s"), false, false, true, false],
    [failure("s"), false, false, false, true]
  ])("Static constants initializing ", (input, initial, pending, success, failure) => {
    expect(input.isInitial()).toBe(initial);
    expect(input.isPending()).toBe(pending);
    expect(input.isSuccess()).toBe(success);
    expect(input.isFailure()).toBe(failure);
  });

  test("merge states", () =>
    fc.assert(
      fc.property(
        fc.subarray(["1", "2", "3"]),
        fc.subarray(["4", "5", "6"]),
        fc.subarray(["7", "8", "9"]),
        fc.subarray(["0", "x", "y"]),
        (i, p, f, s) => {
          const merged = merge([
            ...i.map(() => initial()),
            ...p.map(() => pending()),
            ...f.map(e => failure<string, string>(e)),
            ...s.map(s => success<string, string>(s))
          ]);
          expect(merged.isInitial()).toBe(i.length > 0);
          expect(merged.isPending()).toBe(i.length === 0 && p.length > 0);
          expect(merged.isFailure()).toBe(i.length === 0 && p.length === 0 && f.length > 0);
          expect(merged.isSuccess()).toBe(i.length === 0 && p.length === 0 && f.length === 0 && s.length >= 0);
        }
      )
    ));

  test("merge types", () =>
    fc.assert(
      fc.property(fc.integer(), fc.string(), (int, str) => {
        const v1 = initial<TypeError, number>();
        const v2 = pending<TypeError, number>();
        const v3 = success<TypeError, number>(int);
        const v4 = success<ReferenceError, string>(str);
        const v5 = failure<Error, boolean>(new Error());

        const r1 = merge([v1, v2]);
        const r2 = merge([v2, v5]);
        const r3 = merge([v3, v4]);
        const r4 = merge([v3, v4, v5]);

        expect(r1.isInitial()).toBe(true);
        expect(r2.isPending()).toBe(true);
        expect(r3.isSuccess()).toBe(true);
        if (r3.isSuccess()) {
          expect(r3.value).toStrictEqual([int, str]);
        }
        expect(r4.isFailure()).toBe(true);
      })
    ));
});
