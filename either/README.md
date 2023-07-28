# @sweet-monads/either

[Either Monad](https://hackage.haskell.org/package/category-extras-0.52.0/docs/Control-Monad-Either.html), The Either monad represents values with two possibilities: a value of type Either a b is either Left a or Right b.

### This library belongs to _sweet-monads_ project

> **sweet-monads** — easy-to-use monads implementation with static types definition and separated packages.

- No dependencies, one small file
- Easily auditable TypeScript/JS code
- Check out all libraries:
  [either](https://github.com/JSMonk/sweet-monads/tree/master/either),
  [iterator](https://github.com/JSMonk/sweet-monads/tree/master/iterator),
  [interfaces](https://github.com/JSMonk/sweet-monads/tree/master/interfaces),
  [maybe](https://github.com/JSMonk/sweet-monads/tree/master/maybe)

## Usage

> npm install @sweet-monads/either

```typescript
import { Either, right } from "@sweet-monads/either";

class UserNotFoundError extends Error {
  name: "UserNotFoundError";
}
type User = { email: string; password: string };

function getUser(id: number): Either<UserNotFoundError, User> {
  return right({ email: "test@gmail.com", password: "test" });
}

// Either<UserNotFoundError, string>
const user = getUser(1).map(({ email }) => email);
```

## API

- [`chain`](#chain)
- [`merge`](#merge)
- [`mergeInOne`](#mergeinone)
- [`mergeInMany`](#mergeinmany)
- [`left`](#left)
- [`right`](#right)
- [`from`](#from)
- [`fromTry`](#fromtry)
- [`fromPromise`](#frompromise)
- [`isEither`](#iseither)
- [`Either#isLeft`](#eitherisleft)
- [`Either#isRight`](#eitherisright)
- [`Either#or`](#eitheror)
- [`Either#join`](#eitherjoin)
- [`Either#map`](#eithermap)
- [`Either#mapRight`](#eithermapright)
- [`Either#mapLeft`](#eithermapleft)
- [`Either#asyncMap`](#eitherasyncmap)
- [`Either#apply`](#eitherapply)
- [`Either#asyncApply`](#eitherasyncapply)
- [`Either#chain`](#eitherchain)
- [`Either#asyncChain`](#eitherasyncchain)
- [`Either#fold`](#eitherfold)
- [Helpers](#helpers)

#### `chain`

```typescript
function chain<L, R, NL, NR>(fn: (v: R) => Promise<Either<NL, NR>>): (m: Either<L, R>) => Promise<Either<L | NL, NR>>;
```

- `fn: (v: R) => Promise<Either<NL, NR>>` - function which should be applied asynchronously to `Either<L, R>` value
- Returns function with `Either<L, R>` argument and promised `Either` with new error or mapped by `fn` value (could be used inside `Promise#then` function).

Example:

```typescript
const getValue = async () => right(1);

// Either<TypeError, right>
const result = await getValue()
  .then(Either.chain(async v => right(v * 2)))
  .then(Either.chain(async v => left(new TypeError("Unexpected"))));
```

#### `merge`

Alias for [`mergeInOne`](#mergeinone)

```typescript
function merge<L1, R1>(values: [Either<L1, R1>]): Either<L1, [R1]>;
function merge<L1, R1, L2, R2>(values: [Either<L1, R1>, Either<L2, R2>]): Either<L1 | L2, [R1, R2]>;
function merge<L1, R1, L2, R2, L3, R3>(
  values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>]
): Either<L1 | L2 | L3, [R1, R2, R3]>;
// ... until 10 elements
```

- `values: Array<Either<L, R>>` - Array of Either values which will be merged into Either of Array
- Returns `Either<L, Array<R>>` which will contain `Right<Array<R>>` if all of array elements was `Right<R>` otherwise `Left<L>`.

Example:

```typescript
const v1 = right<TypeError, number>(2); // Either<TypeError, number>.Right
const v2 = right<ReferenceError, string>("test"); // Either<ReferenceError, string>.Right
const v3 = left<Error, boolean>(new Error()); // Either<Error, boolean>.Left

merge([v1, v2]); // Either<TypeError | ReferenceError, [number, string]>.Right
merge([v1, v2, v3]); // Either<TypeError | ReferenceError | Error, [number, string, boolean]>.Left
```

#### `mergeInOne`

```typescript
function merge<L1, R1>(values: [Either<L1, R1>]): Either<L1, [R1]>;
function merge<L1, R1, L2, R2>(values: [Either<L1, R1>, Either<L2, R2>]): Either<L1 | L2, [R1, R2]>;
function merge<L1, R1, L2, R2, L3, R3>(
  values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>]
): Either<L1 | L2 | L3, [R1, R2, R3]>;
// ... until 10 elements
```

- `values: Array<Either<L, R>>` - Array of Either values which will be merged into Either of Array
- Returns `Either<L, Array<R>>` which will contain `Right<Array<R>>` if all of array elements was `Right<R>` otherwise `Left<L>`.

Example:

```typescript
const v1 = right<TypeError, number>(2); // Either<TypeError, number>.Right
const v2 = right<ReferenceError, string>("test"); // Either<ReferenceError, string>.Right
const v3 = left<Error, boolean>(new Error()); // Either<Error, boolean>.Left

merge([v1, v2]); // Either<TypeError | ReferenceError, [number, string]>.Right
merge([v1, v2, v3]); // Either<TypeError | ReferenceError | Error, [number, string, boolean]>.Left
```

#### `mergeInMany`

```typescript
function mergeInMany<L1, R1>(values: [Either<L1, R1>]): Either<Array<L1>, [R1]>;
function mergeInMany<L1, R1, L2, R2>(values: [Either<L1, R1>, Either<L2, R2>]): Either<Array<L1 | L2>, [R1, R2]>;
function mergeInMany<L1, R1, L2, R2, L3, R3>(
  values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>]
): Either<Array<L1 | L2 | L3>, [R1, R2, R3]>;
// ... until 10 elements
```

- `values: Array<Either<L, R>>` - Array of Either values which will be merged into Either of Array
- Returns `Either<Array<L>, Array<R>>` which will contain `Right<Array<R>>` if all of array elements was `Right<R>` otherwise array of all caught `Left<L>` values.

Example:

```typescript
const v1 = right<TypeError, number>(2); // Either<TypeError, number>.Right
const v2 = right<ReferenceError, string>("test"); // Either<ReferenceError, string>.Right
const v3 = left<Error, boolean>(new Error()); // Either<Error, boolean>.Left

merge([v1, v2]); // Either<Array<TypeError | ReferenceError>, [number, string]>.Right
merge([v1, v2, v3]); // Either<Array<TypeError | ReferenceError | Error>, [number, string, boolean]>.Left
```

#### `left`

```typescript
function left<L, R>(value: L): Either<L, R>;
```

- Returns `Either` with `Left` state which contain value with `L` type.
  Example:

```typescript
const v1 = left(new Error()); // Either<Error, never>.Left
const v2 = left<Error, number>(new Error()); // Either<Error, number>.Left
```

#### `right`

```typescript
function right<L, R>(value: R): Either<L, R>;
```

- Returns `Either` with `Right` state which contain value with `R` type.
  Example:

```typescript
const v1 = right(2); // Either<never, number>.Right
const v2 = right<Error, number>(2); // Either<Error, number>.Right
```

#### `from`

The same as [`right`](#right)

Return only `Right` typed value.

```typescript
function from<R>(value: R): Either<never, R>;
```

- Returns `Either` with `Right` state which contain value with `R` type.
  Example:

```typescript
from(2); // Either<never, number>.Right
```

#### `fromTry`

Returns `Right` with function result or `Left` if function execution throws an error.

```typescript
function fromTry<L, R>(fn: () => R): Either<L, R>;
```

```typescript
fromTry(() => 2); // Either<never, number>.Right
fromTry(() => {
  throw new Error("test");
}); // Either<Error, never>.Left
```

#### `fromPromise`

Returns `Right` with the promise value if the provided promise fulfilled or `Left` with the error value if the provided promise rejected.

```typescript
function fromPromise<L, R>(promise: Promise<R>): Promise<Either<L, R>>;
```

```typescript
fromPromise(Promise.resolve(2)); // Either<never, number>.Right
fromPromise(Promise.reject(new Error("test"))); // Either<Error, never>.Left
```

#### `isEither`

```typescript
function isEither<L, R>(value: unknown | Either<L, R>): value is Either<L, R>;
```

- Returns `boolean` if given `value` is instance of Either constructor.
  Example:

```typescript
const value: unknown = 2;
if (isEither(value)) {
  // ... value is Either<unknown, unknown> at this block
}
```

#### `Either#isLeft`

```typescript
function isLeft(): boolean;
```

- Returns `true` if state of `Either` is `Left` otherwise `false`
  Example:

```typescript
const v1 = right(2);
const v2 = left(2);

v1.isLeft(); // false
v2.isLeft(); // true
```

#### `Either#isRight`

```typescript
function isRight(): boolean;
```

- Returns `true` if state of `Either` is `Right` otherwise `false`
  Example:

```typescript
const v1 = right(2);
const v2 = left(2);

v1.isRight(); // true
v2.isRight(); // false
```

#### `Either#or`

```typescript
function or<L, R>(x: Either<L, R>): Either<L, R>;
```

- Returns `Either<L, R>`. If state of `this` is `Right` then `this` will be returned otherwise `x` argument will be returned
  Example:

```typescript
const v1 = right<string, number>(2);
const v2 = left<string, number>("Error 1");
const v3 = left<string, number>("Error 2");
const v4 = right<string, number>(3);

v1.or(v2); // v1 will be returned
v2.or(v1); // v1 will be returned
v2.or(v3); // v3 will be returned
v1.or(v4); // v1 will be returned

v2.or(v3).or(v1); // v1 will be returned
v2.or(v1).or(v3); // v1 will be returned
v1.or(v2).or(v3); // v1 will be returned
```

#### `Either#join`

```typescript
function join<L1, L2, R>(this: Either<L1, Either<L2, R>>): Either<L1 | L2, R>;
```

- `this: Either<L1, Either<L2, R>>` - `Either` instance which contains other `Either` instance as `Right` value.
- Returns unwrapped `Either` - if current `Either` has `Right` state and inner `Either` has `Right` state then returns inner `Either` `Right`, if inner `Either` has `Left` state then return inner `Either` `Left` otherwise outer `Either` `Left`.
  Example:

```typescript
const v1 = right(right(2));
const v2 = right(left(new Error()));
const v3 = left<TypeError, Either<Error, number>>(new TypeError());

v1.join(); // Either.Right with value 2
v2.join(); // Either.Left with value new Error
v3.join(); // Either.Left with value new TypeError
```

#### `Either#map`

```typescript
function map<L, R, NewR>(fn: (val: R) => NewR): Either<L, NewR>;
```

- Returns mapped by `fn` function value wrapped by `Either` if `Either` is `Right` otherwise `Left` with `L` value
  Example:

```typescript
const v1 = right<Error, number>(2);
const v2 = left<Error, number>(new Error());

const newVal1 = v1.map(a => a.toString()); // Either<Error, string>.Right with value "2"
const newVal2 = v2.map(a => a.toString()); // Either<Error, string>.Left with value new Error()
```

#### `Either#mapRight`

```typescript
function mapRight<L, R, NewR>(fn: (val: R) => NewR): Either<L, NewR>;
```

The same as [`Either#map`](#eithermap)

- Returns mapped by `fn` function value wrapped by `Either` if `Either` is `Right` otherwise `Left` with `L` value
  Example:

```typescript
const v1 = right<Error, number>(2);
const v2 = left<Error, number>(new Error());

const newVal1 = v1.map(a => a.toString()); // Either<Error, string>.Right with value "2"
const newVal2 = v2.map(a => a.toString()); // Either<Error, string>.Left with value new Error()
```

#### `Either#mapLeft`

```typescript
function mapLeft<L, R, NewL>(fn: (val: L) => NewL): Either<NewL, R>;
```

- Returns mapped by `fn` function value wrapped by `Either` if `Either` is `Left` otherwise `Right` with `R` value
  Example:

```typescript
const v1 = right<Error, number>(2);
const v2 = left<Error, number>(new Error());

const newVal1 = v1.mapLeft(a => a.toString()); // Either<string, number>.Right with value 2
const newVal2 = v2.mapLeft(a => a.toString()); // Either<string, number>.Left with value "Error"
```

##### `Either#asyncMap`

```typescript
function asyncMap<L, R, NewR>(fn: (val: R) => Promise<NewR>): Promise<Either<L, NewR>>;
```

- Returns `Promise` with mapped by `fn` function value wrapped by `Either` if `Either` is `Right` otherwise `Left` with value `L`
  Example:

```typescript
const v1 = right<Error, number>(2);
const v2 = left<Error, number>(new Error());

// Promise<Either<Error, string>.Right> with value "2"
const newVal1 = v1.asyncMap(a => Promise.resolve(a.toString()));
// Promise<Either<Error, string>.Left> with value new Error()
const newVal2 = v2.asyncMap(a => Promise.resolve(a.toString()));
```

##### `Either#apply`

```typescript
function apply<A, B>(this: Either<L, (a: A) => B>, arg: Either<L, A>): Either<L, B>;
function apply<A, B>(this: Either<L, A>, fn: Either<L, (a: A) => B>): Either<L, B>;
```

- `this | fn` - function wrapped by Either, which should be applied to value `arg`
- `arg | this` - value which should be applied to `fn`
- Returns mapped by `fn` function value wrapped by `Either` if `Either` is `Right` otherwise `Left` with `L` value
  Example:

```typescript
const v1 = right<Error, number>(2);
const v2 = left<Error, number>(new Error());
const fn1 = right<Error, (a: number) => number>((a: number) => a * 2);
const fn2 = left<Error, (a: number) => number>(new Error());

const newVal1 = fn1.apply(v1); // Either<Error, number>.Right with value 4
const newVal2 = fn1.apply(v2); // Either<Error, number>.Left with value new Error()
const newVal3 = fn2.apply(v1); // Either<Error, number>.Left with value new Error()
const newVal4 = fn2.apply(v2); // Either<Error, number>.Left with value new Error()
```

##### `Either#asyncApply`

Async variant of [`Either#apply`](#eitherapply)

```typescript
function asyncApply<A, B>(this: Either<L, (a: A) => Promise<B>>, arg: Either<L, Promise<A> | A>): Promise<Either<L, B>>;
function asyncApply<A, B>(this: Either<L, Promise<A> | A>, fn: Either<L, (a: A) => Promise<B>>): Promise<Either<L, B>>;
function asyncApply<A, B>(
  this: Either<L, Promise<A> | A> | Either<L, (a: A) => Promise<B>>,
  argOrFn: Either<L, Promise<A> | A> | Either<L, (a: A) => Promise<B>>
): Promise<Either<L, B>>;
```

- `this | fn` - function wrapped by Either, which should be applied to value `arg`
- `arg | this` - value which should be applied to `fn`
- Returns `Promise` with mapped by `fn` function value wrapped by `Either` if `Either` is `Right` otherwise `Left` with `L` value
  Example:

```typescript
const v1 = right<Error, number>(2);
const v2 = left<Error, number>(new Error());
const fn1 = right<Error, (a: number) => Promise<number>>((a: number) => Promise.resolve(a * 2));
const fn2 = left<Error, (a: number) => Promise<number>>(new Error());

const newVal1 = fn1.apply(v1); // Promise<Either<Error, number>.Right> with value 4
const newVal2 = fn1.apply(v2); // Promise<Either<Error, number>.Left> with value new Error()
const newVal3 = fn2.apply(v1); // Promise<Either<Error, number>.Left> with value new Error()
const newVal4 = fn2.apply(v2); // Promise<Either<Error, number>.Left> with value new Error()
```

#### `Either#chain`

```typescript
function chain<L, R, NewL, NewR>(fn: (val: R) => Either<NewL, NewR>): Either<L | newL, NewR>;
```

- Returns mapped by `fn` function value wrapped by `Either` if `Either` is `Right` and returned by `fn` value is `Right` too otherwise `Left`
  Example:

```typescript
const v1 = right<Error, number>(2);
const v2 = left<Error, number>(new Error());

// Either<Error | TypeError, string>.Right with value "2"
const newVal1 = v1.chain(a => right<TypeError, string>(a.toString()));
// Either<Error | TypeError, string>.Left with value new TypeError()
const newVal2 = v1.chain(a => left<TypeError, string>(new TypeError()));
// Either<Error | TypeError, string>.Left with value new Error()
const newVal3 = v2.chain(a => right<TypeError, string>(a.toString()));
// Either<Error | TypeError, string>.Left with value new Error()
const newVal4 = v2.chain(a => left<TypeError, string>(new TypeError()));
```

##### `Either#asyncChain`

```typescript
function chain<L, R, NewL, NewR>(fn: (val: R) => Promise<Either<NewL, NewR>>): Promise<Either<L | newL, NewR>>;
```

- Returns `Promise` with mapped by `fn` function value wrapped by `Either` if `Either` is `Right` and returned by `fn` value is `Right` too otherwise `Left`
  Example:

```typescript
const v1 = right<Error, number>(2);
const v2 = left<Error, number>(new Error());

// Promise<Either<Error | TypeError, string>.Right> with value "2"
const newVal1 = v1.asyncChain(a => right<TypeError, string>(a.toString()));
// Promise<Either<Error | TypeError, string>.Left> with value new TypeError()
const newVal2 = v1.asyncChain(a => left<TypeError, string>(new TypeError()));
// Promise<Either<Error | TypeError, string>.Left> with value new Error()
const newVal3 = v2.asyncChain(a => right<TypeError, string>(a.toString()));
// Promise<Either<Error | TypeError, string>.Left> with value new Error()
const newVal4 = v2.chain(a => left<TypeError, string>(new TypeError()));
```

##### `Either#fold`

```typescript
function fold<C>(mapLeft: (value: L) => C, mapRight: (value: R) => C): C;
```

- Returns values mapped by `mapRight` if `Either` is `Right`, otherwise value mapped by `mapLeft`
  Example:

```typescript
const v1 = right<Error, number>(2);
const v2 = left<Error, number>(new Error());

// 4
const newVal1 = v1.fold(() => 'fail', value => value * 2);
// "fail"
const newVal2 = v2.fold(() => 'fail', value => value * 2);
```

#### Helpers

```typescript
// Value from Either instance
const { value } = right<Error, number>(2); // number | Error
const { value } = right(2); // number
const { value } = left<Error, number>(new Error()); // number | Error
const { value } = left(new Error()); // Error
```

```typescript
right(2).unwrap(); // number
left(new TypeError()).unwrap(); // throws error

right(2).unwrap(); // number
left(new TypeError()).unwrap(x => x); // throws TypeError provied in arguments

left(2).unwrapOr(3) // returns 3
rigth(2).unwrapOr(3) // returns 2

left(2).unwrapOrElse(num => num * 2) // returns 4
right(2).unwrapOrElse(num => num * 2) // returns 2
```

## License

MIT (c) Artem Kobzar see LICENSE file.
