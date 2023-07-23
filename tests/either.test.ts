import * as fc from "fast-check";
import { Either, left, merge, right, fromTry, fromPromise } from "@sweet-monads/either";

describe("Either", () => {
  test("merge generic", () =>
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

  test("merge concrete", () => {
    const v1 = right<TypeError, number>(2);
    const v2 = right<ReferenceError, string>("test");
    const v3 = left<Error, boolean>(new Error());
    const v4 = left<Int8Array, boolean>(new Int8Array());
    const v5 = left<Float32Array, boolean>(new Float32Array());

    expect(merge([v1, v2]).value).toStrictEqual([2, "test"]);
    expect(merge([v1, v2, v3]).value).toBeInstanceOf(Error);
  });
  test("join", () => {
    const v1 = right(right(2));
    const v2 = right(left(new Error()));
    const v3 = left<TypeError, Either<Error, number>>(new TypeError());

    const r1 = v1.join();
    const r2 = v2.join();
    const r3 = v3.join();
    expect(r1.isRight());
    if (r1.isRight()) {
      expect(r1.value).toBe(2);
    }
    expect(r2.isLeft());
    if (r2.isLeft()) {
      expect(r2.value).toBeInstanceOf(Error);
    }

    expect(r3.isLeft());
    if (r3.isLeft()) {
      expect(r3.value).toBeInstanceOf(TypeError);
    }
  });

  test("asyncApply", () => {
    const v1 = right<Error, number>(2);
    const v2 = left<Error, number>(new Error());
    const fn1 = right<Error, (a: number) => Promise<number>>((a: number) => Promise.resolve(a * 2));
    const fn2 = left<Error, (a: number) => Promise<number>>(new Error());
  });

  test("unwrap", () => {
    const v1 = right<TypeError, number>(2);
    const v2 = left<TypeError, number>(new TypeError());

    expect(v1.unwrap()).toBe(2);
    expect(() => v2.unwrap()).toThrow(new Error("Either state is Left"));

    expect(v1.unwrap(() => new TypeError("NEVER!"))).toBe(2);
    expect(() => v2.unwrap(x => x)).toThrow(v2.value as TypeError);
  });

  test("unwrapOr", () => {
    const v1 = right<Error, number>(2);
    const v2 = left<Error, number>(new Error());

    expect(v1.unwrapOr(3)).toBe(2);
    expect(v2.unwrapOr(3)).toBe(3);
  });

  test("unwrapOrElse", () => {
    const v1 = right<number, number>(2);
    const v2 = left<number, number>(3);

    expect(v1.unwrapOrElse(x => x * 2)).toBe(2);
    expect(v2.unwrapOrElse(x => x * 2)).toBe(6);
  });

  test("fromTry", () => {
    const error = new Error("test");
    const v1 = fromTry(() => 1);
    const v2 = fromTry(() => {
      throw error;
    });

    expect(v1.unwrap()).toBe(1);
    expect(v2.value).toBe(error);
    expect(v2.isLeft()).toBe(true);
  });
  test("fromPromise", async () => {
    const error = new Error("test");
    const v1 = await fromPromise(Promise.resolve(1));
    const v2 = await fromPromise(Promise.reject(error));

    expect(v1.unwrap()).toBe(1);
    expect(v2.value).toBe(error);
    expect(v2.isLeft()).toBe(true);
  });
  test("toString", () => {
    expect(right(1).toString()).toBe("[object Either]");
    expect(left(1).toString()).toBe("[object Either]");
  });

  test("fold", () => {
    const mapLeft = (value: number) => {
      return value * 2;
    };
    const mapRight = (value: number) => {
      return value * 3;
    };
    expect(right(2).fold(mapLeft, mapRight)).toBe(6);
    expect(left(1).fold(mapLeft, mapRight)).toBe(2);
  });
});
