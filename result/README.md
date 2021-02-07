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
- [`mergeInMany`](#mergeinmany) TODO
- [`initial`](#initial)
- [`pending`](#pending)
- [`failure`](#failure)
- [`success`](#success)
- [`from`](#from)
- [`isResult`](#isresult)

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

#### `isResult`

```typescript
function isResult<F, S>(value: unknown | Result<F, S>): value is Result<L, R>;
``` 
- Returns `boolean` if given `value` is instance of Result constructor.
Example:
```typescript
const value: unknown = 2;
if  (isResult(value)) {
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

v1.isInitial() // false
v2.isInitial() // false
v3.isInitial() // true
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

v1.isPending() // false
v2.isPending() // false
v3.isPending() // true
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

v1.isFailure() // false
v2.isFailure() // true
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

v1.isSuccess() // true
v2.isSuccess() // false
```

## License

MIT (c) Artem Kobzar see LICENSE file.
