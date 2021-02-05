import * as fc from "fast-check";
import Result, { failure, initial, merge, success, pending } from "@sweet-monads/result";

describe("Result", () => {
  test.each([
    [Result.initial(), true, false, false, false],
    [Result.pending(), false, true, false, false],
    [Result.success("s"), false, false, true, false],
    [Result.failure("s"), false, false, false, true]
  ])("Static constants initializing ", (input, initial, pending, success, failure) => {
    expect(input.isInitial()).toBe(initial);
    expect(input.isPending()).toBe(pending);
    expect(input.isSuccess()).toBe(success);
    expect(input.isFailure()).toBe(failure);
  });

  test("merge", () =>
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

  test("chain", async () => {
    const getValue = async () => success<Error, number>(1);

    // Result<TypeError, number>
    const result = await getValue()
      .then(Result.chain(async v => success<Error, number>(v * 2)))
      .then(Result.chain(async g => failure<TypeError, number>(new TypeError("Unexpected"))));
  });
});
