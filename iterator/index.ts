import { MapOperation } from "./map-operation";
import { FilterOperation } from "./filter-operation";
import { IntermidiateOperation } from "./intermediate-operation";
import MaybeConstructor, { Maybe, just, none } from "@sweet-monads/maybe";

type FromIterator<
  A,
  S extends Iterable<A> = Iterable<A>,
  T extends Iterable<A> = Iterable<A>
> = (source: S) => T;

const defaultFromIterator = function <I>(original: LazyIterator<I>): Array<I> {
  return [...original];
};

const id: any = (x: number) => x;

export default class LazyIterator<I> implements Iterable<I> {
  static from<I>(iterable: Iterable<I> | LazyIterator<I>) {
    return new LazyIterator<I>(iterable);
  }

  private static withOperation<A, B>(
    from: LazyIterator<A>,
    operation: IntermidiateOperation<A, B>
  ): LazyIterator<B> {
    // @ts-expect-error
    return new LazyIterator<B>(from.source, [...from.operations, operation]);
  }

  private constructor(
    private readonly source: Iterable<I>,
    private readonly operations: Array<IntermidiateOperation<I, unknown>> = []
  ) {}

  /* Intermediate Operations */
  compact<I>(this: LazyIterator<I | undefined>) {
    return this.filter((a: I | undefined): a is I => a !== undefined);
  }

  enumarate() {
    let index = 0;
    return this.map((item): [number, I] => [index++, item]);
  }

  filter<T extends I>(predicate: (i: I) => i is T): LazyIterator<T>;
  filter(predicate: (i: I) => boolean): LazyIterator<I>;
  filter<T extends I>(predicate: (i: I) => i is T): LazyIterator<T> {
    return LazyIterator.withOperation(
      this,
      new FilterOperation<I, T>(predicate)
    );
  }

  map<T>(fn: (i: I) => T): LazyIterator<T> {
    return LazyIterator.withOperation(this, new MapOperation<I, T>(fn));
  }

  skip(n: number) {
    return this.filter(() => n === 0 || n-- > 0);
  }

  scan<A>(fn: (a: A, i: I) => A, accumulator: A) {
    return this.map((value) => (accumulator = fn(accumulator, value)));
  }

  skipWhile(predicate: (i: I) => boolean) {
    let hasBeenTrue = false;
    return this.filter((i) => hasBeenTrue || (hasBeenTrue = predicate(i)));
  }

  stepBy(step: number) {
    if (step <= 0) {
      throw new Error("step should be greater than 0");
    }

    let n = step;

    return this.filter(() => {
      if (--n > 0) {
        return false;
      }
      n = step;
      return true;
    });
  }

  unique() {
    const existedValues = new Set<I>();
    return this.filter((value) => {
      if (existedValues.has(value)) {
        return false;
      }
      existedValues.add(value);
      return true;
    });
  }

  /* Terminal Operations */

  collect(fromIterator: FromIterator<I> = defaultFromIterator): Iterable<I> {
    if (typeof fromIterator !== "function") {
      throw new Error(
        "fromIteartor should be implemented as function for lazy iterating"
      );
    }
    return fromIterator(this);
  }

  public *[Symbol.iterator](): Iterator<I> {
    outer: for (let value of this.source) {
      for (let i = 0; i < this.operations.length; i++) {
        const operation = this.operations[i];
        const maybeValue = operation.execute(value);
        if (maybeValue.isNone()) continue outer;
        value = maybeValue.value as I;
      }
      yield value;
    }
  }

  forEach(fn: (i: I) => void | Maybe<void>) {
    outer: for (let value of this.source) {
      for (let i = 0; i < this.operations.length; i++) {
        const operation = this.operations[i];
        const maybeValue = operation.execute(value);
        if (maybeValue.isNone()) continue outer;
        value = maybeValue.value as I;
      }
      const result = fn(value);
      if (result instanceof MaybeConstructor && result.isNone()) {
        return;
      }
    }
  }

  all<T extends I>(
    this: LazyIterator<I>,
    predicate: (i: I) => i is T
  ): this is LazyIterator<T>;
  all(predicate: (i: I) => boolean): boolean;
  all(predicate: (i: I) => boolean) {
    let result = true;
    this.forEach((value) =>
      (result = predicate(value)) ? just(undefined) : none()
    );
    return result;
  }

  any(predicate: (i: I) => boolean) {
    let result = false;
    this.forEach((value) =>
      (result = predicate(value)) ? none() : just(undefined)
    );
    return result;
  }

  count() {
    return this.fold((c) => c + 1, 0);
  }

  compress(mask: number[] | boolean[]) {
    let index = 0;
    return this.filter(() => Boolean(mask[index++]));
  }

  contains(elem: I) {
    return this.any((a) => a === elem);
  }

  except(other: LazyIterator<I>) {
    const existed = new Set<I>(other);
    return this.filter((value) => !existed.has(value));
  }

  intersect(other: LazyIterator<I>) {
    const existed = new Set<I>(other);
    return this.filter((value) => existed.has(value));
  }

