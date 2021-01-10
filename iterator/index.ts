import { MapOperation } from "./map-operation";
import { FilterOperation } from "./filter-operation";
import { IntermidiateOperation } from "./intermediate-operation";

type FromIterator<
  A,
  S extends Iterable<A> = Iterable<A>,
  T extends Iterable<A> = Iterable<A>
> = (source: S) => T;

const defaultFromIterator = function <I>(original: LazyIterator<I>): Array<I> {
  return [...original];
};

export default class LazyIterator<I> implements Iterable<I> {
  static from<I>(iterable: Iterable<I> | LazyIterator<I>) {
    return new LazyIterator<I>(iterable);
  }

  private static withOperation<A, B>(
    from: LazyIterator<A>,
    operation: IntermidiateOperation<A, B>
  ): LazyIterator<B> {
    // @ts-expect-error
    return new LazyIterator<B>(from.source, [
      ...from.operations,
      operation,
    ]);
  }

  private constructor(
    private readonly source: Iterable<I>,
    private readonly operations: Array<IntermidiateOperation<I, unknown>> = []
  ) {}

  /* Intermediate Operations */

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

  fold(fn: (a: I, i: I) => I): I;
  fold<A>(fn: (a: A, i: I) => A, accumulator: A): A;
  fold<A>(fn: (a: A | I, i: I) => A | I, accumulator?: A | I) {
    outer: for (let value of this.source) {
      for (let i = 0; i < this.operations.length; i++) {
        const operation = this.operations[i];
        const maybeValue = operation.execute(value);
        if (maybeValue.isNone()) continue outer;
        value = maybeValue.value as I;
      }
      if (accumulator === undefined) {
        accumulator = value;
      } else {
        accumulator = fn(accumulator, value);
      }
    }
    return accumulator;
  }


  // all<T extends I>(
  //   this: LazyIterator<I>,
  //   predicate: (i: I) => i is T
  // ): this is LazyIterator<T>;
  // all(predicate: (i: I) => boolean): boolean;
  // all(predicate: (i: I) => boolean) {
  //   for (const item of this) {
  //     if (!predicate(item)) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }

  // any(predicate: (i: I) => boolean) {
  //   for (const item of this) {
  //     if (predicate(item)) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  // chain(...otherIterators: Array<Iterable<I>>) {
  //   const iterators = [this, ...otherIterators];
  //   return new LazyIterator(function* () {
  //     for (const iterator of iterators) {
  //       yield* iterator;
  //     }
  //   });
  // }

  // count() {
  //   return this.fold((c) => c + 1, 0);
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

  // enumarate() {
  //   let index = 0;
  //   return this.map((item): [number, I] => [index++, item]);
  // }

  // first(): Maybe<I>;
  // first(withoutMaybe: false): Maybe<I>;
  // first(withoutMaybe: true): I | undefined;
  // first(withoutMaybe = false): Maybe<I> | I | undefined {
  //   const first = this[Symbol.iterator]().next();
  //   if (withoutMaybe) {
  //     return first.value;
  //   }
  //   return first.done ? none<I>() : just<I>(first.value);
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

  // find<T extends I>(predicate: (i: I) => i is T): Maybe<T>;
  // find<T extends I>(predicate: (i: I) => i is T, withoutMaybe: false): Maybe<T>;
  // find<T extends I>(
  //   predicate: (i: I) => i is T,
  //   withoutMaybe: true
  // ): T | undefined;
  // find(predicate: (i: I) => boolean): Maybe<I>;
  // find(predicate: (i: I) => boolean, withoutMaybe: false): Maybe<I>;
  // find(predicate: (i: I) => boolean, withoutMaybe: true): I | undefined;
  // find(predicate: (i: I) => boolean, withoutMaybe = false) {
  //   for (const item of this) {
  //     if (predicate(item)) {
  //       return withoutMaybe ? item : just<I>(item);
  //     }
  //   }
  //   return withoutMaybe ? undefined : none<I>();
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

  // forEach(fn: (i: I) => unknown) {
  //   for (const item of this) {
  //     fn(item);
  //   }
  // }

  // last(): Maybe<I>;
  // last(withoutMaybe: false): Maybe<I>;
  // last(withoutMaybe: true): I | undefined;
  // last(withoutMaybe = false) {
  //   const result = this.fold((_, a) => just<I>(a), none<I>());
  //   return withoutMaybe ? result.value : result;
  // }

  // max(f?: (i: I) => number): Maybe<I>;
  // max(f: (i: I) => number, withoutMaybe: false): Maybe<I>;
  // max(f: (i: I) => number, withoutMaybe: true): I | undefined;
  // max(getValue = id, withoutMaybe = false): Maybe<I> | I | undefined {
  //   const res = this.fold(
  //     (max, a) =>
  //       just<I>(
  //         max.isNone() || getValue(a) >= getValue(max.value)
  //           ? a
  //           : (max.value as I)
  //       ),
  //     none<I>()
  //   );
  //   return withoutMaybe ? res.value : res;
  // }

