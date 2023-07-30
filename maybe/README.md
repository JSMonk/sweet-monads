# @sweet-monads/maybe

[Maybe Monad](https://en.wikibooks.org/wiki/Haskell/Understanding_monads/Maybe), The Maybe monad represents computations which might "go wrong" by not returning a value.

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

## Usage

> npm install @sweet-monads/maybe

```typescript
import { Maybe, just, none } from "@sweet-monads/maybe";

type User = { email: string; password: string };

function getUser(id: number): Maybe<User> {
  return just({ email: "test@gmail.com", password: "test" });
}

// Maybe<string>
const user = getUser(1).map(({ email }) => email);
```

## API

- [`chain`](#chain)
- [`merge`](#merge)
- [`none`](#none)
- [`just`](#just)
- [`from`](#from)
- [`fromNullable`](#fromnullable)
- [`isMaybe`](#ismaybe)
- [`Maybe#isNone`](#maybeisnone)
- [`Maybe#isJust`](#maybeisjust)
- [`Maybe#or`](#maybeor)
- [`Maybe#join`](#maybejoin)
- [`Maybe#map`](#maybemap)
- [`Maybe#asyncMap`](#maybeasyncmap)
- [`Maybe#apply`](#maybeapply)
- [`Maybe#asyncApply`](#maybeasyncapply)
- [`Maybe#chain`](#maybechain)
- [`Maybe#asyncChain`](#maybeasyncchain)
- [`Maybe#fold`](#maybefold)
- [Helpers](#helpers)

#### `chain`

```typescript
function chain<A, B>(fn: (v: A) => Promise<Maybe<B>>): (m: Maybe<A>) => Promise<Maybe<B>>;
```

- `fn: (v: A) => Promise<Maybe<B>>` - function which should be applied asynchronously to `Maybe<A>` value
- Returns function with `Maybe<A>` argument and promised `Maybe` with `Maybe.None` or mapped by `fn` value (could be used inside `Promise#then` function).

Example:

```typescript
const getValue = async () => just(1);

// Maybe<number>
const result = await getValue()
  .then(Maybe.chain(async v => just(v * 2)))
  .then(Maybe.chain(async v => none()));
```

#### `merge`

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
const v1 = just(2); // Maybe<number>.Just
const v2 = just("test"); // Maybe<string>.Just
const v3 = none<boolean>(); // Maybe<boolean>.None

merge([v1, v2]); // Maybe<[number, string]>.Just
merge([v1, v2, v3]); // Maybe<[number, string, boolean]>.None
```

#### `none`

```typescript
function none<T>(): Maybe<T>;
```

- Returns `Maybe` with `None` state
  Example:

```typescript
const v1 = none(); // Maybe<never>.None
const v2 = none<number>(); // Maybe<number>.None
```

#### `just`

```typescript
function just<T>(value: T): Maybe<T>;
```

- Returns `Maybe` with `Just` state which contain value with `T` type.
  Example:

```typescript
const v1 = just(2); // Maybe<number>.Just
const v2 = just<2>(2); // Maybe<2>.Just
```

#### `from`

The same as [`just`](#just)

```typescript
function from<T>(value: T): Maybe<T>;
```

- Returns `Maybe` with `Just` state which contain value with `T` type.
  Example:

```typescript
const v1 = from(2); // Maybe<number>.Just
const v2 = from<2>(2); // Maybe<2>.Just
```

#### `fromNullable`

```typescript
function fromNullable<T>(value: T): Maybe<NonNullable<T>>;
```

- Returns `Maybe` with `Just` state which contain value with `T` type if value is not null or undefined and `None` otherwise.
  Example:

```typescript
const v1 = fromNullable(2); // Maybe<number>.Just
```

#### `isMaybe`

```typescript
function isMaybe<T>(value: unknown | Maybe<T>): value is Maybe<T>;
```

- Returns `boolean` if given `value` is instance of Maybe constructor.
  Example:

```typescript
const value: unknown = 2;
if (isMaybe(value)) {
  // ... value is Maybe<unknown> at this block
}
```

#### `Maybe#isNone`

```typescript
function isNone(): boolean;
```

- Returns `true` if state of `Maybe` is `None` otherwise `false`
  Example:

```typescript
const v1 = just(2);
const v2 = none();

v1.isNone(); // false
v2.isNone(); // true
```

#### `Maybe#isJust`

```typescript
function isJust(): boolean;
```

- Returns `true` if state of `Maybe` is `Just` otherwise `false`
  Example:

```typescript
const v1 = just(2);
const v2 = none();

v1.isJust(); // true
v2.isJust(); // false
```

#### `Maybe#or`

```typescript
function or<T>(x: Maybe<T>): Maybe<T>;
```

- Returns `Maybe<T>`. If state of `this` is `Just` then `this` will be returned otherwise `x` argument will be returned
  Example:

```typescript
const v1 = just(1);
const v2 = none<number>();
const v3 = none<number>();
const v4 = just(4);

v1.or(v2); // v1 will be returned
v2.or(v1); // v1 will be returned
v2.or(v3); // v3 will be returned
v1.or(v4); // v1 will be returned

v2.or(v3).or(v1); // v1 will be returned
v2.or(v1).or(v3); // v1 will be returned
v1.or(v2).or(v3); // v1 will be returned
```

#### `Maybe#join`

```typescript
function join<V>(this: Maybe<Maybe<V>>): Maybe<V>;
```

- `this: Maybe<Maybe<V>>` - `Maybe` instance which contains other `Maybe` instance as `Just` value.
- Returns unwrapped `Maybe` - if current `Maybe` has `Just` state and inner `Maybe` has `Just` state then returns inner `Maybe` `Just`, otherwise returns `Maybe` `None`.
  Example:

```typescript
const v1 = just(just(2));
const v2 = just(none());
const v3 = none<Maybe<number>>();

v1.join(); // Maybe.Just with value 2
v2.join(); // Maybe.None without value
v3.join(); // Maybe.None without value
```

#### `Maybe#map`

```typescript
function map<Val, NewVal>(fn: (val: Val) => NewVal): Maybe<NewVal>;
```

- Returns mapped by `fn` function value wrapped by `Maybe` if `Maybe` is `Just` otherwise `None`
  Example:

```typescript
const v1 = just(2);
const v2 = none<number>();

const newVal1 = v1.map(a => a.toString()); // Maybe<string>.Just with value "2"
const newVal2 = v2.map(a => a.toString()); // Maybe<string>.None without value
```

#### `Maybe#mapNullable`

```typescript
function mapNullable<Val, NewVal>(fn: (val: Val) => (NewVal | null | undefined)): Maybe<NonNullable<NewVal>>;
```

- Returns mapped by `fn` function value wrapped by `Maybe` if `Maybe` is `Just` and the returned value is not `null` or `undefined` otherwise `None`
  Example:

```typescript
const v1 = just(2);
const v2 = none<number>();

const newVal1 = v1.mapNullable(a => a.toString()); // Maybe<string>.Just with value "2"
const newVal2 = v2.mapNullable(a => a.toString()); // Maybe<string>.None without value
const newVal3 = v2.mapNullable<string | null>(a => null); // Maybe<string>.None without value
const newVal4 = v2.mapNullable<string | void>(a => undefined); // Maybe<string>.None without value
```

#### `Maybe#mapNullable`

```typescript
function map<Val, NewVal>(fn: (val: Val) => NewVal): Maybe<NewVal>;
```

- Returns mapped by `fn` function value wrapped by `Maybe` if `Maybe` is `Just` otherwise `None`
  Example:

```typescript
const v1 = just(2);
const v2 = none<number>();

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
const v1 = just(2);
const v2 = none<number>();

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
const v1 = just(2);
const v2 = none<number>();
const fn1 = just((a: number) => a * 2);
const fn2 = none<(a: number) => number>();

const newVal1 = fn1.apply(v1); // Maybe<number>.Just with value 4
const newVal2 = fn1.apply(v2); // Maybe<number>.None without value
const newVal3 = fn2.apply(v1); // Maybe<number>.None without value
const newVal4 = fn2.apply(v2); // Maybe<number>.None without value
```

##### `Maybe#asyncApply`

Async variant of [`Maybe#apply`](#maybeapply)

```typescript
function asyncApply<A, B>(
  this: Maybe<(a: Promise<A> | A) => Promise<B>>,
  arg: Maybe<Promise<A> | A>
): Promise<Maybe<B>>;
function asyncApply<A, B>(this: Maybe<Promise<A> | A>, fn: Maybe<(a: Promise<A> | A) => Promise<B>>): Promise<Maybe<B>>;
```

- `this | fn` - function wrapped by Maybe, which should be applied to value `arg`
- `arg | this` - value which should be applied to `fn`
- Returns `Promise` with mapped by `fn` function value wrapped by `Maybe` if `Maybe` is `Just` otherwise `None`
  Example:

```typescript
const v1 = just(2);
const v2 = none<number>();
const fn1 = just((a: number) => Promise, resolve(a * 2));
const fn2 = none<(a: number) => Promise<number>>();

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
const v1 = just(2);
const v2 = none<number>();

const newVal1 = v1.chain(a => just(a.toString())); // Maybe<string>.Just with value "2"
const newVal2 = v1.chain(a => none()); // Maybe<string>.None without value
const newVal3 = v2.chain(a => just(a.toString())); // Maybe<string>.None without value
const newVal4 = v2.chain(a => none()); // Maybe<string>.None without value
```

##### `Maybe#asyncChain`

```typescript
function asyncChain<Val, NewVal>(fn: (val: Val) => Promise<Maybe<NewVal>>): Promise<Maybe<NewVal>>;
```

- Returns `Promise` with mapped by `fn` function value wrapped by `Maybe` if `Maybe` is `Just` otherwise `None`
  Example:

```typescript
const v1 = just(2);
const v2 = none<number>();
// Promise<Maybe<string>>.Just with value "2"
const newVal1 = v1.asyncChain(a => Promise.resolve(just(a.toString())));
// Promise<Maybe<string>>.None without value
const newVal2 = v1.asyncChain(a => Promise.resolve(none()));
// Promise<Maybe<string>>.None without value
const newVal3 = v2.asyncChain(a => Promise.resolve(just(a.toString())));
// Promise<Maybe<string>>.None without value
const newVal4 = v2.asyncChain(a => Promise.resolve(none()));
```

##### `Maybe#fold`

```typescript
function fold<C>(mapNone: () => C, mapJust: (value: T) => C): C;
```

- Returns value mapped by one of mapper functions. If `Maybe` is `Just` then `mapJust` is result of `mapJust` 
  is returned, otherwise return of `mapNone` gets returned.

Example:
```typescript
const v1 = just(2);
const v2 = none<number>();

// "just: 4"
const newVal1 = v1.fold(() => 'none', value => 'just: '+value*2) 
// "none"
const newVal2 = v1.fold(() => 'none', value => 'just: '+value*2)
```

#### Helpers

```typescript
// Value from Maybe instance
const { value } = just(2); // number | undefined
```

```typescript
just(2).unwrap(); // returns 2
none().unwrap(); // Throws error

just(2).unwrap(() => new Error("NEVER!")); // returns 2
none().unwrap(() => new CustomError("My error")); // Throws CustomError

just(2).unwrapOr(3) // returns 3
none().unwrapOr(3) // returns 2

just(2).unwrapOrElse(num => num * 2) // returns 4
none().unwrapOrElse(num => num * 2) // returns 2
```

## License

MIT (c) Artem Kobzar see LICENSE file.