  find<T extends I>(predicate: (i: I) => i is T): Maybe<T>;
  find<T extends I>(predicate: (i: I) => i is T, withoutMaybe: false): Maybe<T>;
  find<T extends I>(
    predicate: (i: I) => i is T,
    withoutMaybe: true
  ): T | undefined;
  find(predicate: (i: I) => boolean): Maybe<I>;
  find(predicate: (i: I) => boolean, withoutMaybe: false): Maybe<I>;
  find(predicate: (i: I) => boolean, withoutMaybe: true): I | undefined;
  find(predicate: (i: I) => boolean, withoutMaybe = false) {
    let foundValue = none<I>();
    this.forEach((value) => {
      if (predicate(value)) {
        foundValue = just(value);
        return none();
      }
      return just(undefined);
    });
    return withoutMaybe ? foundValue.value : foundValue;
  }

  first(): Maybe<I>;
  first(withoutMaybe: false): Maybe<I>;
  first(withoutMaybe: true): I | undefined;
  first(withoutMaybe = false): Maybe<I> | I | undefined {
    const first = this[Symbol.iterator]().next();
    if (withoutMaybe) {
      return first.value;
    }
    return first.done ? none<I>() : just<I>(first.value);
  }

  fold(fn: (a: I, i: I) => I): I;
  fold<A>(fn: (a: A, i: I) => A, accumulator: A): A;
  fold<A>(fn: (a: A | I, i: I) => A | I, accumulator?: A | I) {
    this.forEach((value) => {
      if (accumulator === undefined) {
        accumulator = value;
      } else {
        accumulator = fn(accumulator, value);
      }
    });
    return accumulator;
  }

  isEmpty(): boolean {
    return this.first().isNone();
  }

  last(): Maybe<I>;
  last(withoutMaybe: false): Maybe<I>;
  last(withoutMaybe: true): I | undefined;
  last(withoutMaybe = false) {
    const result = this.fold((_, a) => just<I>(a), none<I>());
    return withoutMaybe ? result.value : result;
  }

  max(this: LazyIterator<number>): Maybe<I>;
  max(f: (i: I) => number): Maybe<I>;
  max(f: (i: I) => number, withoutMaybe: false): Maybe<I>;
  max(f: (i: I) => number, withoutMaybe: true): I | undefined;
  max(getValue = id, withoutMaybe = false): Maybe<I> | I | undefined {
    const res = this.fold(
      (max, a) =>
        just<I>(
          max.isNone() || getValue(a) >= getValue(max.value)
            ? a
            : (max.value as I)
        ),
      none<I>()
    );
    return withoutMaybe ? res.value : res;
  }

  min(this: LazyIterator<number>): Maybe<I>;
  min(f?: (i: I) => number): Maybe<I>;
  min(f: (i: I) => number, withoutMaybe: false): Maybe<I>;
  min(f: (i: I) => number, withoutMaybe: true): I | undefined;
  min(getValue = id, withoutMaybe = false): Maybe<I> | I | undefined {
    const res = this.fold(
      (max, a) =>
        just<I>(
          max.isNone() || getValue(a) < getValue(max.value)
            ? a
            : (max.value as I)
        ),
      none<I>()
    );
    return withoutMaybe ? res.value : res;
  }

  nth(n: number): Maybe<I>;
  nth(n: number, withoutMaybe: false): Maybe<I>;
  nth(n: number, withoutMaybe: true): I | undefined;
  nth(n: number, withoutMaybe = false) {
    let result = none<I>();
    this.forEach((value) => {
      if (n-- <= 0) {
        result = just(value);
        return none();
      }
      return just(undefined);
    });
    return withoutMaybe ? result.value : result;
  }

  partion<T extends I>(predicate: (i: I) => i is T): [T[], I[]];
  partion(predicate: (i: I) => boolean): [I[], I[]];
  partion(predicate: (i: I) => boolean): [I[], I[]] {
    return this.fold(
      ([left, right], value) => {
        if (predicate(value)) {
          left.push(value);
        } else {
          right.push(value);
        }
        return [left, right];
      },
      [[] as I[], [] as I[]]
    );
  }

  position(predicate: (i: I) => boolean): Maybe<number>;
  position(predicate: (i: I) => boolean, withoutMaybe: false): Maybe<number>;
  position(
    predicate: (i: I) => boolean,
    withoutMaybe: true
  ): number | undefined;
  position(predicate: (i: I) => boolean, withoutMaybe = false) {
    let index = 0;
    let hasFound = false;
    this.forEach((value) => {
      if (predicate(value)) {
        hasFound = true;
        return none();
      }
      index++;
      return just(undefined);
    });
    const result = hasFound ? just(index) : none();
    return withoutMaybe ? result.value : result;
  }

  product(this: LazyIterator<number>) {
    return this.fold((res, a) => res * a, 1);
  }

  sum(this: LazyIterator<number>) {
    return this.fold((sum, a) => sum + a, 0);
  }

  // chain(...otherIterators: Array<Iterable<I>>) {
  //   const iterators = [this, ...otherIterators];
  //   return new LazyIterator(function* () {
  //     for (const iterator of iterators) {
  //       yield* iterator;
  //     }
  //   });
  // }

