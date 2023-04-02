import { MapOperation } from "./map-operation";
import { FilterOperation } from "./filter-operation";
import { IntermidiateOperation } from "./intermediate-operation";
import MaybeConstructor, { Maybe, just, none } from "@sweet-monads/maybe";

type FromIterator<A, S extends Iterable<A> = Iterable<A>, T extends Iterable<A> = Iterable<A>> = (source: S) => T;

const defaultFromIterator = function <I>(original: Iterable<I>): Array<I> {
  return [...original];
};

const id: any = (x: number) => x;

export default class LazyIterator<I> implements Iterable<I> {
  static from<I>(iterable: Iterable<I> | LazyIterator<I>) {
    return iterable instanceof LazyIterator ? iterable : new LazyIterator<I>(iterable);
  }

  private static withOperation<A, B>(
    from: LazyIterator<A>,
    isCycled: boolean,
    ...operations: Array<IntermidiateOperation<A, B>>
  ): LazyIterator<B> {
    return new LazyIterator<B>(
      // @ts-expect-error Not sure why
      from.source,
      [...from.operations, ...operations],
      isCycled
    );
  }

  private constructor(
    private readonly source: Iterable<I>,
    private readonly operations: Array<IntermidiateOperation<I, unknown>> = [],
    private readonly isCycled: boolean = false
  ) {}

  /* Intermediate Operations */
  append(item: I) {
    return this.chain([item]);
  }

  chain(...otherIterators: Array<Iterable<I>>): LazyIterator<I> {
    return LazyIterator.from([this, ...otherIterators]).flatMap(LazyIterator.from);
  }

  compact<I>(this: LazyIterator<I | undefined>) {
    return this.filter((a: I | undefined): a is I => a !== undefined);
  }

  compress(mask: number[] | boolean[]) {
    let index = 0;
    return this.filter(() => Boolean(mask[index++]));
  }

  cycle() {
    return new LazyIterator(this.source, this.operations, true);
  }

  enumarate() {
    let index = 0;
    return this.map((item): [number, I] => [index++, item]);
  }

  except(other: LazyIterator<I>) {
    const existed = new Set<I>(other);
    return this.filter(value => !existed.has(value));
  }

  filter<T extends I>(predicate: (i: I) => i is T): LazyIterator<T>;
  filter(predicate: (i: I) => boolean): LazyIterator<I>;
  filter<T extends I>(predicate: (i: I) => i is T): LazyIterator<T> {
    return LazyIterator.withOperation(
      this,
      this.isCycled,
      new FilterOperation<I, T>((v): v is T => predicate(v))
    );
  }

  filterMap<T>(predicateMapper: (i: I) => Maybe<T>): LazyIterator<T>;
  filterMap<T>(predicateMapper: (i: I) => T | undefined): LazyIterator<T>;
  filterMap<T>(predicateMapper: (i: I) => Maybe<T> | T | undefined) {
    return LazyIterator.withOperation(
      this,
      this.isCycled,
      new MapOperation(i => predicateMapper(i)),
      new FilterOperation((v: I): v is I => (v instanceof MaybeConstructor ? v.isJust() : v !== undefined)),
      new MapOperation(v => (v instanceof MaybeConstructor ? v.value : v))
    );
  }

  flatten(this: LazyIterator<I | LazyIterator<I>>): LazyIterator<I> {
    return this.flatMap(x => x as LazyIterator<I>);
  }

  flatMap<N>(fn: (i: I) => LazyIterator<N>): LazyIterator<N> {
    return LazyIterator.withOperation(this, this.isCycled, new MapOperation(x => fn(x), true));
  }

  intersect(other: LazyIterator<I>): LazyIterator<I> {
    const existed = new Set<I>(other);
    return this.filter(value => existed.has(value));
  }

  map<T>(fn: (i: I) => T): LazyIterator<T> {
    return LazyIterator.withOperation(
      this,
      this.isCycled,
      new MapOperation<I, T>(x => fn(x))
    );
  }

  permutations(): LazyIterator<[I, I]> {
    return this.enumarate().flatMap(([i, x1]) =>
      this.enumarate().filterMap(([j, x2]) => (i !== j ? just([x1, x2]) : none()))
    );
  }

