# @sweet-monads/maybe

[Maybe Monad](https://en.wikibooks.org/wiki/Haskell/Understanding_monads/Maybe), The Maybe monad represents computations which might "go wrong" by not returning a value.

### This library belongs to *sweet-monads* project

> **sweet-monads** — easy-to-use monads implementation with static types definition and separated packages.

- No dependencies, one small file
- Easily auditable TypeScript/JS code
- Check out all libraries:
  [either](https://github.com/JSMonk/sweet-monads/tree/master/either),
  [iterator](https://github.com/JSMonk/sweet-monads/tree/master/iterator),
  [interfaces](https://github.com/JSMonk/sweet-monads/tree/master/interfaces),

## Usage

> npm install @sweet-monads/maybe

```typescript
import { Maybe } from "@sweet-monads/maybe";

type User = { email: string, password: string };

function getUser(id: number): Maybe<User> {
  return Maybe.just({ email: "test@gmail.com", password: "test" });
}

// Maybe<string>
const user = getUser(1).map(({ email }) => email);
```

## API

- [`Maybe.merge`](#maybemerge)
- [`Maybe.none`](#maybenone)
- [`Maybe.just`](#maybejust)
- [`Maybe.from`](#maybefrom)
- [`Maybe#isNone`](#maybeisnone)
- [`Maybe#isJust`](#maybeisjust)
- [`Maybe#join`](#maybejoin)
- [`Maybe#map`](#maybemap)
- [`Maybe#asyncMap`](#maybeasyncmap)
- [`Maybe#apply`](#maybeapply)
- [`Maybe#asyncApply`](#maybeasyncapply)
- [`Maybe#chain`](#maybechain)
- [`Maybe#asyncChain`](#maybeasyncchain)
- [Helpers](#helpers)

#### `Maybe.merge`
```typescript
function merge<V1>(values: [Maybe<V1>]): Maybe<[V1]>;
function merge<V1, V2>(values: [Maybe<V1>, Maybe<V2>]): Maybe<[V1, V2]>;
function merge<V1, V2, V3>(values: [Maybe<V1>, Maybe<V2>, Maybe<V3>]): Maybe<[V1, V2, V3]>;
// ... until 10 elements
```
- `values: Array<Maybe<T>>` - Array of Maybe values which will be merged into Maybe of Array 
- Returns `Maybe<Array<T>>` Maybe of Array which will contain `Just<Array<T>>` if all of array elements was `Just<T>` else `None`. 

Example:
```typescript
const v1 = Maybe.just(2); // Maybe<number>.Just
const v2 = Maybe.just("test"); // Maybe<string>.Just
const v3 = Maybe.none<boolean>(); // Maybe<boolean>.None

Maybe.merge([v1, v2]) // Maybe<[number, string]>.Just
Maybe.merge([v1, v2, v3]) // Maybe<[number, string, boolean]>.None
```

#### `Maybe.none`
```typescript
function none<T>(): Maybe<T>;
```
- Returns `Maybe` with `None` state
Example:
```typescript
const v1 = Maybe.none(); // Maybe<unknown>.None
const v2 = Maybe.none<number>(); // Maybe<number>.None
```

#### `Maybe.just`
```typescript
function just<T>(value: T): Maybe<T>;
```
- Returns `Maybe` with `Just` state which contain value with `T` type.
Example:
```typescript
const v1 = Maybe.just(2); // Maybe<number>.Just
const v2 = Maybe.just<2>(2); // Maybe<2>.Just
```

#### `Maybe.from`

The same as [`Maybe.just`](#maybejust)

```typescript
function from<T>(value: T): Maybe<T>;
```
- Returns `Maybe` with `Just` state which contain value with `T` type.
Example:
```typescript
const v1 = Maybe.from(2); // Maybe<number>.Just
const v2 = Maybe.from<2>(2); // Maybe<2>.Just
```

#### `Maybe#isNone`
```typescript
function isNone(): boolean;
```
- Returns `true` if state of `Maybe` is `None` otherwise `false`
Example:
```typescript
const v1 = Maybe.just(2);
const v2 = Maybe.none();

v1.isNone() // false
v2.isNone() // true
```

#### `Maybe#isJust`
```typescript
function isJust(): boolean;
```
- Returns `true` if state of `Maybe` is `Just` otherwise `false`
Example:
```typescript
const v1 = Maybe.just(2);
const v2 = Maybe.none();

v1.isJust() // true
v2.isJust() // false
```

#### `Maybe#join`
```typescript
function join<V>(this: Maybe<Maybe<V>>): Maybe<V>;
```
- `this: Maybe<Maybe<V>>` - `Maybe` instance which contains other `Maybe` instance as `Just` value.
- Returns unwrapped `Maybe` - if current `Maybe` has `Just` state and inner `Maybe` has `Just` state then returns inner `Maybe` `Just`, otherwise returns `Maybe` `None`.
Example:
```typescript
const v1 = Maybe.just(Maybe.just(2));
const v2 = Maybe.just(Maybe.none());
const v3 = Maybe.none<Maybe<number>>();

v1.join() // Maybe.Just with value 2
v2.join() // Maybe.None without value
v3.join() // Maybe.None without value
```

#### `Maybe#map`
```typescript
function map<Val, NewVal>(fn: (val: Val) => NewVal): Maybe<NewVal>;
```
- Returns mapped by `fn` function value wrapped by `Maybe` if `Maybe` is `Just` otherwise `None`
Example:
```typescript
const v1 = Maybe.just(2);
const v2 = Maybe.none<number>();

const newVal1 = v1.map(a => a.toString()); // Maybe<string>.Just with value "2"
const newVal2 = v2.map(a => a.toString()); // Maybe<string>.None without value
```

##### `Maybe#asyncMap`
```typescript
function asyncMap<Val, NewVal>(fn: (val: Val) => Promise<NewVal>): Promise<Maybe<NewVal>>;
```
- Returns `Promise` with mapped by `fn` function value wrapped by `Maybe` if `Maybe` is `Just` otherwise `None`
Example:
```typescript
const v1 = Maybe.just(2);
const v2 = Maybe.none<number>();

// Promise<Maybe<string>.Just> with value "2"
const newVal1 = v1.asyncMap(a => Promise.resolve(a.toString())); 
// Promise<Maybe<string>.None> without value
const newVal2 = v2.asyncMap(a => Promise.resolve(a.toString()));
```

##### `Maybe#apply`
```typescript
function apply<A, B>(this: Maybe<(a: A) => B>, arg: Maybe<A>): Maybe<B>;
function apply<A, B>(this: Maybe<A>, fn: Maybe<(a: A) => B>): Maybe<B>;
```
- `this | fn` - function wrapped by Maybe, which should be applied to value `arg`
- `arg | this` - value which should be applied to `fn`
- Returns mapped by `fn` function value wrapped by `Maybe` if `Maybe` is `Just` otherwise `None`
Example:
```typescript
const v1 = Maybe.just(2);
const v2 = Maybe.none<number>();
const fn1 = Maybe.just((a: number) => a * 2);
const fn2 = Maybe.none<(a: number) => number>();

const newVal1 = fn1.apply(v1); // Maybe<number>.Just with value 4 
const newVal2 = fn1.apply(v2); // Maybe<number>.None without value
const newVal3 = fn2.apply(v1); // Maybe<number>.None without value
const newVal4 = fn2.apply(v2); // Maybe<number>.None without value
```

##### `Maybe#asyncApply`

Async variant of [`Maybe#apply`](#maybeapply)

```typescript
function asyncApply<A, B>(this: Maybe<(a: Promise<A> | A) => Promise<B>>, arg: Maybe<Promise<A> | A>): Promise<Maybe<B>>;
function asyncApply<A, B>(this: Maybe<Promise<A> | A>, fn: Maybe<(a: Promise<A> | A) => Promise<B>>): Promise<Maybe<B>>;
```
- `this | fn` - function wrapped by Maybe, which should be applied to value `arg`
- `arg | this` - value which should be applied to `fn`
- Returns `Promise` with mapped by `fn` function value wrapped by `Maybe` if `Maybe` is `Just` otherwise `None`
Example:
```typescript
const v1 = Maybe.just(2);
const v2 = Maybe.none<number>();
const fn1 = Maybe.just((a: number) => Promise,resolve(a * 2));
const fn2 = Maybe.none<(a: number) => Promise<number>>();

const newVal1 = fn1.apply(v1); // Promise<Maybe<number>.Just> with value 4 
const newVal2 = fn1.apply(v2); // Promise<Maybe<number>.None> without value
const newVal3 = fn2.apply(v1); // Promise<Maybe<number>.None> without value
const newVal4 = fn2.apply(v2); // Promise<Maybe<number>.None> without value
```

#### `Maybe#chain`
```typescript
function chain<Val, NewVal>(fn: (val: Val) => Maybe<NewVal>): Maybe<NewVal>;
```
- Returns mapped by `fn` function value wrapped by `Maybe` if `Maybe` is `Just` and returned by `fn` value is `Just` too otherwise `None`
Example:
```typescript
const v1 = Maybe.just(2);
const v2 = Maybe.none<number>();

const newVal1 = v1.chain(a => Maybe.just(a.toString())); // Maybe<string>.Just with value "2"
const newVal2 = v1.chain(a => Maybe.none()); // Maybe<string>.None without value
const newVal3 = v2.chain(a => Maybe.just(a.toString())); // Maybe<string>.None without value
const newVal4 = v2.chain(a => Maybe.none()); // Maybe<string>.None without value
```

##### `Maybe#asyncChain`
```typescript
function asyncChain<Val, NewVal>(fn: (val: Val) => Promise<Maybe<NewVal>>): Promise<Maybe<NewVal>>;
```
- Returns `Promise` with mapped by `fn` function value wrapped by `Maybe` if `Maybe` is `Just` otherwise `None`
Example:
```typescript
const v1 = Maybe.just(2);
const v2 = Maybe.none<number>();
// Promise<Maybe<string>>.Just with value "2"
const newVal1 = v1.asyncChain(a => Promise.resolve(Maybe.just(a.toString())));
// Promise<Maybe<string>>.None without value
const newVal2 = v1.asyncChain(a => Promise.resolve(Maybe.none()));
// Promise<Maybe<string>>.None without value
const newVal3 = v2.asyncChain(a => Promise.resolve(Maybe.just(a.toString())));
// Promise<Maybe<string>>.None without value
const newVal4 = v2.asyncChain(a => Promise.resolve(Maybe.none()));
```

#### Helpers

```typescript
// Value from Maybe instance
const { value } = Maybe.just(2); // number | undefined
```

## License

MIT (c) Artem Kobzar see LICENSE file.
