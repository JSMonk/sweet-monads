import * as fc from "fast-check";
import {
  failure,
  initial,
  merge,
  success,
  pending,
  Result,
  fromMaybe,
  fromEither,
  mergeInMany
} from "@sweet-monads/result";
import { just, none } from "@sweet-monads/maybe";
import { left, right } from "@sweet-monads/either";

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

  test("fromMaybe", () =>
    fc.assert(
      fc.property(fc.integer(), int => {
        const v1 = just(int);
        const v2 = none<number>();

        const r1 = fromMaybe(v1);
        expect(r1.isSuccess()).toBe(true);

        const r2 = fromMaybe(v2);
        expect(r2.isInitial()).toBe(true);
      })
    ));

  test("fromEither", () =>
    fc.assert(
      fc.property(fc.integer(), fc.string(), (int, str) => {
        const v1 = right<string, number>(int);
        const v2 = left<string, number>(str);

        const r1 = fromEither(v1);
        expect(r1.isSuccess()).toBe(true);

        const r2 = fromEither(v2);

        expect(r2.isFailure()).toBe(true);
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

  test("asyncMap", async () => {
    const v1 = success<Error, number>(2);
    const v2 = failure<Error, number>(new Error());

    const newVal1 = v1.asyncMap(a => Promise.resolve(a.toString()));
    const newVal2 = v2.asyncMap(a => Promise.resolve(a.toString()));

    expect(newVal1).toBeInstanceOf(Promise);
    const r1 = await newVal1;
    expect(r1.isSuccess()).toBe(true);

    expect(newVal2).toBeInstanceOf(Promise);
    const r2 = await newVal2;
    expect(r2.isFailure()).toBe(true);
  });
});

test("apply", () => {
  const v1 = success<Error, number>(2);
  const v2 = failure<Error, number>(new Error());
  const fn1 = success<Error, (a: number) => number>((a: number) => a * 2);
  const fn2 = failure<Error, (a: number) => number>(new Error());

  const newVal1 = fn1.apply(v1);
  expect(newVal1.isSuccess()).toBe(true);
  if (newVal1.isSuccess()) {
    expect(newVal1.value).toBe(4);
  }

  const newVal2 = fn1.apply(v2);
  expect(newVal2.isFailure()).toBe(true);
  expect(newVal2.value).toBeInstanceOf(Error);

  const newVal3 = fn2.apply(v1);
  expect(newVal3.isFailure()).toBe(true);
  expect(newVal3.value).toBeInstanceOf(Error);

  const newVal4 = fn2.apply(v2);
  expect(newVal4.isFailure()).toBe(true);
  expect(newVal4.value).toBeInstanceOf(Error);
});

test("asyncApply", () => {
  const v1 = success<Error, number>(2);
  const v2 = failure<Error, number>(new Error());
  const fn1 = success<Error, (a: number) => Promise<number>>((a: number) => Promise.resolve(a * 2));
  const fn2 = failure<Error, (a: number) => Promise<number>>(new Error());

  /*   const newVal1 = fn1.asyncApply(v1); // Promise<Either<Error, number>.Right> with value 4
  const newVal2 = fn1.asyncApply(v2); // Promise<Either<Error, number>.Left> with value new Error()
  const newVal3 = fn2.asyncApply(v1); // Promise<Either<Error, number>.Left> with value new Error()
  const newVal4 = fn2.asyncApply(v2); // Promise<Either<Error, number>.Left> with value new Error() */
});

test("chain", () => {
  const v1 = success<Error, number>(2);
  const v2 = failure<Error, number>(new Error());
  const v3 = initial<Error, number>();

  // Result<Error | TypeError, string>.Success with value "2"
  const newVal1 = v1.chain(a => success<TypeError, string>(a.toString()));
  // Result<Error | TypeError, string>.Failure with value new TypeError()
  const newVal2 = v1.chain(a => failure<TypeError, string>(new TypeError()));
  // Result<Error | TypeError, string>.Failure with value new Error()
  const newVal3 = v2.chain(a => success<TypeError, string>(a.toString()));
  // Result<Error | TypeError, string>.Failure with value new Error()
  const newVal4 = v2.chain(a => failure<TypeError, string>(new TypeError()));
  // Result<Error | TypeError, string>.Initial with no value
  const newVal5 = v3.chain(a => failure<TypeError, string>(new TypeError()));

  expect(newVal1.isSuccess()).toBe(true);
  expect(newVal2.isFailure()).toBe(true);
  expect(newVal3.isFailure()).toBe(true);
  expect(newVal4.isFailure()).toBe(true);
  expect(newVal5.isInitial()).toBe(true);
});

test("asyncChain", async () => {
  const v1 = success<Error, number>(2);
  const v2 = failure<Error, number>(new Error());
  const v3 = initial<Error, number>();

  // Result<Error | TypeError, string>.Success with value "2"
  const newVal1 = v1.asyncChain(a => Promise.resolve(success<TypeError, string>(a.toString())));
  // Result<Error | TypeError, string>.Failure with value new TypeError()
  const newVal2 = v1.asyncChain(a => Promise.resolve(failure<TypeError, string>(new TypeError())));
  // Result<Error | TypeError, string>.Failure with value new Error()
  const newVal3 = v2.asyncChain(a => Promise.resolve(success<TypeError, string>(a.toString())));
  // Result<Error | TypeError, string>.Failure with value new Error()
  const newVal4 = v2.asyncChain(a => Promise.resolve(failure<TypeError, string>(new TypeError())));
  // Result<Error | TypeError, string>.Initial with no value
  const newVal5 = v3.asyncChain(a => Promise.resolve(failure<TypeError, string>(new TypeError())));

  expect((await newVal1).isSuccess()).toBe(true);
  expect((await newVal2).isFailure()).toBe(true);
  expect((await newVal3).isFailure()).toBe(true);
  expect((await newVal4).isFailure()).toBe(true);
  expect((await newVal5).isInitial()).toBe(true);
});

test("toEither", () =>
  fc.assert(
    fc.property(result(), r => {
      const either = r.toEither(
        () => "i",
        () => "p"
      );
      expect(either.isLeft()).toBe(r.isInitial() || r.isPending() || r.isFailure());
      expect(either.isRight()).toBe(r.isSuccess());
      if (r.isInitial()) {
        expect(either.value).toBe("i");
      }

      if (r.isPending()) {
        expect(either.value).toBe("p");
      }
      if (r.isFailure()) {
        expect(either.value).toBe(r.value);
      }
    })
  ));

test("toMaybe", () =>
  fc.assert(
    fc.property(result(), r => {
      const maybe = r.toMaybe();
      expect(maybe.isNone()).toBe(r.isInitial() || r.isPending() || r.isFailure());
      expect(maybe.isJust()).toBe(r.isSuccess());
      if (r.isSuccess()) {
        expect(maybe.value).toBe(r.value);
      }
    })
  ));

test("toNullable", () =>
  fc.assert(
    fc.property(result(), r => {
      const nullable = r.toNullable();

      if (r.isInitial() || r.isPending() || r.isFailure()) {
        expect(nullable).toBeNull();
      } else {
        expect(nullable).not.toBeNull();
      }
    })
  ));

test("toUndefined", () =>
  fc.assert(
    fc.property(result(), r => {
      const nullable = r.toUndefined();

      if (r.isInitial() || r.isPending() || r.isFailure()) {
        expect(nullable).toBeUndefined();
      } else {
        expect(nullable).not.toBeUndefined();
      }
    })
  ));

test("mergeInMany", () =>
  fc.assert(
    fc.property(result(), result(), (x, y) => {
      const r1 = mergeInMany([x, y]);
      expect(r1.isSuccess()).toBe(x.isSuccess() && y.isSuccess());
      // expect(r1.isFailure()).toBe(x.isFailure() || y.isFailure());
    })
  ));

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
