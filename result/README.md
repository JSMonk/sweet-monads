# @sweet-monads/result

[Result Monad](https://en.wikibooks.org/wiki/Haskell/Understanding_monads/Maybe), The Result monad represents some result in different staters - Initial, Pending, Success and Failure.

### This library belongs to _sweet-monads_ project

> **sweet-monads** — easy-to-use monads implementation with static types definition and separated packages.

- No dependencies, one small file
- Easily auditable TypeScript/JS code
- Check out all libraries:
  [either](https://github.com/JSMonk/sweet-monads/tree/master/either),  
  [iterator](https://github.com/JSMonk/sweet-monads/tree/master/iterator),
  [interfaces](https://github.com/JSMonk/sweet-monads/tree/master/interfaces),
  [maybe](https://github.com/JSMonk/sweet-monads/tree/master/maybe),  
  [result](https://github.com/JSMonk/sweet-monads/tree/master/result),

## Usage

> npm install @sweet-monads/result

```typescript
import { Result, success } from "@sweet-monads/result";

class UserNotFoundError extends Error {
  name: "UserNotFoundError";
}
type User = { email: string; password: string };

function getUser(id: number): Result<UserNotFoundError, User> {
  return success({ email: "test@gmail.com", password: "test" });
}
// Result<UserNotFoundError, string>
const user = getUser(1).map(({ email }) => email);
```

## API

- [`chain`](#chain)
- [`merge`](#merge)
- [`mergeInOne`](#mergeinone)
- [`mergeInMany`](#mergeinmany)
- [`initial`](#initial)
- [`pending`](#pending)
- [`failure`](#failure)
- [`success`](#success)
- [`from`](#from)
- [`fromMaybe`](#frommaybe)
- [`fromEither`](#fromeither)
- [`isResult`](#isresult)
- [`Result#isInitial`](#resultisinitial)
- [`Result#isPending`](#resultispending)
- [`Result#isFailure`](#resultisfailure)
- [`Result#isSuccess`](#resultissuccess)
- [`Result#or`](#resultor)
- [`Result#join`](#resultjoin)
- [`Result#map`](#resultmap)
- [`Result#mapSuccess`](#resultmapsuccess)
- [`Result#mapFailure`](#resultmapfailure)
- [`Result#asyncMap`](#resultasyncmap)
- [`Result#apply`](#resultapply)
- [`Result#asyncApply`](#resultasyncapply)
- [`Result#chain`](#resultchain)
- [`Result#asyncChain`](#resultasyncchain)
- [`Result#toEither`](#resulttoeither)
- [`Result#toMaybe`](#resulttomaybe)
- [`Result#toNullable`](#resulttonullable)
- [`Result#toUndefined`](#resulttoundefined)

#### `chain`

```typescript
function chain<F, S, NF, NS>(fn: (v: S) => Promise<Result<NF, NS>>): (m: Result<F, s>) => Promise<Result<F | NF, NS>>;
```

- `fn: (v: S) => Promise<Result<NF, NS>>` - function which should be applied asynchronously to `Result<F, S>` value
- Returns function with `Result<F, S>` argument and promisied `Result` with new error or mapped by `fn` value (could be used inside `Promise#then` function).

Example:

```typescript
const getValue = async () => success(1);
// Result<TypeError, number>
const result = await getValue()
  .then(chain(async v => success(v * 2)))
  .then(chain(async g => failure(new TypeError("Unexpected"))));
```

#### `merge`

Alias for [`mergeInOne`](#mergeinone)

```typescript
function merge<F1, S1>(values: [Result<F1, S1>]): Result<F1, [S1]>;
function merge<F1, S1, F2, S2>(values: [Result<F1, S1>, Result<F2, S2>]): Result<F1 | F2, [S1, S2]>;
function merge<F1, S1, F2, S2, F3, S3>(
  values: [Result<F1, S1>, Result<F2, S2>, Result<F3, S3>]
): Result<F1 | F2 | F3, [S1, S2, S3]>;
// ... until 10 elements
```

- `values: Array<Result<F, S>>` - Array of Result values which will be merged into Result of Array
- Returns `Result<F, Array<S>>` which will contain `Success<Array<S>>` if all of array elements was `Success<R>`, `Failure<F>`if all of array elements was `Failure<F>`, `Initial` if at least one `Initial`, otherwise `Pending`.

Example:

```typescript
const v1 = initial<TypeError, number>(); // Result<TypeError, number>.Initial
const v2 = pending<TypeError, number>(); // Result<TypeError, number>.Pending
const v3 = success<TypeError, number>(2); // Result<TypeError, number>.Success
const v4 = success<ReferenceError, string>("test"); // Result<ReferenceError, string>.Success
const v5 = failure<Error, boolean>(new Error()); // Result<Error, boolean>.Failure

const r1 = merge([v1, v2]); // Result<TypeError, [number, number]>.Initial
const r2 = merge([v2, v5]); // Result<TypeError | Error, [number, boolean]>.Pending
const r3 = merge([v3, v4]); // Result<TypeError | ReferenceError, [number, string]>.Success
const r4 = merge([v3, v4, v5]); // Result<TypeError | ReferenceError | Error, [number, string, boolean]>.Failure
```

#### `mergeInOne`

```typescript
function merge<F1, S1>(values: [Result<F1, S1>]): Result<F1, [S1]>;
function merge<F1, S1, F2, S2>(values: [Result<F1, S1>, Result<F2, S2>]): Result<F1 | F2, [S1, S2]>;
function merge<F1, S1, F2, S2, F3, S3>(
  values: [Result<F1, S1>, Result<F2, S2>, Result<F3, S3>]
): Result<F1 | F2 | F3, [S1, S2, S3]>;
// ... until 10 elements
```

- `values: Array<Result<F, S>>` - Array of Result values which will be merged into Result of Array
- Returns `Result<F, Array<S>>` which will contain `Success<Array<S>>` if all of array elements was `Success<R>`, `Failure<F>`if all of array elements was `Failure<F>`, `Initial` if at least one `Initial`, otherwise `Pending`.

Example:

```typescript
const v1 = initial<TypeError, number>(); // Result<TypeError, number>.Initial
const v2 = pending<TypeError, number>(); // Result<TypeError, number>.Pending
const v3 = success<TypeError, number>(2); // Result<TypeError, number>.Success
const v4 = success<ReferenceError, string>("test"); // Result<ReferenceError, string>.Success
const v5 = failure<Error, boolean>(new Error()); // Result<Error, boolean>.Failure

const r1 = merge([v1, v2]); // Result<TypeError, [number, number]>.Initial
const r2 = merge([v2, v5]); // Result<TypeError | Error, [number, boolean]>.Pending
const r3 = merge([v3, v4]); // Result<TypeError | ReferenceError, [number, string]>.Success
const r4 = merge([v3, v4, v5]); // Result<TypeError | ReferenceError | Error, [number, string, boolean]>.Failure
```
#### `mergeInMany`

```typescript
static mergeInMany<F1, S1>(values: [Result<F1, S1>]): Result<Array<F1>, [S1]>;
static mergeInMany<F1, S1, F2, S2>(values: [Result<F1, S1>, Result<F2, S2>]): Result<Array<F1 | F2>, [S1, S2]>;
static mergeInMany<F1, S1, F2, S2, F3, S3>(
  values: [Result<F1, S1>, Result<F2, S2>, Result<F3, S3>]
): Result<Array<F1 | F2 | F3>, [S1, S2, S3]>;
// ... until 10 elements
```

- `values: Array<Result<F, S>>` - Array of Result values which will be merged into Result of Array
- Returns `Result<Array<F>, Array<S>>` which will contain `Success<Array<S>>` if all of array elements was `Success<R>` otherwise array of all catched `Failure<F>` values.

Example:

```typescript
const v1 = success<TypeError, number>(2); // Result<TypeError, number>.Success
const v2 = failure<ReferenceError, string>("test"); // Result<ReferenceError, string>.Success
const v3 = failure<Error, boolean>(new Error()); // Result<Error, boolean>.Failure

merge([v1, v2]); // Result<Array<TypeError | ReferenceError>, [number, string]>.Success
merge([v1, v2, v3]); // Result<Array<TypeError | ReferenceError | Error>, [number, string, boolean]>.Failure
```

#### `initial`

```typescript
function initial<F, S>(): Result<F, S>;
```

- Returns `Result` with `Initial` state which does not contain value.

Example:

```typescript
const v1 = initial(); // Result<undefined, never>.Initial
const v2 = initial<Error, number>(); // Result<Error, number>.Initial
```

#### `pending`

```typescript
function pending<F, S>(): Result<F, S>;
```

- Returns `Result` with `Pending` state which does not contain value.

Example:

```typescript
const v1 = pending(); // Result<undefined, never>.Initial
const v2 = pending<Error, number>(); // Result<Error, number>.Initial
```

#### `failure`

```typescript
function failure<F, S>(value: F): Result<F, S>;
```

- Returns `Result` with `Failure` state which contain value with `F` type.

Example:

```typescript
const v1 = failure(new Error()); // Result<Error, never>.Failure
const v2 = failure<Error, number>(new Error()); // Result<Error, number>.Failure
```

#### `success`

```typescript
function success<F, S>(value: S): Result<F, S>;
```

- Returns `Result` with `Success` state which contain value with `S` type.

Example:

```typescript
const v1 = success(2); // Result<never, number>.Success
const v2 = success<Error, number>(2); // Result<Error, number>.Success
```

#### `from`

Alias for [`success`](#success)

```typescript
function from<S>(value: S): Result<never, S>;
```

- Returns `Result` with `Success` state which contain value with `S` type.

Example:

```typescript
from(2); // Result<never, number>.Success
```

#### `fromMaybe`

```typescript
function fromMaybe<never, S>(value: Maybe<S>): Result<never, S>;
```

- Creates `Result` from `Maybe` in `Initial` or `Success` state.

Example:

```typescript
fromMaybe(just(2)); // Result<never, number>.Success
fromMaybe(none()); // Result<never, number>.Initial
```

#### `fromEither`

```typescript
function fromEither<F, S>(value: Either<F, S>): Result<F, S>;
```

- Creates `Result` from `Either` in `Failure` or `Success` state.

Example:

```typescript
fromEither(right<string, number>(10)); // Result<string, number>.Success
```

#### `isResult`

```typescript
function isResult<F, S>(value: unknown | Result<F, S>): value is Result<L, R>;
```

- Returns `boolean` if given `value` is instance of Result constructor.

Example:

```typescript
const value: unknown = 2;
if (isResult(value)) {
  // ... value is Result<unknown, unknown> at this block
}
```

#### `Result#isInitial`

```typescript
function isInitial(): boolean;
```

- Returns `true` if state of `Result` is `Initial` otherwise `false`

Example:

```typescript
const v1 = success(2);
const v2 = failure(2);
const v3 = initial();

v1.isInitial(); // false
v2.isInitial(); // false
v3.isInitial(); // true
```

#### `Result#isPending`

```typescript
function isPending(): boolean;
```

- Returns `true` if state of `Result` is `Pending` otherwise `false`

Example:

```typescript
const v1 = success(2);
const v2 = failure(2);
const v3 = pending();

v1.isPending(); // false
v2.isPending(); // false
v3.isPending(); // true
```

#### `Result#isFailure`

```typescript
function isFailure(): boolean;
```

- Returns `true` if state of `Result` is `Failure` otherwise `false`

Example:

```typescript
const v1 = success(2);
const v2 = failure(2);

v1.isFailure(); // false
v2.isFailure(); // true
```

#### `Result#isSuccess`

```typescript
function isSuccess(): boolean;
```

- Returns `true` if state of `Result` is `Success` otherwise `false`

Example:

```typescript
const v1 = success(2);
const v2 = failure(2);

v1.isSuccess(); // true
v2.isSuccess(); // false
```

#### `Result#or`

```typescript
function or<F, S>(x: Result<F, S>): Result<F, S>;
```

- Returns `Result<F, S>`. If state of `this` is `Success` then `this` will be returned otherwise `x` argument will be returned

Example:

```typescript
const v1 = success<string, number>(2);
const v2 = failure<string, number>("Error 1");
const v3 = failure<string, number>("Error 2");
const v4 = success<string, number>(3);
const v5 = initial();

v1.or(v2); // v1 will be returned
v2.or(v1); // v1 will be returned
v2.or(v3); // v3 will be returned
v1.or(v4); // v1 will be returned
v5.or(v1); // v1 will be returned

v2.or(v3).or(v1); // v1 will be returned
v2.or(v1).or(v3); // v1 will be returned
v1.or(v2).or(v3); // v1 will be returned
v2.or(v5).or(v3); // v3 will be returned
```

#### `Result#join`

```typescript
function join<L1, L2, R>(this: Result<L1, Result<L2, R>>): Result<L1 | L2, R>;
```

- `this: Result<F1, Result<F2, S>>` - `Result` instance which contains other `Result` instance as `Success` value.
- Returns unwrapped `Result` - if current `Result` has `Success` state and inner `Result` has `Success` state then returns inner `Result` `Success`, if inner `Result` has `Failure` state then return inner `Result` `Failure` otherwise outer `Result` `Failure`.

Example:

```typescript
const v1 = success(success(2));
const v2 = success(failure(new Error()));
const v3 = failure<TypeError, Result<Error, number>>(new TypeError());

v1.join(); // Result.Success with value 2
v2.join(); // Result.Failure with value new Error
v3.join(); // Result.Failure with value new TypeError
```

#### `Result#map`

Alias for [`Result#mapSuccess`](#resultmapsuccess)

```typescript
function map<F, S, NewS>(fn: (val: S) => NewS): Result<F, NewS>;
```

- Returns mapped by `fn` function value wrapped by `Result` if `Result` is `Success` otherwise `Result` with current value

Example:

```typescript
const v1 = success<Error, number>(2);
const v2 = failure<Error, number>(new Error());

const newVal1 = v1.map(a => a.toString()); // Result<Error, string>.Success with value "2"
const newVal2 = v2.map(a => a.toString()); // Result<Error, string>.Failure with value new Error()
```

#### `Result#mapSuccess`

```typescript
function mapSuccess<F, S, NewS>(fn: (val: S) => NewS): Result<F, NewS>;
```

- Returns mapped by `fn` function value wrapped by `Result` if `Result` is `Success` otherwise `Result` with current value

Example:

```typescript
const v1 = success<Error, number>(2);
const v2 = failure<Error, number>(new Error());

const newVal1 = v1.mapSuccess(a => a.toString()); // Result<Error, string>.Success with value "2"
const newVal2 = v2.mapSuccess(a => a.toString()); // Result<Error, string>.Failure with value new Error()
```

#### `Result#mapLeft`

```typescript
function mapFailure<F, S, NewF>(fn: (val: F) => NewF): Result<NewF, S>;
```

- Returns mapped by `fn` function value wrapped by `Result` if `Result` is `Failure` otherwise `Result` with current value

Example:

```typescript
const v1 = success<Error, number>(2);
const v2 = failure<Error, number>(new Error());

const newVal1 = v1.mapFailure(a => a.toString()); // Result<string, number>.Right with value 2
const newVal2 = v2.mapFailure(a => a.toString()); // Result<string, number>.Left with value "Error"
```

##### `Result#asyncMap`

```typescript
function asyncMap<F, S, NewS>(fn: (val: S) => Promise<NewS>): Promise<Result<F, NewS>>;
```

- Returns `Promise` with mapped by `fn` function value wrapped by `Result` if `Result` is `Success` otherwise `Result` with current value

Example:

```typescript
const v1 = success<Error, number>(2);
const v2 = failure<Error, number>(new Error());

// Promise<Result<Error, string>.Success> with value "2"
const newVal1 = v1.asyncMap(a => Promise.resolve(a.toString()));
// Promise<Result<Error, string>.Failure> with value new Error()
const newVal2 = v2.asyncMap(a => Promise.resolve(a.toString()));
```

##### `Result#apply`

```typescript
function apply<A, B>(this: Result<L, (a: A) => B>, arg: Result<L, A>): Result<L, B>;
function apply<A, B>(this: Result<L, A>, fn: Result<L, (a: A) => B>): Result<L, B>;
```

- `this | fn` - function wrapped by Result, which should be applied to value `arg`
- `arg | this` - value which should be applied to `fn`
- Returns mapped by `fn` function value wrapped by `Result` if `Result` is `Success` otherwise `Result` with current value

Example:

```typescript
const v1 = success<Error, number>(2);
const v2 = failure<Error, number>(new Error());
const fn1 = success<Error, (a: number) => number>((a: number) => a * 2);
const fn2 = failure<Error, (a: number) => number>(new Error());

const newVal1 = fn1.apply(v1); // Result<Error, number>.Right with value 4
const newVal2 = fn1.apply(v2); // Result<Error, number>.Left with value new Error()
const newVal3 = fn2.apply(v1); // Result<Error, number>.Left with value new Error()
const newVal4 = fn2.apply(v2); // Result<Error, number>.Left with value new Error()
```

##### `Result#asyncApply`

Async variant of [`Result#apply`](#resultapply)

```typescript
asyncApply<A, B>(
  this: Result<F, (a: Promise<A> | A) => Promise<B>>,
  arg: Result<F, Promise<A>>): Promise<Result<F, B>>;
asyncApply<A, B>(
  this: Result<F, Promise<A>>,
  fn: Result<F, Promise<(a: Promise<A> | A) => B>>): Promise<Result<F, B>>;
asyncApply<A, B>(
  this: Result<F, Promise<A>> | Result<F, (a: Promise<A> | A) => Promise<B>>,
  argOrFn: Result<F, Promise<A>> | Result<F, (a: Promise<A> | A) => Promise<B>>): Promise<Result<F, B>>
```

- `this | fn` - function wrapped by Result, which should be applied to value `arg`
- `arg | this` - value which should be applied to `fn`
- Returns `Promise` with mapped by `fn` function value wrapped by `Result` if `Result` is `Success` otherwise `Result` with current value

Example:

```typescript
const v1 = success<Error, number>(2);
const v2 = failure<Error, number>(new Error());
const fn1 = success<Error, (a: number) => Promise<number>>((a: number) => Promise.resolve(a * 2));
const fn2 = failure<Error, (a: number) => Promise<number>>(new Error());

const newVal1 = fn1.asyncApply(v1); // Promise<Either<Error, number>.Right> with value 4
const newVal2 = fn1.asyncApply(v2); // Promise<Either<Error, number>.Left> with value new Error()
const newVal3 = fn2.asyncApply(v1); // Promise<Either<Error, number>.Left> with value new Error()
const newVal4 = fn2.asyncApply(v2); // Promise<Either<Error, number>.Left> with value new Error()
```

#### `Result#chain`

```typescript
function chain<F, S, NewF, NewS>(fn: (val: S) => Either<NewF, NewS>): Either<F | NewF, NewS>;
```

- Returns mapped by `fn` function value wrapped by `Result` if `Result` is `Success` and returned by `fn` value is `Success` too otherwise `Result` in other state, `Initial` pwns `Pending` and `Failure`.

Example:

```typescript
const v1 = success<Error, number>(2);
const v2 = failure<Error, number>(new Error());
const v3 = initial<Error, number>();

// Result<Error | TypeError, string>.Success with value "2"
const newVal1 = v1.chain(a => success<TypeError, string>(a.toString()));
// Result<Error | TypeError, string>.Failure with value new TypeError()
const newVal2 = v1.chain(a => failure<TypeError, string>(new TypeError()));
// Result<Error | TypeError, string>.Failure with value new Error()
const newVal3 = v2.chain(a => success<TypeError, string>(a.toString()));
// Result<Error | TypeError, string>.Failure with value new Error()
const newVal4 = v2.chain(a => failure<TypeError, string>(new TypeError()));
// Result<Error | TypeError, string>.Initial with no value
const newVal5 = v3.chain(a => failure<TypeError, string>(new TypeError()));
```

##### `Result#asyncChain`

```typescript
function asyncChain<F, S, NewF, NewS>(fn: (val: S) => Promise<Result<NewF, NewS>>): Promise<Result<F | NewF, NewS>>;
```

- Returns `Promise` with mapped by `fn` function value wrapped by `Result` if `Result` is `Success` and returned by `fn` value is `Success` too otherwise `Result` in other state, `Initial` pwns `Pending` and `Failure`.

Example:

```typescript
const v1 = success<Error, number>(2);
const v2 = failure<Error, number>(new Error());
const v3 = initial<Error, number>();

// Promise<Result<Error | TypeError, string>.Success> with value "2"
const newVal1 = v1.asyncChain(a => Promise.resolve(right<TypeError, string>(a.toString())));
// Promise<Result<Error | TypeError, string>.Failure> with value new TypeError()
const newVal2 = v1.asyncChain(a => Promise.resolve(left<TypeError, string>(new TypeError()));
// Promise<Result<Error | TypeError, string>.Failure> with value new Error()
const newVal3 = v2.asyncChain(a => Promise.resolve(right<TypeError, string>(a.toString())));
// Promise<Result<Error | TypeError, string>.Failure> with value new Error()
const newVal4 = v2.asyncChain(a => Promise.resolve(left<TypeError, string>(new TypeError())));
// Promise<Result<Error | TypeError, string>.Initial> with no value
const newVal5 = v3.asyncChain(a => Promise.resolve(failure<TypeError, string>(new TypeError())));
```

#### `Result#toEither`

```typescript
function toEither<F, S>(onInitial: () => F, onPending: () => F): Either<F, S>;
```

- Converts `Result` into `Either` in `Left` or `Success` state with fallbacks for `Initial` and `Pending` states.

Example:

```typescript
success<string, number>(10).toEither(
  () => "initial state",
  () => "pending state"
); // Either<string, number>.Right
```

#### `Result#toMaybe`

```typescript
function toMaybe<S>(): Maybe<S>;
```

- Converts `Result` into `Maybe` in `Just` state if `Result` is in `Success` state or to `Maybe` in `None` state otherwise.

Example:

```typescript
success<string, number>(10).toMaybe(); // Maybe<number>.Just
```

#### `Result#toNullable`

```typescript
function toNullable<S>(): S | null;
```

- Returns S if `Result` is in `Success` state and null otherwise

Example:

```typescript
success<string, number>(10).toNullable(); // number | null
```

#### `Result#toUndefined`

```typescript
function toUndefined<S>(): S | undefined;
```

- Returns S if `Result` is in `Success` state and undefined otherwise

Example:

```typescript
success<string, number>(10).toUndefined(); // number | undefined
```

## License

MIT (c) Artem Kobzar see LICENSE file.
