import { Maybe } from "@sweet-monads/maybe";

type IteratorCreator<T> = () => Iterator<T>;
type FromIterator = <I>() => Iterable<I>;

const GENERATE_WITH = Symbol("GENERATE_WITH");

const id = (x: any) => x;

const defaultFromIterator = function() {
  return [...this];
};

export class LazyIterator<I> implements Iterable<I> {
  static from<I>(item: Iterable<I>, fromIterator?: FromIterator) {
    return new LazyIterator<I>(item[Symbol.iterator].bind(item), fromIterator);
  }

  private fromIterator: FromIterator;
  public readonly [Symbol.iterator]: IteratorCreator<I>;

  constructor(
    initialIterator: IteratorCreator<I>,
    fromIterator: FromIterator = defaultFromIterator
  ) {
    if (typeof initialIterator !== "function") {
      throw new Error(
        "Symbol.iteartor should be implemented for lazy iterating"
      );
    }
    if (typeof fromIterator !== "function") {
      throw new Error(
        "fromIteartor should be implemented as function for lazy iterating"
      );
    }
    this[Symbol.iterator] = initialIterator;
    this.fromIterator = fromIterator;
  }

  [GENERATE_WITH]<T>(newIterator: IteratorCreator<T>) {
    return new LazyIterator(newIterator, this.fromIterator);
  }

  all(predicat: (i: I) => boolean) {
    for (const item of this) {
      if (!predicat(item)) {
        return false;
      }
    }
    return true;
  }

  any(predicat: (i: I) => boolean) {
    for (const item of this) {
      if (predicat(item)) {
        return true;
      }
    }
    return false;
  }