  prepend(item: I): LazyIterator<I> {
    return LazyIterator.from([item]).chain(this);
  }

  reverse(): LazyIterator<I> {
    if (this.isCycled) {
      throw new Error("Reverse can work only at finite iterable sequence.");
    }
    const oldIterator = this instanceof Array ? this : [...this];
    let i = oldIterator.length - 1;
    return this.map(() => oldIterator[i--]);
  }

  skip(n: number): LazyIterator<I> {
    return this.filter(() => n === 0 || n-- <= 0);
  }

  scan<A>(fn: (a: A, i: I) => A, accumulator: A): LazyIterator<A> {
    return this.map(value => (accumulator = fn(accumulator, value)));
  }

  skipWhile(predicate: (i: I) => boolean): LazyIterator<I> {
    let hasBeenFalse = false;
    return this.filter(i => hasBeenFalse || (hasBeenFalse = !predicate(i)));
  }

  slice(start = 0, end?: number): LazyIterator<I> {
    let index = 0;
    return LazyIterator.withOperation(
      this,
      end === undefined && this.isCycled,
      new FilterOperation((_, terminate): _ is I => {
        if (end !== undefined && index >= end) {
          terminate();
          return false;
        }
        return index++ >= start;
      })
    );
  }

  stepBy(step: number) {
    if (step <= 0) {
      throw new Error("step should be greater than 0");
    }

    let n = 0;

    return this.filter(() => {
      if (--n <= 0) {
        n = step;
        return true;
      }
      return false;
    });
  }

  take(n: number) {
    return LazyIterator.withOperation(
      this,
      false,
      new FilterOperation((_, terminate): _ is I => {
        if (n-- <= 0) {
          terminate();
          return false;
        }
        return true;
      })
    );
  }

  takeWhile(predicate: (i: I) => boolean) {
    return LazyIterator.withOperation(
      this,
      false,
      new FilterOperation((x, terminate): x is I => {
        if (!predicate(x)) {
          terminate();
          return false;
        }
        return true;
      })
    );
  }

  unique() {
    const existedValues = new Set<I>();
    return this.filter(value => {
      if (existedValues.has(value)) {
        return false;
      }
      existedValues.add(value);
      return true;
    });
  }

  zip<T>(other: LazyIterator<T>): LazyIterator<[I, T]> {
    const otherIterator = other[Symbol.iterator]();
    return LazyIterator.withOperation(
      this,
      this.isCycled,
      new MapOperation((first, terminate) => {
        const second = otherIterator.next();
        if (second.done) {
          terminate();
        }
        return [first, second.value];
      })
    );
  }
  /* Terminal Operations */

  collect(fromIterator: FromIterator<I> = defaultFromIterator): Iterable<I> {
    if (typeof fromIterator !== "function") {
      throw new Error("fromIteartor should be implemented as function for lazy iterating");
    }
    return fromIterator(this);
  }

  public *[Symbol.iterator](): Iterator<I> {
    let isEmpty = true;
    do {
      outer: for (let value of this.source) {
        isEmpty = false;
        for (let i = 0; i < this.operations.length; i++) {
          const operation = this.operations[i];
          const maybeValue = operation.execute(value);
          if (operation.isTerminated) {
            return;
          }
          if (maybeValue.isNone()) {
            continue outer;
          }
          value = maybeValue.value as I;
          if (operation.isFlat && value instanceof LazyIterator) {
            yield* LazyIterator.withOperation<I, I>(
              value,
              value.isCycled,
              ...(this.operations.slice(i + 1) as IntermidiateOperation<I, I>[])
            );
            continue outer;
          }
        }
        yield value;
      }
    } while (this.isCycled && !isEmpty);
  }

  forEach(fn: (i: I) => void | Maybe<void>) {
    if (this.isCycled) {
      throw new Error("All terminated methods will be infinity executed!");
    }
    outer: for (let value of this.source) {
      for (let i = 0; i < this.operations.length; i++) {
        const operation = this.operations[i];
        const maybeValue = operation.execute(value);
        if (operation.isTerminated) {
          return;
        }
        if (maybeValue.isNone()) {
          continue outer;
        }
        value = maybeValue.value as I;
        if (operation.isFlat && value instanceof LazyIterator) {
          LazyIterator.withOperation<I, I>(
            value,
            value.isCycled,
            ...(this.operations.slice(i + 1) as IntermidiateOperation<I, I>[])
          ).forEach(fn);
          continue outer;
        }
      }
      const result = fn(value);
      if (result instanceof MaybeConstructor && result.isNone()) {
        return;
      }
    }
  }

