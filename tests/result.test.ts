import * as fc from "fast-check";
import { failure, initial, merge, success, pending, Result } from "@sweet-monads/result";
describe("Result", () => {
  test.each([
    [initial(), true, false, false, false],
    [pending(), false, true, false, false],
    [success("s"), false, false, true, false],
    [failure("s"), false, false, false, true]
  ])("Static constants initializing ", async (input, initial, pending, success, failure) => {
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

  test("identity", () =>
    fc.assert(
      fc.property(fc.integer(), fc.string(), fc.boolean(), (int, str, bool) => {
        const v1 = initial();
        const v2 = pending();
        const v3 = success<TypeError, number>(int);
        const v4 = success<ReferenceError, string>(str);
        const v5 = success<ReferenceError, boolean>(bool);
        const v6 = failure<Error, boolean>(new Error());

        expect(v1.isInitial()).toBe(true);
        expect(v2.isPending()).toBe(true);
        expect(v3.isSuccess()).toBe(true);
        expect(v4.isSuccess()).toBe(true);
        expect(v5.isSuccess()).toBe(true);

        if (v3.isSuccess()) {
          expect(v3.value).toBe(int);
        }
        if (v4.isSuccess()) {
          expect(v4.value).toBe(str);
        }
        if (v5.isSuccess()) {
          expect(v5.value).toBe(bool);
        }
        expect(v6.isFailure()).toBe(true);
      })
    ));

  test("or", () =>
    fc.assert(
      fc.property(result(), result(), (x, y) => {
        const result = x.or(y);
        expect(result.isSuccess()).toBe(x.isSuccess() || y.isSuccess());
        expect(result).toBe(x.isSuccess() ? x : y);
      })
    ));

  test("join", () => {
    const v1 = success(success(2));
    const v2 = success(failure(new Error()));
    const v3 = failure<Float32Array, Result<Error, number>>(new Float32Array());

    const r1 = v1.join(); // Result.Success with value 2
    const r2 = v2.join(); // Result.Failure with value new Error
    const r3 = v3.join(); // Result.Failure with value new TypeError

    expect(r1.isSuccess()).toBe(true);
    if (r1.isSuccess()) {
      expect(r1.value).toBe(2);
    }
    expect(r2.isFailure()).toBe(true);
    if (r2.isFailure()) {
      expect(r2.value).toBeInstanceOf(Error);
    }

    expect(r3.isFailure()).toBe(true);
    if (r3.isFailure()) {
      expect(r3.value).toBeInstanceOf(Float32Array);
    }
  });

  test("map", () => {
    const v1 = success<Error, number>(2);
    const v2 = failure<Error, number>(new Error());

    const newVal1 = v1.map(a => a.toString()); // Result<Error, string>.Success with value "2"
    const newVal2 = v2.map(a => a.toString()); // Result<Error, string>.Failure with value new Error()
    expect(newVal1.isSuccess()).toBe(true);
    if (newVal1.isSuccess()) {
      expect(newVal1.value).toBe("2");
    }
    expect(newVal2.isFailure()).toBe(true);
    if (newVal2.isFailure()) {
      expect(newVal2.value).toBeInstanceOf(Error);
    }
  });

  test("mapSuccess", () => {
    const v1 = success<Error, number>(2);
    const v2 = failure<Error, number>(new Error());

    const newVal1 = v1.mapSuccess(a => a.toString()); // Result<Error, string>.Success with value "2"
    const newVal2 = v2.mapSuccess(a => a.toString()); // Result<Error, string>.Failure with value new Error()
    expect(newVal1.isSuccess()).toBe(true);
    if (newVal1.isSuccess()) {
      expect(newVal1.value).toBe("2");
    }
    expect(newVal2.isFailure()).toBe(true);
    if (newVal2.isFailure()) {
      expect(newVal2.value).toBeInstanceOf(Error);
    }
  });

  test("mapFailure", () => {
    const v1 = success<Error, number>(2);
    const v2 = failure<Error, number>(new Error());

    const newVal1 = v1.mapFailure(a => a.toString()); // Result<Error, string>.Success with value 2
    const newVal2 = v2.mapFailure(a => a.toString()); // Result<Error, string>.Failure with value new Error()
    expect(newVal1.isSuccess()).toBe(true);
    if (newVal1.isSuccess()) {
      expect(newVal1.value).toBe(2);
    }
    expect(newVal2.isFailure()).toBe(true);
    if (newVal2.isFailure()) {
      expect(newVal2.value).toBe("Error");
    }
  });
});

function result(): fc.Arbitrary<Result<string, number>> {
  return fc
    .integer(0, 3)
    .chain(v => fc.tuple(fc.string(), fc.constant(v)))
    .map(([str, num]) => {
      switch (num) {
        case 0:
          return initial<string, number>();
        case 1:
          return pending<string, number>();
        case 2:
          return success<string, number>(num);
        case 3:
          return failure<string, number>(str);
        default:
          throw new Error("unexpected value for Result arb");
      }
    })
    .noBias();
}