  chain(...otherIterators: Iterable<I>[]) {
    const iterators = [this, ...otherIterators];
    const newIterator = function*() {
      for (const iterator of iterators) {
        yield* iterator;
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  count() {
    return this.fold(c => c + 1, 0);
  }

  cycle() {
    const oldIterator = this;
    const newIterator = function*() {
      const iterator = oldIterator[Symbol.iterator]().next();
      if (iterator.done) {
        return;
      }
      while (true) {
        yield* oldIterator;
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  enumarate() {
    let index = 0;
    return this.map(item => [index++, item]);
  }

  fold<A>(fn: (a: A, i: I) => A, accumulator?: A) {
    const iterator = this[Symbol.iterator]();
    const first = iterator.next();
    if (first.done) {
      return accumulator;
    }
    accumulator =
      arguments.length === 1 ? first.value : fn(accumulator, first.value);
    // @ts-ignore
    for (const item of iterator) {
      accumulator = fn(accumulator, item);
    }
    return accumulator;
  }

  first(): Maybe<I>;
  first(withoutMaybe: false): Maybe<I>;
  first(withoutMaybe: true): I | undefined;
  first(withoutMaybe = false) {
    const first = this[Symbol.iterator]().next();
    if (withoutMaybe) {
      return first.value;
    }
    return first.done ? Maybe.none<I>() : Maybe.just<I>(first.value);
  }

  filter(predicat: (i: I) => boolean) {
    const oldIterator = this;
    const newIterator = function*() {
      for (const item of oldIterator) {
        if (predicat(item)) {
          yield item;
        }
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  filterMap<T>(predicatMapper: (i: I) => Maybe<T>): LazyIterator<T>;
  filterMap<T>(
    predicatMapper: (i: I) => Maybe<T>,
    withoutMaybe: false
  ): LazyIterator<T>;
  filterMap<T>(
    predicatMapper: (i: I) => T | undefined,
    withoutMaybe: true
  ): LazyIterator<T>;
  filterMap<T>(
    predicatMapper: (i: I) => Maybe<T> | T | undefined,
    withoutMaybe = false
  ) {
    const oldIterator = this;
    const newIterator = function*() {
      for (const item of oldIterator) {
        const maybeItem = predicatMapper(item);
        if (
          (maybeItem instanceof Maybe && maybeItem.isNone()) ||
          maybeItem === undefined
        ) {
          continue;
        }
        yield maybeItem instanceof Maybe ? maybeItem.value : maybeItem;
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  find(predicate: (i: I) => boolean): Maybe<I>;
  find(predicate: (i: I) => boolean, withoutMaybe: false): Maybe<I>;
  find(predicate: (i: I) => boolean, withoutMaybe: true): I | undefined;
  find(predicate: (i: I) => boolean, withoutMaybe = false) {
    for (const item of this) {
      if (predicate(item)) {
        return withoutMaybe ? item : Maybe.just<I>(item);
      }
    }
    return withoutMaybe ? undefined : Maybe.none<I>();
  }

  findMap<T>(mapper: (i: I) => Maybe<T> | T | undefined): Maybe<I>;
  findMap<T>(
    mapper: (i: I) => Maybe<T> | T | undefined,
    withoutMaybe: false
  ): Maybe<T>;
  findMap<T>(
    mapper: (i: I) => Maybe<T> | T | undefined,
    withoutMaybe: true
  ): I | undefined;
  findMap<T>(mapper: (i: I) => Maybe<T> | T | undefined, withoutMaybe = false) {
    for (const item of this) {
      const maybeItem = mapper(item);
      if (
        (maybeItem instanceof Maybe && maybeItem.isNone()) ||
        maybeItem === undefined
      ) {
        continue;
      }
      return maybeItem;
    }
    return withoutMaybe ? undefined : Maybe.none<I>();
  }

  flatMap<N>(fn: (i: I) => LazyIterator<N>): LazyIterator<N> {
    const oldIterator = this;
    const newIterator = function*() {
      for (const item of oldIterator) {
        yield* fn(item);
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  flatten<T extends LazyIterator<I>, I>(
    this: LazyIterator<T | I>
  ): LazyIterator<I> {
    const oldIterator = this;
    const newIterator = function*() {
      for (const item of oldIterator) {
        if (item instanceof LazyIterator) {
          yield* item;
        } else {
          yield item;
        }
      }
    };
    return this[GENERATE_WITH](newIterator as IteratorCreator<I>);
  }

  forEach<T>(fn: (i: I) => T) {
    for (const item of this) {
      fn(item);
    }
  }

  last(): Maybe<I>;
  last(withoutMaybe: false): Maybe<I>;
  last(withoutMaybe: true): I | undefined;
  last(withoutMaybe = false) {
    const result = this.fold((_, a) => Maybe.just<I>(a), Maybe.none<I>());
    return withoutMaybe ? result.value : result;
  }

  map<T>(fn: (i: I) => T) {
    const oldIterator = this;
    const newIterator = function*() {
      for (const item of oldIterator) {
        yield fn(item);
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  max(f?: (i: I) => number): Maybe<I>;
  max(f: (i: I) => number, withoutMaybe: false): Maybe<I>;
  max(f: (i: I) => number, withoutMaybe: true): I | undefined;
  max(getValue = id, withoutMaybe = false) {
    const res = this.fold(
      (max, a) =>
        Maybe.just<I>(
          max.isNone() || getValue(a) > getValue(max.value) ? a : max.value
        ),
      Maybe.none<I>()
    );
    return withoutMaybe ? res.value : res;
  }

  min(f?: (i: I) => number): Maybe<I>;
  min(f: (i: I) => number, withoutMaybe: false): Maybe<I>;
  min(f: (i: I) => number, withoutMaybe: true): I | undefined;
  min(getValue = id, withoutMaybe = false) {
    const res = this.fold(
      (max, a) =>
        Maybe.just<I>(
          max.isNone() || getValue(a) < getValue(max.value) ? a : max.value
        ),
      Maybe.none<I>()
    );
    return withoutMaybe ? res.value : res;
  }

  nth(n: number): Maybe<I>;
  nth(n: number, withoutMaybe: false): Maybe<I>;
  nth(n: number, withoutMaybe: true): I | undefined;
  nth(n: number, withoutMaybe = false) {
    for (const item of this) {
      if (n-- <= 0) {
        return withoutMaybe ? item : Maybe.just(item);
      }
    }
    return withoutMaybe ? undefined : Maybe.none();
  }

  partion(fn: (i: I) => boolean): [I[], I[]] {
    const left = [];
    const right = [];
    for (const item of this) {
      if (fn(item)) {
        left.push(item);
      } else {
        right.push(item);
      }
    }
    return [left, right];
  }

  position(predicate: (i: I) => boolean): Maybe<number>;
  position(predicate: (i: I) => boolean, withoutMaybe: false): Maybe<number>;
  position(
    predicate: (i: I) => boolean,
    withoutMaybe: true
  ): number | undefined;
  position(predicate: (i: I) => boolean, withoutMaybe = false) {
    let index = 0;
    for (const item of this) {
      if (predicate(item)) {
        return withoutMaybe ? index : Maybe.just(index);
      }
      index++;
    }
    return withoutMaybe ? undefined : Maybe.none();
  }

  product(this: LazyIterator<number>) {
    return this.fold((res, a) => res * a, 1);
  }

  reverse(): LazyIterator<I> {
    const oldIterator = this instanceof Array ? this : [...this];
    const newIterator = function*() {
      for (let i = oldIterator.length - 1; i >= 0; i -= 1) {
        yield oldIterator[i];
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  scan<A>(fn: (a: A, i: I) => A, accumulator: A) {
    const oldIterator = this;
    const newIterator = function*() {
      for (const item of oldIterator) {
        accumulator = fn(accumulator, item);
        yield accumulator;
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  skip(n: number) {
    const oldIterator = this;
    const newIterator = function*() {
      for (const item of oldIterator) {
        if (n-- <= 0) {
          yield item;
        }
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  skipWhile(predicat: (i: I) => boolean) {
    const oldIterator = this;
    let shouldYield = false;
    const newIterator = function*() {
      for (const item of oldIterator) {
        if (!predicat(item) || shouldYield) {
          shouldYield = true;
          yield item;
        }
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  stepBy(step: number) {
    if (step <= 0) {
      throw new Error("step should be greater than 0");
    }
    let n = 0;
    const oldIterator = this;
    const newIterator = function*() {
      for (const item of oldIterator) {
        if (--n > 0) {
          continue;
        }
        n = step;
        yield item;
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  sum(this: LazyIterator<number>) {
    return this.fold((sum, a) => sum + a, 0);
  }

  take(n: number) {
    const oldIterator = this;
    const newIterator = function*() {
      for (const item of oldIterator) {
        if (n-- <= 0) {
          return;
        }
        yield item;
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  takeWhile(predicat: (i: I) => boolean) {
    const oldIterator = this;
    const newIterator = function*() {
      for (const item of oldIterator) {
        if (!predicat(item)) {
          return;
        }
        yield item;
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  unzip<A, B>(this: LazyIterator<[A, B]>): [A[], B[]] {
    const left: A[] = [];
    const right: B[] = [];
    for (const [a, b] of this) {
      left.push(a);
      right.push(b);
    }
    return [left, right];
  }

  zip<T>(other: LazyIterator<T>): LazyIterator<[I, T]> {
    const self = this;
    const newIterator = function*() {
      const selfIterator = self[Symbol.iterator]();
      const otherIterator = other[Symbol.iterator]();
      let first = selfIterator.next();
      let second = otherIterator.next();
      while (!first.done && !second.done) {
        yield [first.value, second.value] as [I, T];
        first = selfIterator.next();
        second = otherIterator.next();
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  compress(arrayOfBits: number[] | boolean[]) {
    const oldIterator = this;
    const newIterator = function*() {
      let index = 0;
      for (const item of oldIterator) {
        if (arrayOfBits[index++]) {
          yield item;
        }
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  permutations() {
    const oldIterator = this;
    const newIterator = function*() {
      let i1 = 0;
      for (const item1 of oldIterator) {
        let i2 = 0;
        for (const item2 of oldIterator) {
          if (i1 !== i2) {
            yield [item1, item2];
          }
          i2 += 1;
        }
        i1 += 1;
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  slice(start = 0, end?: number) {
    const oldIterator = this;
    const newIterator = function*() {
      let index = 0;
      for (const item of oldIterator) {
        if (end !== undefined && index >= end) {
          return;
        }
        if (index >= start) {
          yield item;
        }
        index += 1;
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  compact<T extends I | undefined, I>(this: LazyIterator<T>): LazyIterator<I> {
    return this.filter(a => a !== undefined);
  }

  contains(elem: I) {
    return this.any(a => a === elem);
  }

  unique() {
    const oldIterator = this;
    const newIterator = function*() {
      const yieldedMap = new Map();
      for (const item of oldIterator) {
        const yielded = yieldedMap.get(item);
        if (yielded === undefined) {
          yieldedMap.set(item, true);
          yield item;
        }
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  isEmpty() {
    return this.first().isNone();
  }

  except(other: LazyIterator<I>) {
    const oldIterator = this;
    const newIterator = function*() {
      for (const item of oldIterator) {
        if (!other.contains(item)) {
          yield item;
        }
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  intersect(other: LazyIterator<I>) {
    const oldIterator = this;
    const newIterator = function*() {
      for (const item of oldIterator) {
        if (other.contains(item)) {
          yield item;
        }
      }
    };
    return this[GENERATE_WITH](newIterator);
  }

  prepend(item: I) {
    const oldIterator = this;
    const newIterator = function*() {
      yield item;
      yield* oldIterator;
    };
    return this[GENERATE_WITH](newIterator);
  }

  append(item: I) {
    const oldIterator = this;
    const newIterator = function*() {
      yield* oldIterator;
      yield item;
    };
    return this[GENERATE_WITH](newIterator);
  }

  collect() {
    return this.fromIterator();
  }
}