  all<T extends I>(this: LazyIterator<I>, predicate: (i: I) => i is T): this is LazyIterator<T>;
  all(predicate: (i: I) => boolean): boolean;
  all(predicate: (i: I) => boolean) {
    let result = true;
    // eslint-disable-next-line no-cond-assign
    this.forEach(value => ((result = predicate(value)) ? just(undefined) : none()));
    return result;
  }

  any(predicate: (i: I) => boolean) {
    let result = false;
    // eslint-disable-next-line no-cond-assign
    this.forEach(value => ((result = predicate(value)) ? none() : just(undefined)));
    return result;
  }

  count() {
    return this.fold(c => c + 1, 0);
  }

  contains(elem: I) {
    return this.any(a => a === elem);
  }

  find<T extends I>(predicate: (i: I) => i is T): Maybe<T>;
  find<T extends I>(predicate: (i: I) => i is T, withoutMaybe: false): Maybe<T>;
  find<T extends I>(predicate: (i: I) => i is T, withoutMaybe: true): T | undefined;
  find(predicate: (i: I) => boolean): Maybe<I>;
  find(predicate: (i: I) => boolean, withoutMaybe: false): Maybe<I>;
  find(predicate: (i: I) => boolean, withoutMaybe: true): I | undefined;
  find(predicate: (i: I) => boolean, withoutMaybe = false) {
    let foundValue = none<I>();
    this.forEach(value => {
      if (predicate(value)) {
        foundValue = just(value);
        return none();
      }
      return just(undefined);
    });
    return withoutMaybe ? foundValue.value : foundValue;
  }

  findMap<T>(predicateMapper: (i: I) => Maybe<T> | T | undefined): Maybe<I>;
  findMap<T>(predicateMapper: (i: I) => Maybe<T> | T | undefined, withoutMaybe: false): Maybe<T>;
  findMap<T>(predicateMapper: (i: I) => Maybe<T> | T | undefined, withoutMaybe: true): I | undefined;
  findMap<T>(predicateMapper: (i: I) => Maybe<T> | T | undefined, withoutMaybe = false) {
    let result = none<T>();

    this.forEach(item => {
      const maybeItem = predicateMapper(item);
      if ((maybeItem instanceof MaybeConstructor && maybeItem.isNone()) || maybeItem === undefined) {
        return just(undefined);
      }
      result = maybeItem instanceof MaybeConstructor ? maybeItem : just(maybeItem as T);
      return none();
    });

    return withoutMaybe ? result.value : result;
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
    this.forEach(value => {
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
      (max, a) => just<I>(max.isNone() || getValue(a) >= getValue(max.value) ? a : (max.value as I)),
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
      (max, a) => just<I>(max.isNone() || getValue(a) < getValue(max.value) ? a : (max.value as I)),
      none<I>()
    );
    return withoutMaybe ? res.value : res;
  }

  nth(n: number): Maybe<I>;
  nth(n: number, withoutMaybe: false): Maybe<I>;
  nth(n: number, withoutMaybe: true): I | undefined;
  nth(n: number, withoutMaybe = false) {
    let result = none<I>();
    this.forEach(value => {
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
  position(predicate: (i: I) => boolean, withoutMaybe: true): number | undefined;
  position(predicate: (i: I) => boolean, withoutMaybe = false) {
    let index = 0;
    let hasFound = false;
    this.forEach(value => {
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

  product(this: LazyIterator<number>): number {
    return this.fold((res, a) => res * a, 1);
  }

  sum(this: LazyIterator<number>): number {
    return this.fold((sum, a) => sum + a, 0);
  }

  unzip<A, B>(this: LazyIterator<[A, B]>): [A[], B[]] {
    const left: A[] = [];
    const right: B[] = [];
    return this.fold(
      ([left, right], [a, b]) => {
        left.push(a);
        right.push(b);
        return [left, right];
      },
      [left as A[], right as B[]]
    );
  }

  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
}
