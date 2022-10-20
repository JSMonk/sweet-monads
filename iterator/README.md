# @sweet-monads/iterator

[Iterator additional methods](https://github.com/tc39/proposal-iterator-helpers), Iterator lazy helper methods implementation

### This library belongs to _sweet-monads_ project

> **sweet-monads** — easy-to-use monads implementation with static types definition and separated packages.

- No dependencies, one small file
- Easily auditable TypeScript/JS code
- Check out all libraries:
  [either](https://github.com/JSMonk/sweet-monads/tree/master/either),
  [iterator](https://github.com/JSMonk/sweet-monads/tree/master/iterator),
  [interfaces](https://github.com/JSMonk/sweet-monads/tree/master/interfaces),
  [maybe](https://github.com/JSMonk/sweet-monads/tree/master/maybe)
  [identity](https://github.com/JSMonk/sweet-monads/tree/master/identity)

## Why?

All of these methods (except methods which return non-`LazyIterator` values) are lazy. They will only consume the iterator when they need the next item from it.

```typescript
import LazyIterator from "@sweet-monads/iterator";

// array from 1 to 10000
const longArray = Array.from({ length: 10000 }).map((_, i) => i + 1);
const lazyArray = LazyIterator.from<number>(longArray);

// ~ 25_000 iterations
const sum1 = longArray
  .filter(i => i % 2)
  .map(i => i * i)
  .filter(i => i % 3)
  .reduce((sum, i) => sum + i, 0);

// 10_000 iterations
const sum2 = lazyArray
  .filter(i => i % 2)
  .map(i => i * i)
  .filter(i => i % 3)
  .sum();
```

## Usage

> npm install @sweet-monads/iterator

```typescript
import LazyIterator from "@sweet-monads/iterator";

const lazyArray = LazyIterator.from<number>([1, 2, 3, 4, 5]);

const newArray = lazyArray.map(a => a * a).collect();
```

## API

- [`LazyIterator.from(iterable)`](#lazyiteratorfrom)
- [`LazyIterator#all`](#lazyiteratorall)
- [`LazyIterator#any`](#lazyiteratorany)
- [`LazyIterator#chain`](#lazyiteratorchain)
- [`LazyIterator#count`](#lazyiteratorcount)
- [`LazyIterator#cycle`](#lazyiteratorcycle)
- [`LazyIterator#enumarate`](#lazyiteratorenumarate)
- [`LazyIterator#fold`](#lazyiteratorfold)
- [`LazyIterator#first`](#lazyiteratorfirst)
- [`LazyIterator#filter`](#lazyiteratorfilter)
- [`LazyIterator#filterMap`](#lazyiteratorfiltermap)
- [`LazyIterator#find`](#lazyiteratorfind)
- [`LazyIterator#findMap`](#lazyiteratorfindmap)
- [`LazyIterator#flatMap`](#lazyiteratorflatmap)
- [`LazyIterator#flatten`](#lazyiteratorflatten)
- [`LazyIterator#forEach`](#lazyiteratorforeach)
- [`LazyIterator#last`](#lazyiteratorlast)
- [`LazyIterator#map`](#lazyiteratormap)
- [`LazyIterator#max`](#lazyiteratormax)
- [`LazyIterator#min`](#lazyiteratormin)
- [`LazyIterator#nth`](#lazyiteratornth)
- [`LazyIterator#partion`](#lazyiteratorpartion)
- [`LazyIterator#position`](#lazyiteratorposition)
- [`LazyIterator#product`](#lazyiteratorproduct)
- [`LazyIterator#reverse`](#lazyiteratorreverse)
- [`LazyIterator#scan`](#lazyiteratorscan)
- [`LazyIterator#skip`](#lazyiteratorskip)
- [`LazyIterator#skipWhile`](#lazyiteratorskipwhile)
- [`LazyIterator#stepBy`](#lazyiteratorstepby)
- [`LazyIterator#sum`](#lazyiteratorsum)
- [`LazyIterator#take`](#lazyiteratortake)
- [`LazyIterator#takeWhile`](#lazyiteratortakewhile)
- [`LazyIterator#unzip`](#lazyiteratorunzip)
- [`LazyIterator#zip`](#lazyiteratorzip)
- [`LazyIterator#compress`](#lazyiteratorcompress)
- [`LazyIterator#permutations`](#lazyiteratorpermutations)
- [`LazyIterator#slice`](#lazyiteratorslice)
- [`LazyIterator#compact`](#lazyiteratorcompact)
- [`LazyIterator#contains`](#lazyiteratorcontains)
- [`LazyIterator#unique`](#lazyiteratorunique)
- [`LazyIterator#isEmpty`](#lazyiteratorisempty)
- [`LazyIterator#except`](#lazyiteratorexcept)
- [`LazyIterator#intersect`](#lazyiteratorintersect)
- [`LazyIterator#prepend`](#lazyiteratorprepend)
- [`LazyIterator#append`](#lazyiteratorappend)
- [`LazyIterator#collect`](#lazyiteratorcollect)

#### `LazyIterator.from`

Create `LazyIterator<I>` from any `Iterable<I>` object

```typescript
function from<I>(iterable: Iterable<I>): LazyIterator<I>;
function from<I>(iterable: Iterable<I> & { fromIterator: FromIterator<I> }): LazyIterator<I>;
function from<I>(iterable: Iterable<I>, fromIterator: FromIterator<I>): LazyIterator<I>;
```

- `iterable: Iterable<I>` - Iterable object which will be wrapped by `LazyIterator`
- `fromIterator: () => Iterable<I>` (default is `function() { return [...this] }`) - function which define conversion from `LazyIterator` to iterable object (default is `Array`), it could be defined inside `iterable` object.
- Returns `LazyIterator` which contains all elements from `iterable`

Example:

```typescript
LazyIterator.from<number>([1, 2, 3]); // LazyIterator<number>
LazyIterator.from([1, 2, 3]); // LazyIterator<number>
```

#### `LazyIterator.all`

Tests if every element of the `LazyIterator` matches a predicate.

_Warning_: Be careful, iterator should be iterated for the computation. So it doesn't work with infinity iterable objects.

```typescript
function all<I>(predicate: (i: I) => boolean): boolean;
```

- `predicate: (i: I) => boolean` - takes a function that returns `true` or `false`. It applies this function to each element of the iterator, and if they all return `true`, then so does `all()`. If any of them return `false`, it returns `false`.

- Returns `true` if `predicate` return `true` for all elements of `LazyIterator` or `LazyIterator` is empty otherwise `false`

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5]);
iterator.all(a => typeof a === "number"); // true
iterator.all(a => a % 2 === 0); // false
```

#### `LazyIterator.any`

Tests if any element of the `LazyIterator` a predicate.

_Warning_: Be careful, iterator should be iterated for the computation. So it doesn't work with infinity iterable objects.

```typescript
function any<I>(predicate: (i: I) => boolean): boolean;
```

- `predicate: (i: I) => boolean` - takes a function that returns `true` or `false`. It applies this function to each element of the iterator, and if any of them return `true`, then so does `any()`. If they all return `false`, it returns `false`.
- Returns `true` if exist element from `LazyIterator` for which `predicate` return `true` otherwise `false`
  Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5]);
iterator.any(a => a % 2 === 0); // true
iterator.any(a => a === 0); // false
```

#### `LazyIterator.chain`

Takes two iterators and creates a new iterator over both in sequence.

```typescript
function chain<I>(...otherIterators: Array<Iterable<I>>): LazyIterator<I>;
```

- `iterables: Array<Iterable<I>>` - array of iterable objects with same type which should be merged in one
- Returns a new `LazyIterator` which will first iterate over values from the first `LazyIterator` and then over values from the second iterator.

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5]);
const newIterator = iterator.chain([6, 7]);

for (const i of newIterator) {
  console.log(i);
}
// 1
// 2
// 3
// 4
// 5
// 6
// 7
```

#### `LazyIterator.count`

Consumes the iterator, counting the number of iterations and returning it.

_Warning_: Be careful, iterator should be iterated for the computation. So it doesn't work with infinity iterable objects.

```typescript
function count(): number;
```

- Returns count of elements in `LazyIterator`

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5]);
const infinityIterator = new LazyIterator(function* () {
  while (true) yield 0;
});

iterator.count(); // 5
infinityIterator.count(); // Will lock your application
```

#### `LazyIterator.cycle`

Instead of stopping at `done: true`, the `LazyIterator` will instead start again, from the beginning. After iterating again, it will start at the beginning again. And again. And again. Forever.

```typescript
function cycle<I>(): LazyIterator<I>;
```

- Returns repeated an `LazyIterator` endlessly if it is not empty.

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3]).cycle();
const empty = LazyIterator.from([]).cycle();

let i = iterator[Symbol.iterator]();

i.next().value; // 1
i.next().value; // 2
i.next().value; // 3
i.next().value; // 1
i.next().value; // 2
i.next().value; // 3
i.next().value; // 1

let i = empty[Symbol.iterator]();

i.next().done; // true

for (const a of iterator); // Will lock your application
for (const a of empty); // Will not computed
```

#### `LazyIterator.enumarate`

Creates an `LazyIterator` which gives the current iteration count as well as the next value.

```typescript
function enumarate<I>(): LazyIterator<[number, I]>;
```

- Returns the `LazyIterator` which yields pairs `(i, val)`, where `i` is the current index of iteration and `val` is the value returned by the iterator.

Example:

```typescript
const iterator = LazyIterator.from([6, 7, 8, 9]).enumerate();

for (const [index, element] of iterator) {
  console.log(index, element);
}
// 0, 6
// 1, 7
// 2, 8
// 3, 9
```

#### `LazyIterator.fold`

An `LazyIterator` method that applies a function as long as it returns successfully, producing a single, final value. Folding is useful whenever you have a collection of something, and want to produce a single value from it.

_Warning_: Be careful, iterator should be iterated for the computation. So it doesn't work with infinity iterable objects.

```typescript
function fold<I>(fn: (a: I, i: I) => I): I;
function fold<I, A>(fn: (a: A, i: I) => A, accumulator: A): A;
```

- `fn: (a: A, i: I) => A` - accumulator function which fold elements in some value
- `accumulator: A` (default `LazyItertor#first()`) - the initial value the `fn` will have on the first call.
- Returns value which are computed by invocation of `fn` with each element of the `LazyIterator` and `accumulator` which was computed at previous step of iteration.

Example:

```typescript
const iterator = LazyIterator.from([1, 1, 2, 3, 5, 8]);

const sum = iterator.fold((sum, i) => sum + i, 0); // number 20
```

#### `LazyIterator.first`

An `LazyIterator` method that return first element of the `LazyIterator`.

_Info:_ more information about [Maybe](https://github.com/JSMonk/sweet-monads/tree/master/maybe)

```typescript
function first(): Maybe<I>;
function first(withoutMaybe: false): Maybe<I>;
function first(withoutMaybe: true): I | undefined;
```

- `withoutMaybe` (default `false`) - regulate return type, if `true` result will be "undefinable" item type else `Maybe<I>` which could be presented as `Just` value or `None`.
- Returns `Maybe<I>.Just` (or `I` if `withoutMaybe` is `true`) if `LazyIterator` is not empty otherwise `Maybe<I>.None` (of `undefined` if `withoutMaybe` is `true`)

Example:

```typescript
const iterator = LazyIterator.from([1, 1, 2, 3, 5, 8]);
const empty = LazyIterator.from([]);

const f1 = iterator.first(); // Maybe<number>.Just with value 1
const f2 = iterator.first(false); // Maybe<number>.Just with value 1
const f3 = iterator.first(true); // 1
const f4 = empty.first(); // Maybe<number>.None without value
const f5 = empty.first(false); // Maybe<number>.None without value
const f6 = empty.first(true); // undefined
```

#### `LazyIterator.filter`

Creates an `LazyIterator` which uses a function to determine if an element should be yielded.

```typescript
function filter<I, T extends I>(predicate: (i: I) => i is T): LazyIterator<T>;
function filter<I>(predicate: (i: I) => boolean): LazyIterator<I>;
```

- `predicate: (i: I) => boolean` - function which must return `true` or `false`.
- Returns `LazyIterator<T>` which calls `fn` function on each element. If `fn` returns `true`, then the element is returned. If `fn` returns `false`, it will try again, and call `fn` on the next element, seeing if it passes the test.

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 2, 3, 4, 5, 6, 7, 8, 9]);
const filtered = iterator.filter(i => i % 2); // LazyIterator<number>
const twos = iterator.filter((i): i is 2 => i === 2); // LazyIterator<2>

for (const i of filtered) console.log(i);
// 1
// 3
// 5
// 7
// 9

for (const i of twos) console.log(i);
// 2
// 2
```

#### `LazyIterator.filterMap`

Creates an iterator that both filters and maps.

_Info:_ more information about [Maybe](https://github.com/JSMonk/sweet-monads/tree/master/maybe)

```typescript
function filterMap<I, T>(predicateMapper: (i: I) => Maybe<T>): LazyIterator<T>;
function filterMap<I, T>(predicateMapper: (i: I) => T | undefined): LazyIterator<T>;
```

- `predicateMapper: (i: I) => Maybe<T> | T | undefined` - function which must return an `Maybe<T>`or `T | undefined` if `withoutMaybe` is `true`.
- Returns `LazyIterator` which calls `predicateMapper` on each element. If `predicateMapper` returns `just(element)`, then that element is returned. If `predicateMapper` returns `none`, it will try again, and call `predicateMapper` on the next element, seeing if it will return `just`.

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 2, 3, 4, 5, 6, 7, 8, 9]);
const filtered = iterator.filterMap(i => (i % 2 ? just(i * i) : none())); // LazyIterator<number>

// filtered1 <-> [1, 9, 25, 49, 81]
```

#### `LazyIterator.find`

Searches for an element of an `LazyIterator` that satisfies a predicate.
`find()` is short-circuiting; in other words, it will stop processing as soon as the predicate returns `true`. But, it will lock your application if your `LazyIterator` is cycled and doesn't contain element which will satisfied a predicate.

_Info:_ more information about [Maybe](https://github.com/JSMonk/sweet-monads/tree/master/maybe)

```typescript
function find<I>(predicate: (i: I) => boolean): Maybe<I>;
function find<I>(predicate: (i: I) => boolean, withoutMaybe: false): Maybe<I>;
function find<I>(predicate: (i: I) => boolean, withoutMaybe: true): I | undefined;
```

- `predicate: (i: I) => boolean` - function that return `true` or `false`.
- `withoutMaybe` (default `false`) - regulate return type if `true` result should be "undefinable" item type else `Maybe<I>` which could be presented as `Just` value or `None`.
- Returns `Maybe<I>.Just` (or `I` if `withoutMaybe` is `true`) if `LazyIterator` is not empty and contain element for which `predicate` return `true` otherwise `Maybe<I>.None` (of `undefined` if `withoutMaybe` is `true`)

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 2, 3, 4, 5, 6, 7, 8, 9]);

const two1 = iterator.find(i => i === 2); // Maybe<number>.Just with value 2
const two2 = iterator.find(i => i === 2, false); // Maybe<number>.Just with value 2
const two3 = iterator.find(i => i === 2, true); // 2
const two4 = iterator.find(i => i === 10); // Maybe<number>.None without value
const two5 = iterator.find(i => i === 10, false); // Maybe<number>.None without value
const two6 = iterator.find(i => i === 10, true); // undefined
```

#### `LazyIterator.findMap`

Applies function to the elements of `LazyIterator` and returns the first non-none result.
`findMap()` is short-circuiting; in other words, it will stop processing as soon as the predicate returns `Maybe.Just` or non-`undefined` value. But, it will lock your application if your `LazyIterator` is cycled and doesn't contain element which will satisfied a predicate.

_Info:_ more information about [Maybe](https://github.com/JSMonk/sweet-monads/tree/master/maybe)

```typescript
function findMap<I, T>(predicateMapper: (i: I) => Maybe<T> | T | undefined): Maybe<I>;
function findMap<I, T>(predicateMapper: (i: I) => Maybe<T> | T | undefined, withoutMaybe: false): Maybe<T>;
function findMap<I, T>(predicateMapper: (i: I) => Maybe<T> | T | undefined, withoutMaybe: true): I | undefined;
```

- `predicateMapper: (i: I) => Maybe<T> | T | undefined` - predicate mapper function which return `Maybe<T>` or `T | undefined`.
- `withoutMaybe` (default `false`) - regulate return type of `predicateMapper`, if `true` result should be "undefinable" item type else `Maybe<I>` which could be presented as `Just` value or `None`.
- Returns mapped by `predicateMapper` `Maybe<I>.Just` (or `I` if `withoutMaybe` is `true`) if `LazyIterator` is not empty and contain element for which `predicateMapper` return `Maybe<I>.Just` (or not `undefined` if `withoutMaybe` is `true`) otherwise `Maybe<I>.None` (of `undefined` if `withoutMaybe` is `true`)

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 2, 3, 4, 5, 6, 7, 8, 9]);

const two1 = iterator.find(i => (i === 2 ? just(i) : none())); // Maybe<number>.Just
const two2 = iterator.find(i => (i === 2 ? just(i) : none()), false); // Maybe<number>.Just
const two3 = iterator.find(i => (i === 2 ? i : undefined), true); // 2
const two4 = iterator.find(i => (i === 10 ? just(i) : none())); // Maybe<number>.None
const two5 = iterator.find(i => (i === 10 ? just(i) : none()), false); // Maybe<number>.None
const two6 = iterator.find(i => (i === 10 ? i : undefined), true); // undefined
```

#### `LazyIterator.flatMap`

Creates an `LazyIterator` that works like map, but flattens nested structure.

```typescript
function flatMap<I, N>(fn: (i: I) => LazyIterator<N>): LazyIterator<N>;
```

- `fn: (i: I) => LazyIterator<N>` - mapper function which return `LazyIterator<N>`
- Returns flattened `LazyIterator<N>`

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5]);
const mapped = iterator.flatMap(n => LazyIterator.from<string>("|".repeat(n)));

for (const i of mapped) console.log(i);
// 15 times "|"
```

#### `LazyIterator.flatten`

Creates an `LazyIterator` that flattens nested structure.
This is useful when you have an `LazyIterator` of `LazyIterator` or an `LazyIterator` of things that can be turned into iterators and you want to remove one level of indirection.

```typescript
function flatten<I>(this: LazyIterator<I | LazyIterator<I>>): LazyIterator<I>;
```

- `this: LazyIterator<I | LazyIterator<I>>` - `this` context should be presented as `LazyIterator` of `LazyIterator` of `I` items.
- Returns flattened at 1 level `LazyIterator<I>`

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5]);

const mapped = iterator.map(n => LazyIterator.from<string>("|".repeat(n))); // LazyIterator<LazyIterator<string>>;
const flatten = mapped.flatten(); // LazyIterator<string>
```

#### `LazyIterator.forEach`

Calls a function on each element of an `LazyIterator`.
This is equivalent to using a `for..of` loop on the `LazyIterator`, although `break` and `continue` are not possible from a function. It's generally more idiomatic to use a `for..of` loop, but `forEach` may be more legible when processing items at the end of longer `LazyIterator` chains.

```typescript
function forEach<I>(fn: (i: I) => unknown): void;
```

- `fn: (i: I) => unknown` - function which will be invoked with each element of `LazyIterator<I>`
- Returns `undefined`

  Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5]);

iterator.forEach(console.log);
// 1
// 2
// 3
// 4
// 5
```

#### `LazyIterator.last`

An `LazyIterator` method that return last element of the `LazyIterator`.

_Warning_: Be careful, iterator should be iterated for the computation. So it doesn't work with infinity iterable objects.

_Info:_ more information about [Maybe](https://github.com/JSMonk/sweet-monads/tree/master/maybe)

```typescript
function last<I>(): Maybe<I>;
function last<I>(withoutMaybe: false): Maybe<I>;
function last<I>(withoutMaybe: true): I | undefined;
```

- `withoutMaybe` (default `false`) - regulate return type, if `true` result will be "undefinable" item type else `Maybe<I>` which could be presented as `Just` value or `None`.
- Returns `Maybe<I>.Just` (or `I` if `withoutMaybe` is `true`) if `LazyIterator` is not empty otherwise `Maybe<I>.None` (of `undefined` if `withoutMaybe` is `true`)

Example:

```typescript
const iterator = LazyIterator.from([1, 1, 2, 3, 5, 8]);
const empty = LazyIterator.from([]);
const cycled = LazyIterator.from([1, 2]).cycle();

const f1 = iterator.last(); // Maybe<number>.Just with value 8
const f2 = iterator.last(false); // Maybe<number>.Just with value 8
const f3 = iterator.last(true); // 8
const f4 = empty.last(); // Maybe<number>.None without value
const f5 = empty.last(false); // Maybe<number>.None without value
const f6 = empty.last(true); // undefined
const f7 = cycled.last(true); // Lock your application
```

#### `LazyIterator.map`

Takes a function and creates an `LazyIterator` which calls that function on each element. `map()` transforms one `LazyIterator` into another.
If you are good at thinking in types, you can think of `map()` like this: If you have an `LazyIterator` that gives you elements of some type `I`, and you want an `LazyIterator` of some other type `T`, you can use `map()`, passing a function that takes an `I` and returns a `T`.

```typescript
function map<I, T>(fn: (i: I) => T): LazyIterator<T>;
```

- `fn: (i: I) => T` - function which will called with each element of `LazyIterator`
- Returns `LazyIterator` which contains all values which was transformed by `fn`

Example:

```typescript
const iterator = LazyIterator.from([1, 1, 2, 3, 5, 8]);

const mapped = iterator.map(a => a.toString()); // LazyIterator<string>

for (const i of mapped) console.log(i);
// "1"
// "1"
// "2"
// "3"
// "5"
// "8"
```

#### `LazyIterator.max`

Returns the maximum element of an `LazyIterator`.
If several elements are equally maximum, the last element is returned.

```typescript
function max<I>(f?: (i: I) => number): Maybe<I>;
function max<I>(f: (i: I) => number, withoutMaybe: false): Maybe<I>;
function max<I>(f: (i: I) => number, withoutMaybe: true): I | undefined;
```

- `fn: (i: I) => T` - function which will convert item `i` in `number`.
- `withoutMaybe` (default `false`) - regulate return type, if `true` result will be "undefinable" item type else `Maybe<I>` which could be presented as `Just` value or `None`.
- Returns maximum element of in `LazyIterator`. If the `LazyIterator` is empty, `Maybe<number>.None` will be returned (or `undefined` if `withoutMaybe` is `true`).

Example:

```typescript
const iterator = LazyIterator.from([1, 1, 2, 3, 5, 8]);
const empty = LazyIterator.from([]);

iterator.max(); // Maybe<number>.Just with value 8
iterator.max(a => a); // Maybe<number>.Just with value 8
iterator.max(a => a, false); // Maybe<number>.Just with value 8
iterator.max(a => a, true); // 8
empty.max(); // Maybe<number>.None without value
empty.max(a => a); // Maybe<number>.None without value
empty.max(a => a, false); // Maybe<number>.None without value
empty.max(a => a, true); // undefined
```

#### `LazyIterator.min`

Returns the minimum element of an `LazyIterator`.
If several elements are equally minimum, the first element is returned.

```typescript
function min<I>(f?: (i: I) => number): Maybe<I>;
function min<I>(f: (i: I) => number, withoutMaybe: false): Maybe<I>;
function min<I>(f: (i: I) => number, withoutMaybe: true): I | undefined;
```

- `fn: (i: I) => T` - function which will convert item `i` in `number`.
- `withoutMaybe` (default `false`) - regulate return type, if `true` result will be "undefinable" item type else `Maybe<I>` which could be presented as `Just` value or `None`.
- Returns minimum element of in `LazyIterator`. If the `LazyIterator` is empty, `Maybe<number>.None` will be returned (or `undefined` if `withoutMaybe` is `true`).

Example:

```typescript
const iterator = LazyIterator.from([1, 1, 2, 3, 5, 8]);
const empty = LazyIterator.from([]);

iterator.min(); // Maybe<number>.Just with value 1
iterator.min(a => a); // Maybe<number>.Just with value 1
iterator.min(a => a, false); // Maybe<number>.Just with value 1
iterator.min(a => a, true); // 1
empty.min(); // Maybe<number>.None without value
empty.min(a => a); // Maybe<number>.None without value
empty.min(a => a, false); // Maybe<number>.None without value
empty.min(a => a, true); // undefined
```

#### `LazyIterator.nth`

Returns the `n`th element of the `LazyIterator`.
Like most indexing operations, the count starts from zero, so `nth(0)` returns the first value, `nth(1)` the second, and so on.

```typescript
function nth<I>(n: number): Maybe<I>;
function nth<I>(n: number, withoutMaybe: false): Maybe<I>;
function nth<I>(n: number, withoutMaybe: true): I | undefined;
```

- `n: number` - position of element in `LazyIterator`
- `withoutMaybe` (default `false`) - regulate return type, if `true` result will be "undefinable" item type else `Maybe<I>` which could be presented as `Just` value or `None`.
- Returns the `n`th element of the `LazyIterator`. If `n` is greater than or equals to `LazyIterator#count` or `LazyIterator` is empty, `Maybe<number>.None` will be returned (or `undefined` if `withoutMaybe` is `true`).

Example:

```typescript
const iterator = LazyIterator.from([1, 1, 2, 3, 5, 8]);
const empty = LazyIterator.from([]);

iterator.nth(0); // Maybe<number>.Just with value 1
iterator.nth(0, false); // Maybe<number>.Just with value 1
iterator.nth(0, true); // 1
iterator.nth(6); // Maybe<number>.None without value
iterator.nth(6, false); // Maybe<number>.None without value
iterator.nth(6, true); // undefined
empty.nth(0); // Maybe<number>.None without value
empty.nth(0, false); // Maybe<number>.None without value
empty.nth(0, true); // undefined
```

#### `LazyIterator.partion`

Returns a 2-elements tuple of arrays. Splits the elements in the input iterable into either of the two arrays. Will fully exhaust the input iterable. The first array contains all items that match the predicate, the second the rest

```typescript
function partion<I, T extends I>(predicate: (i: I) => i is T): [T[], I[]];
function partion<I>(predicate: (i: I) => boolean): [I[], I[]];
```

- `predicate: (i: I) => boolean` - function which must return `true` or `false`.
- Returns a 2-elements tuple of arrays which contains elements which satisfy `predicate` (first array) and which not (second array)

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 2, 3, 4, 5, 6, 7, 8, 9]);
const [filtered, rest] = iterator.partion(i => i % 2); // [number[], number[]]
const [twos, notTwos] = iterator.partion((i): i is 2 => i === 2); // [2[], number[]]

for (const i of filtered) console.log(i);
// 1
// 3
// 5
// 7
// 9

for (const i of rest) console.log(i);
// 2
// 2
// 4
// 6
// 8

for (const i of twos) console.log(i);
// 2
// 2

for (const i of notTwos) console.log(i);
// 1
// 3
// 4
// 5
// 6
// 7
// 8
// 9
```

#### `LazyIterator.position`

Searches for an element in an iterator, returning its index.
`position()` is short-circuiting; in other words, it will stop processing as soon as the predicate returns `true`. But, it will lock your application if your `LazyIterator` is cycled and doesn't contain element which will satisfied a predicate.

_Info:_ more information about [Maybe](https://github.com/JSMonk/sweet-monads/tree/master/maybe)

```typescript
function position<I>(predicate: (i: I) => boolean): Maybe<number>;
function position<I>(predicate: (i: I) => boolean, withoutMaybe: false): Maybe<number>;
function position<I>(predicate: (i: I) => boolean, withoutMaybe: true): number | undefined;
```

- `predicate: (i: I) => boolean` - function that return `true` or `false`.
- `withoutMaybe` (default `false`) - regulate return type if `true` result should be "undefinable" item type else `Maybe<I>` which could be presented as `Just` value or `None`.
- Returns `Maybe<I>.Just` (or `I` if `withoutMaybe` is `true`) if `LazyIterator` is not empty and contain element for which `predicate` return `true` otherwise `Maybe<I>.None` (of `undefined` if `withoutMaybe` is `true`)

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 2, 3, 4, 5, 6, 7, 8, 9]);

const two1 = iterator.position(i => i === 2); // Maybe<number>.Just with value 1
const two2 = iterator.position(i => i === 2, false); // Maybe<number>.Just with value 1
const two3 = iterator.position(i => i === 2, true); // 1
const two4 = iterator.position(i => i === 10); // Maybe<number>.None without value
const two5 = iterator.position(i => i === 10, false); // Maybe<number>.None without value
const two6 = iterator.position(i => i === 10, true); // undefined
```

#### `LazyIterator.product`

Iterates over the entire iterator, multiplying all the elements.

_Warning_: Be careful, iterator should be iterated for the computation. So it doesn't work with infinity iterable objects.

```typescript
function product(this: LazyIterator<number>): number;
```

- `this: LazyIterator<number>` - `LazyIterator` should contain `number` elements
- Returns product of each elements in `LazyIterator`. An empty `LazyIterator` returns the one value of the type.

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5]);
const empty = LazyIterator.from([]);
const cycled = LazyIterator.from([1]).cycle();

const product1 = iterator.product(); // 120
const product2 = empty.product(); // 1
const product3 = cycled.product(); // Will lock your application
```

#### `LazyIterator.reverse`

Reverses an iterator's direction. Usually, `LazyIterator`s iterate from left to right. After using `reverse()`, an `LazyIterator` will instead iterate from right to left.

_Warning_: Be careful, iterator should be iterated for the computation. So it doesn't work with infinity iterable objects.

```typescript
function reverse<I>(): LazyIterator<I>;
```

- Returns reverse `LazyIterator`

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5]);
const cycled = LazyIterator.from([1]).cycle();

const reversed1 = iterator.reverse();

for (const a of reversed1) console.log(a);
// 1
// 2
// 3
// 4
// 5

const reversed2 = cycled.reverse(); // Will lock your application
```

#### `LazyIterator.scan`

An `LazyIterator` adaptor similar to [`LazyIterator#fold`](#lazyiteratorfold) that holds internal state and produces a new iterator.

```typescript
function scan<A, I>(fn: (a: A, i: I) => A, accumulator: A): A;
```

- `fn: (a: A, i: I) => A` - a function with two arguments, the first being the internal state and the second an `LazyIterator` element. The function can assign to the internal state to share state between iterations.
- `accumulator: A` - an initial value which seeds the internal state
- Returns the `LazyIterator` which yields `accumulator` per each iteration which computed by `fn` invocation.

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5]);
const factorials = iterator.scan((a, i) => a * i, 1);

for (const a of factorials) console.log(a);
// 1
// 2
// 6
// 24
// 120
```

#### `LazyIterator.skip`

Creates an `LazyIterator` that skips the first `n` elements.
After they have been consumed, the rest of the elements are yielded.

```typescript
function skip<I>(n: number): LazyIterator<I>;
```

- `n: number` - count of element which should be skipped.
- Returns the `LazyIterator` which yields all elements after `n` elements.

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5]);
const skipped = iterator.skip(2);

for (const a of skipped) console.log(a);
// 3
// 4
// 5
```

#### `LazyIterator.skipWhile`

Creates an `LazyIterator` that [`LazyIterator#skip`](#lazyiteratorskip) s elements based on a predicate.

```typescript
function skipWhile<I>(predicate: (i: I) => boolean): LazyIterator<I>;
```

- `predicate: (i: I) => boolean` - function which will be called on each element of the `LazyIterator`, and ignore elements until it returns `false`.
- Returns the `LazyIterator` which yields the rest of the elements after first `false` from `predicate` invocation.

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5]);
const skipped = iterator.skipWhile(a => a <= 2);

for (const a of skipped) console.log(a);
// 3
// 4
// 5
```

#### `LazyIterator.stepBy`

Creates an `LazyIterator` starting at the same point, but stepping by the given amount at each iteration.

_Note_: The first element of the `LazyIterator` will always be returned, regardless of the step given.
_Note_: If step will be less than 1 then method will throw an Error.

```typescript
function stepBy<I>(step: number): LazyIterator<I>;
```

- `step: number` - number (greater than 0) of each element which should be yielded.
- Returns the `LazyIterator` starting at the same point, but stepping by the given amount at each iteration.

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5]);
const skipped = iterator.stepBy(2);

for (const a of skipped) console.log(a);
// 1
// 3
// 5
```

#### `LazyIterator.sum`

Sums the elements of an iterator.
Takes each element, adds them together, and returns the result.

_Warning_: Be careful, `LazyIterator` should be iterated for the computation. So it doesn't work with infinity iterable objects.

```typescript
function sum(this: LazyIterator<number>): number;
```

- `this: LazyIterator<number>` - `LazyIterator` should contain `number` elements
- Returns sum of each elements in `LazyIterator`. An empty `LazyIterator` returns the zero value of the type.

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5]);
const empty = LazyIterator.from([]);
const cycled = LazyIterator.from([1]).cycle();

const product1 = iterator.sum(); // 15
const product2 = empty.sum(); // 0
const product3 = cycled.sum(); // Will lock your application
```

#### `LazyIterator.take`

Creates an `LazyIterator` that yields its first `n` elements.

```typescript
function take<I>(n: number): LazyIterator<I>;
```

- `n: number` - count of element which should be taken.
- Returns the `LazyIterator` which yields first `n` elements.

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5]);
const skipped = iterator.take(2);

for (const a of skipped) console.log(a);
// 1
// 2
```

#### `LazyIterator.takeWhile`

Creates an `LazyIterator` that [`LazyIterator#take`](#lazyiteratortake) s elements based on a predicate.

```typescript
function takeWhile<I>(predicate: (i: I) => boolean): LazyIterator<I>;
```

- `predicate: (i: I) => boolean` - function which will be called on each element of the `LazyIterator`, and yield elements until it returns `false`.
- Returns the `LazyIterator` which yields elements before first `false` from `predicate` invocation.

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5]);
const skipped = iterator.takeWhile(a => a <= 2);

for (const a of skipped) console.log(a);
// 1
// 2
```

#### `LazyIterator.unzip`

Converts an `LazyIterator` of pairs into a pair of arrays.
`unzip()` consumes an entire `LazyIterator` of pairs, producing two arrays: one from the left elements of the pairs, and one from the right elements.
This function is, in some sense, the opposite of [`LazyIterator#zip`](#lazyiteratorzip).

```typescript
function unzip<A, B>(this: LazyIterator<[A, B]>): [A[], B[]];
```

- `this: LazyIterator<[A, B]>` - the `LazyIterator` which will be an context of the function should contain pair(array with two elements) as element.
- Returns two arrays: first contains elements from the left elements of the pairs, and second contains elements from the right elements.

Example:

```typescript
const iterator = LazyIterator.from([
  [1, 2],
  [3, 4],
  [5, 6],
  [7, 8]
]);
const [odd, even] = iterator.unzip();
odd; // [1, 3, 5, 7]
even; // [2, 4, 6, 8]
```

#### `LazyIterator.zip`

'Zips up' two iterators into a single `LazyIterator` of pairs.

```typescript
function zip<I, T>(other: LazyIterator<T>): LazyIterator<[I, T]>;
```

- `other: LazyIterator<T>` - the `LazyIterator` which elements will be the right element of each yielded pair(array with two elements).
- Returns `LazyIterator` that will iterate over two other `LazyIterator`s, returning a pair(array with two elements) where the first element comes from the first `LazyIterator` (which was context for the method), and the second element comes from the second `LazyIterator` (which came from argument).

Example:

```typescript
const iterator1 = LazyIterator.from([1, 3, 5, 7]);
const iterator2 = LazyIterator.from([2, 4, 6, 8]);
const iterator3 = LazyIterator.from([15]);

const zipped1 = iterator1.zip(iterator2);
const zipped2 = iterator1.zip(iterator3);

for (const a of zipped1) console.log(a);
// [1, 2]
// [3, 4]
// [5, 6]
// [7, 8]

for (const a of zipped2) console.log(a);
// [1, 15]
```

#### `LazyIterator.compress`

Pick items for `LazyIterator` by mask which will be provided as argument.

```typescript
function compress<I>(mask: number[] | boolean[]): LazyIterator<I>;
```

- `mask: boolean[] | number[]` - mask which determine which elements will be yielded by new `LazyIterator`.
- Returns `LazyIterator` that filters elements from data returning only those that have a corresponding element in selectors that evaluates to true. Stops when either the data or selectors iterables has been exhausted.

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5, 6, 7, 8, 9]);
const masked1 = iterator.compress([0, 0, 1, 1, 1, 0, 1]);
const masked2 = iterator.compress([false, false, true, true, true, false, true]);

for (const a of masked1) console.log(a);
// 3
// 4
// 5
// 7

for (const a of masked2) console.log(a);
// 3
// 4
// 5
// 7
```

#### `LazyIterator.permutations`

Return successive permutations of elements in the iterable.

```typescript
function permutations<I>(): LazyIterator<[I, I]>;
```

- Returns `LazyIterator` that yield pair (array with two elements) which contains combination of each elements.

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3]);
const permutated = iterator.permutations();

for (const a of permutated) console.log(a);
// [1, 2]
// [1, 3]
// [2, 1]
// [2, 3]
// [3, 1]
// [3, 2]
```

#### `LazyIterator.compact`

Create `LazyIterator` without undefined elements.

```typescript
function compact<I>(this: LazyIterator<I | undefined>): LazyIterator<I>;
```

- Returns `LazyIterator` that contains only non-undefined elements.

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, undefined, 4, undefined, 15, undefined]);
const compacted = iterator.compact();

for (const a of compacted) console.log(a);
// 1
// 2
// 3
// 4
// 15
```

#### `LazyIterator.contains`

Tests if any element of the `LazyIterator` matches provided element.

_Warning_: Be careful, iterator should be iterated for the computation. So it doesn't work with infinity iterable objects.

```typescript
function contains<I>(elem: I): boolean;
```

- Returns `LazyIterator` that contains only non-undefined elements.

_Warning_: Be careful, iterator should be iterated for the computation. So it doesn't work with infinity iterable objects.

```typescript
function contains<I>(elem: I): boolean;
```

- `elem: I` - element which are testing for existing in the `LazyIterator`.
- Returns `true` if `elem` is existed in `LazyIterator` then return `true` otherwise `false`

Example:

```typescript
const iterator = LazyIterator.from([1, 2, 3, 4, 5]);
iterator.contains(2); // true
iterator.contains(7); // false
```

#### `LazyIterator.unique`

Create `LazyIterator` which contains only unique elements.

_Warning_: Be careful, iterator should save previous elements for the computation. So it create memory leak with large `LazyIterator`.

```typescript
function unique<I>(): LazyIterator<I>;
```

- Returns `LazyIterator` that contains only unique elements.

```typescript
const iterator = LazyIterator.from([1, 1, 2, 3, 4, 4, 12, 6, 2, 3, 4, 5]);
const unique = iterator.unique();

for (const a of unique) console.log(a);
// 1
// 2
// 3
// 4
// 12
// 6
// 5
```

#### `LazyIterator.isEmpty`

Check `LazyIterator` for emptiness.

```typescript
function isEmpty(): boolean;
```

- Returns `true` if `LazyIterator` doesn't contain any item otherwise `false`.

```typescript
const iterator1 = LazyIterator.from([1, 2, 3, 4, 5]);
const iterator2 = LazyIterator.from([]);

iterator1.isEmpty(); // false
iterator2.isEmpty(); // true
```

#### `LazyIterator.except`

Create `LazyIterator` without element which was contained in provided `LazyIterator`.

_Warning_: Be careful, provided as argument iterator should be iterated for the computation. So it doesn't work with infinity iterable objects.

```typescript
function except<I>(other: LazyIterator<I>): LazyIterator<I>;
```

- `other: LazyIterator<I>` - `LazyIterator` with element which should be excluded from `this` `LazyIterator`
- Returns `LazyIterator` that doesn't contain elements from `other` `LazyIterator`.

```typescript
const iterator = LazyIterator.from([1, 1, 2, 3, 4, 4, 12, 6, 2, 3, 4, 5]);
const excepted = iterator.except(LazyIterator.from([2, 4, 1]));

for (const a of excepted) console.log(a);
// 3
// 12
// 6
// 3
// 5
```

#### `LazyIterator.intersect`

Create `LazyIterator` only with elements which was existed in both `LazyIterator`s.

_Warning_: Be careful, provided as argument iterator should be iterated for the computation. So it doesn't work with infinity iterable objects.

```typescript
function except<I>(other: LazyIterator<I>): LazyIterator<I>;
```

- `other: LazyIterator<I>` - `LazyIterator` with element which should be existed in `this` `LazyIterator`
- Returns `LazyIterator` that contains elements from both `other` and `this` `LazyIterator`.

```typescript
const iterator = LazyIterator.from([1, 1, 2, 3, 4, 4, 12, 6, 2, 3, 4, 5]);
const intersection = iterator.intersect(LazyIterator.from([2, 4, 1, 8, 15]));

for (const a of intesection) console.log(a);
// 1
// 1
// 2
// 4
// 4
// 2
// 4
```

#### `LazyIterator.isEmpty`

Check `LazyIterator` for emptiness.

```typescript
function isEmpty(): boolean;
```

- Returns `true` if `LazyIterator` doesn't contain any item otherwise `false`.

```typescript
const iterator1 = LazyIterator.from([1, 2, 3, 4, 5]);
const iterator2 = LazyIterator.from([]);

iterator1.isEmpty(); // false
iterator2.isEmpty(); // true
```

#### `LazyIterator.except`

Convert `LazyIterator` without element which was contained in provided `LazyIterator`.

_Warning_: Be careful, provided as argument iterator should be iterated for the computation. So it doesn't work with infinity iterable objects.

```typescript
function except<I>(other: LazyIterator<I>): LazyIterator<I>;
```

- Returns `Iterable` object which contains all `LazyIterator` elements.

```typescript
const iterator1 = LazyIterator.from([1, 2, 3, 4, 5], function* (lazy) {
  for (const i of lazy) yield i;
});
const iterator2 = LazyIterator.from([1, 2, 3, 4, 5]);

iterator1.collect(); // iterable object
iterator2.collect(); // array [1, 2, 3, 4, 5]
```

#### `LazyIterator.prepend`

Create `LazyIterator` with new element at the head position.

```typescript
function prepend<I>(item: I): LazyIterator<I>;
```

- `item: I` - element which should be added at the head position of `LazyIterator`
- Returns `LazyIterator` which contains `item` at the head position.

```typescript
const iterator1 = LazyIterator.from([1, 2, 3, 4, 5]);
const iterator2 = iterator1.prepend(4);

for (const a of iterator2) console.log(a);
// 4
// 1
// 2
// 3
// 4
// 5
```

#### `LazyIterator.append`

Create `LazyIterator` with new element in the end.

```typescript
function append<I>(item: I): LazyIterator<I>;
```

- `item: I` - element which should be added at the end position of `LazyIterator`
- Returns `LazyIterator` which contains `item` at the end position.

```typescript
const iterator1 = LazyIterator.from([1, 2, 3, 4, 5]);
const iterator2 = iterator1.append(4);

for (const a of iterator2) console.log(a);
// 1
// 2
// 3
// 4
// 5
// 4
```

#### `LazyIterator.collect`

Convert `LazyIterator` in initial iterable object or array.
If initial iterable object had `fromIterator` method or `fromIterator` was provided as second argument of [`LazyIterator.from`](#lazyiteratorfrom) function `fromIterator` will be called for converting, otherwise convert `LazyIterator` in array.

```typescript
function collect<I>(): Iterable<I>;
```

- Returns `Iterable` object which contains all `LazyIterator` elements.

```typescript
const iterator1 = LazyIterator.from([1, 2, 3, 4, 5], function* (lazy) {
  for (const i of lazy) yield i;
});
const iterator2 = LazyIterator.from([1, 2, 3, 4, 5]);

iterator1.collect(); // iterable object
iterator2.collect(); // array [1, 2, 3, 4, 5]
```

## License

MIT (c) Artem Kobzar see LICENSE file.