  // cycle() {
  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     const iterator = oldIterator[Symbol.iterator]().next();
  //     if (iterator.done) {
  //       return;
  //     }
  //     while (true) {
  //       yield* oldIterator;
  //     }
  //   });
  // }

  // filterMap<T>(predicateMapper: (i: I) => Maybe<T>): LazyIterator<T>;
  // filterMap<T>(predicateMapper: (i: I) => T | undefined): LazyIterator<T>;
  // filterMap<T>(predicateMapper: (i: I) => Maybe<T> | T | undefined) {
  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     for (const item of oldIterator) {
  //       const maybeItem = predicateMapper(item);
  //       if (
  //         (isMaybe(maybeItem) && maybeItem.isJust()) ||
  //         (!isMaybe(maybeItem) && maybeItem !== undefined)
  //       ) {
  //         yield isMaybe(maybeItem) ? maybeItem.value : maybeItem;
  //       }
  //     }
  //   });
  // }

  // findMap<T>(predicateMapper: (i: I) => Maybe<T> | T | undefined): Maybe<I>;
  // findMap<T>(
  //   predicateMapper: (i: I) => Maybe<T> | T | undefined,
  //   withoutMaybe: false
  // ): Maybe<T>;
  // findMap<T>(
  //   predicateMapper: (i: I) => Maybe<T> | T | undefined,
  //   withoutMaybe: true
  // ): I | undefined;
  // findMap<T>(
  //   predicateMapper: (i: I) => Maybe<T> | T | undefined,
  //   withoutMaybe = false
  // ) {
  //   for (const item of this) {
  //     const maybeItem = predicateMapper(item);
  //     if (
  //       (isMaybe(maybeItem) && maybeItem.isNone()) ||
  //       maybeItem === undefined
  //     ) {
  //       continue;
  //     }
  //     return withoutMaybe
  //       ? isMaybe(maybeItem)
  //         ? maybeItem.value
  //         : maybeItem
  //       : isMaybe(maybeItem)
  //       ? maybeItem
  //       : just(maybeItem);
  //   }
  //   return withoutMaybe ? undefined : none<I>();
  // }

  // flatMap<N>(fn: (i: I) => LazyIterator<N>): LazyIterator<N> {
  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     for (const item of oldIterator) {
  //       yield* fn(item);
  //     }
  //   });
  // }

  // flatten(this: LazyIterator<I | Iterable<I>>): LazyIterator<I> {
  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     for (const item of oldIterator) {
  //       if (
  //         item != undefined &&
  //         typeof item === "object" &&
  //         Symbol.iterator in item
  //       ) {
  //         yield* item as Iterable<I>;
  //       } else {
  //         yield item as I;
  //       }
  //     }
  //   });
  // }

  // reverse(): LazyIterator<I> {
  //   const oldIterator = this instanceof Array ? this : [...this];
  //   return new LazyIterator(function* () {
  //     for (let i = oldIterator.length - 1; i >= 0; i -= 1) {
  //       yield oldIterator[i];
  //     }
  //   });
  // }

  // take(n: number) {
  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     for (const item of oldIterator) {
  //       if (n-- <= 0) {
  //         return;
  //       }
  //       yield item;
  //     }
  //   });
  // }

  // takeWhile(predicate: (i: I) => boolean) {
  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     for (const item of oldIterator) {
  //       if (!predicate(item)) {
  //         return;
  //       }
  //       yield item;
  //     }
  //   });
  // }

  // unzip<A, B>(this: LazyIterator<[A, B]>): [A[], B[]] {
  //   const left: A[] = [];
  //   const right: B[] = [];
  //   for (const [a, b] of this) {
  //     left.push(a);
  //     right.push(b);
  //   }
  //   return [left, right];
  // }

  // zip<T>(other: LazyIterator<T>) {
  //   const self = this;
  //   return new LazyIterator(function* () {
  //     const selfIterator = self[Symbol.iterator]();
  //     const otherIterator = other[Symbol.iterator]();
  //     let first = selfIterator.next();
  //     let second = otherIterator.next();
  //     while (!first.done && !second.done) {
  //       yield [first.value, second.value] as [I, T];
  //       first = selfIterator.next();
  //       second = otherIterator.next();
  //     }
  //   });
  // }

  // permutations() {
  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     let i1 = 0;
  //     for (const item1 of oldIterator) {
  //       let i2 = 0;
  //       for (const item2 of oldIterator) {
  //         if (i1 !== i2) {
  //           yield [item1, item2] as [I, I];
  //         }
  //         i2 += 1;
  //       }
  //       i1 += 1;
  //     }
  //   });
  // }

  // slice(start = 0, end?: number) {
  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     let index = 0;
  //     for (const item of oldIterator) {
  //       if (end !== undefined && index >= end) {
  //         return;
  //       }
  //       if (index >= start) {
  //         yield item;
  //       }
  //       index += 1;
  //     }
  //   });
  // }

  // prepend(item: I) {
  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     yield item;
  //     yield* oldIterator;
  //   });
  // }

  // append(item: I) {
  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     yield* oldIterator;
  //     yield item;
  //   });
  // }
}