  // min(f?: (i: I) => number): Maybe<I>;
  // min(f: (i: I) => number, withoutMaybe: false): Maybe<I>;
  // min(f: (i: I) => number, withoutMaybe: true): I | undefined;
  // min(getValue = id, withoutMaybe = false): Maybe<I> | I | undefined {
  //   const res = this.fold(
  //     (max, a) =>
  //       just<I>(
  //         max.isNone() || getValue(a) < getValue(max.value)
  //           ? a
  //           : (max.value as I)
  //       ),
  //     none<I>()
  //   );
  //   return withoutMaybe ? res.value : res;
  // }

  // nth(n: number): Maybe<I>;
  // nth(n: number, withoutMaybe: false): Maybe<I>;
  // nth(n: number, withoutMaybe: true): I | undefined;
  // nth(n: number, withoutMaybe = false) {
  //   for (const item of this) {
  //     if (n-- <= 0) {
  //       return withoutMaybe ? item : just(item);
  //     }
  //   }
  //   return withoutMaybe ? undefined : none();
  // }

  // partion<T extends I>(predicate: (i: I) => i is T): [T[], I[]];
  // partion(predicate: (i: I) => boolean): [I[], I[]];
  // partion(fn: (i: I) => boolean): [I[], I[]] {
  //   const left = [];
  //   const right = [];
  //   for (const item of this) {
  //     if (fn(item)) {
  //       left.push(item);
  //     } else {
  //       right.push(item);
  //     }
  //   }
  //   return [left, right];
  // }

  // position(predicate: (i: I) => boolean): Maybe<number>;
  // position(predicate: (i: I) => boolean, withoutMaybe: false): Maybe<number>;
  // position(
  //   predicate: (i: I) => boolean,
  //   withoutMaybe: true
  // ): number | undefined;
  // position(predicate: (i: I) => boolean, withoutMaybe = false) {
  //   let index = 0;
  //   for (const item of this) {
  //     if (predicate(item)) {
  //       return withoutMaybe ? index : just(index);
  //     }
  //     index++;
  //   }
  //   return withoutMaybe ? undefined : none();
  // }

  // product(this: LazyIterator<number>) {
  //   return this.fold((res, a) => res * a, 1);
  // }

  // reverse(): LazyIterator<I> {
  //   const oldIterator = this instanceof Array ? this : [...this];
  //   return new LazyIterator(function* () {
  //     for (let i = oldIterator.length - 1; i >= 0; i -= 1) {
  //       yield oldIterator[i];
  //     }
  //   });
  // }

  // scan<A>(fn: (a: A, i: I) => A, accumulator: A) {
  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     for (const item of oldIterator) {
  //       accumulator = fn(accumulator, item);
  //       yield accumulator;
  //     }
  //   });
  // }

  // skip(n: number) {
  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     for (const item of oldIterator) {
  //       if (n-- <= 0) {
  //         yield item;
  //       }
  //     }
  //   });
  // }

  // skipWhile(predicate: (i: I) => boolean) {
  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     let shouldYield = false;
  //     for (const item of oldIterator) {
  //       if (!predicate(item) || shouldYield) {
  //         shouldYield = true;
  //         yield item;
  //       }
  //     }
  //   });
  // }

  // stepBy(step: number) {
  //   if (step <= 0) {
  //     throw new Error("step should be greater than 0");
  //   }

  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     let n = 0;
  //     for (const item of oldIterator) {
  //       if (--n > 0) {
  //         continue;
  //       }
  //       n = step;
  //       yield item;
  //     }
  //   });
  // }

  // sum(this: LazyIterator<number>) {
  //   return this.fold((sum, a) => sum + a, 0);
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

  // compress(mask: number[] | boolean[]) {
  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     let index = 0;
  //     for (const item of oldIterator) {
  //       const m = mask[index++];
  //       if (m === undefined) {
  //         return;
  //       }
  //       if (m) {
  //         yield item;
  //       }
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

  // compact<I>(this: LazyIterator<I | undefined>) {
  //   return this.filter((a: I | undefined): a is I => a !== undefined);
  // }

  // contains(elem: I) {
  //   return this.any((a) => a === elem);
  // }

  // unique() {
  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     const yieldedSet = new Set<I>();
  //     for (const item of oldIterator) {
  //       if (!yieldedSet.has(item)) {
  //         yieldedSet.add(item);
  //         yield item;
  //       }
  //     }
  //   });
  // }

  // isEmpty(): boolean {
  //   return this.first().isNone();
  // }

  // except(other: LazyIterator<I>) {
  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     for (const item of oldIterator) {
  //       if (!other.contains(item)) {
  //         yield item;
  //       }
  //     }
  //   });
  // }

  // intersect(other: LazyIterator<I>) {
  //   const oldIterator = this;
  //   return new LazyIterator(function* () {
  //     for (const item of oldIterator) {
  //       if (other.contains(item)) {
  //         yield item;
  //       }
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
