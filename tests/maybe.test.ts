import * as fc from "fast-check";
import { fromNullable, just, merge, none } from "@sweet-monads/maybe";
import { left, right } from "../either";

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

  test("unwrap", () => {
    const v1 = just(2);
    const v2 = none();

    expect(v1.unwrap()).toBe(2);
    expect(() => v2.unwrap()).toThrow(new Error("Value is None"));

    const customError = new ReferenceError("Custom error message");

    expect(v1.unwrap(() => customError)).toBe(2);
    expect(() => v2.unwrap(() => customError)).toThrow(customError);
  });

  test("unwrapOr", () => {
    const v1 = just(2);
    const v2 = none<number>();

    expect(v1.unwrapOr(3)).toBe(2);
    expect(v2.unwrapOr(3)).toBe(3);
  });

  test("unwrapOrElse", () => {
    const v1 = just(2);
    const v2 = none<number>();

    expect(v1.unwrapOrElse(() => 6)).toBe(2);
    expect(v2.unwrapOrElse(() => 6)).toBe(6);
  });

  test("fold", () => {
    const mapNone = (): string | number => {
      return "none";
    };
    const mapJust = (value: number): string | number => {
      return value * 4;
    };
    expect(just(2).fold(mapNone, mapJust)).toBe(8);
    expect(none().fold(mapNone, mapJust)).toBe("none");
  });

  test("mapNullable", () => {
    const v1 = just(2);
    const v2 = none<number>();

    expect(v1.mapNullable(a => a.toString()).unwrap()).toBe("2");
    expect(v2.mapNullable(a => a.toString())).toBe(none());
    expect(v2.mapNullable<string | null>(a => null)).toBe(none());
    expect(v2.mapNullable<string | void>(a => undefined)).toBe(none());
  });
});
