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

#### `chain`

```typescript
function chain<L, R, NL, NR>(fn: (v: R) => Promise<Result<NL, NR>>): (m: Result<L, R>) => Promise<Result<L | NL, NR>>;
```

- `fn: (v: R) => Promise<Result<NL, NR>>` - function which should be applied asynchronously to `Result<L, R>` value
- Returns function with `Result<L, R>` argument and promisied `Result` with new error or mapped by `fn` value (could be used inside `Promise#then` function).

Example:

```typescript
const getValue = async () => success(1);

// Result<TypeError, success>
const result = await getValue()
  .then(Result.chain(async v => success(v * 2)))
  .then(Result.chain(async v => failure(new TypeError("Unexpected"))));
```

#### `merge`

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
const v1 = success<TypeError, number>(2); // Result<TypeError, number>.Success
const v2 = success<ReferenceError, string>("test"); // Result<ReferenceError, string>.Success
const v3 = failure<Error, boolean>(new Error()); // Result<Error, boolean>.Failure

merge([v1, v2]); // Result<TypeError | ReferenceError, [number, string]>.Success
merge([v1, v2, v3]); // Result<TypeError | ReferenceError | Error, [number, string, boolean]>.Failure
```

## License

MIT (c) Artem Kobzar see LICENSE file.
