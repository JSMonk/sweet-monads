# @sweet-monads/either

Package for better developer experience with `Promise` and [`@sweet-monad/interfaces/Monad`](https://github.com/JSMonk/sweet-monads/tree/master/interfaces#monad)

### This library belongs to *sweet-monads* project

> **sweet-monads** — easy-to-use monads implementation with static types definition and separated packages.

- No dependencies, one small file
- Easily auditable TypeScript/JS code
- Check out all libraries:
  [maybe](https://github.com/JSMonk/sweet-monads/tree/master/maybe),
  [iterator](https://github.com/JSMonk/sweet-monads/tree/master/iterator),
  [interfaces](https://github.com/JSMonk/sweet-monads/tree/master/interfaces),

## Usage

> npm install @sweet-monads/async

```typescript
import { chain } from "@sweet-monads/async";
import { right } from "@sweet-monads/either";

const fn = () =>
  Promise.resolve(right("Hello, Sweet Monad."))
    .then(chain(doSomethingAsync))
    .then(chain(doOneMoreAsyncThing));
```

## API

- [`chain`](#chain)

#### `chain`
```typescript
  chain<T, R>(fn: (v: T) => Promise<Monad<R>>): (m: Monad<T>) => Promise<Monad<R>>;
```
- `f: (v: T) => Promise<Monad<R>>` - async function which convert a Monad to another one.
- Returns `Promise` with mapped by `fn` function value wrapped by `Monad` by the `Monad` implementation rule.

Example:
```typescript
declare function getUser(email: string): Promise<Either<UserNotFoundError, User>>;
declare function arePasswordsMatched(password: string, user: User): Promise<Either<WrongCredentialsError, boolean>>;

// result is Promise<Either<UserNotFoundError | WrongCredentialsError, boolean>>
const result = getUser("some@email.com")
  .then(chain(user => arePasswordsMatched("some password", user.password)));
```

## License

MIT (c) Artem Kobzar see LICENSE file.
