# @sweet-monads/either


[Either Monad](https://hackage.haskell.org/package/category-extras-0.52.0/docs/Control-Monad-Either.html), The Either monad represents values with two possibilities: a value of type Either a b is either Left a or Right b.

### This library belongs to *sweet-monads* project

> **sweet-monads** — easy-to-use monads implementation with static types definition and separated packages.

- No dependencies, one small file
- Easily auditable TypeScript/JS code
- Check out all libraries:
  [maybe](https://github.com/JSMonk/sweet-monads/tree/master/maybe),
  [iterator](https://github.com/JSMonk/sweet-monads/tree/master/iterator),
  [interfaces](https://github.com/JSMonk/sweet-monads/tree/master/interfaces),

## Usage

> npm install @sweet-monads/either

```typescript
import Either from "@sweet-monads/either";

class UserNotFoundError extends Error { name: "UserNotFoundError" };
type User = { email: string, password: string };

function getUser(id: number): Either<UserNotFoundError, User> {
  return Either.right({ email: "test@gmail.com", password: "test" });
}

// Either<UserNotFoundError, string>
const user = getUser(1).map(({ email }) => email);
```

## API

- [`Either.merge`](#eithermerge)
- [`Either.left`](#eitherleft)
- [`Either.right`](#eitherright)
- [`Either.from`](#eitherfrom)
- [`Either#isLeft`](#eitherisleft)
- [`Either#isRight`](#eitherisright)
- [`Either#join`](#eitherjoin)
- [`Either#map`](#eithermap)
- [`Either#mapRight`](#eithermapright)
- [`Either#mapLeft`](#eithermapleft)
- [`Either#asyncMap`](#eitherasyncmap)
- [`Either#apply`](#eitherapply)
- [`Either#asyncApply`](#eitherasyncapply)
- [`Either#chain`](#eitherchain)
- [`Either#asyncChain`](#eitherasyncchain)
- [Helpers](#helpers)

#### `Either.merge`
```typescript
  function merge<L1, R1>(values: [Either<L1, R1>]): Either<L1, [R1]>;
  function merge<L1, R1, L2, R2>(values: [Either<L1, R1>, Either<L2, R2>]): Either<L1 | L2, [R1, R2]>;
  function merge<L1, R1, L2, R2, L3, R3>(values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>]): Either<L1 | L2 | L3, [R1, R2, R3]>;
// ... until 10 elements
```
- `values: Array<Either<L, R>>` - Array of Either values which will be merged into Either of Array 
- Returns `Either<L, Array<R>>` which will contain `Right<Array<R>>` if all of array elements was `Right<R>` otherwise `Left<L>`. 

Example:
```typescript
const v1 = Either.right<TypeError, number>(2); // Either<TypeError, number>.Right
const v2 = Either.right<ReferenceError, string>("test"); // Either<ReferenceError, string>.Right
const v3 = Either.left<Error, boolean>(new Error()); // Either<Error, boolean>.Left

Either.merge([v1, v2]) // Either<TypeError | ReferenceError, [number, string]>.Right
Either.merge([v1, v2, v3]) // Either<TypeError | ReferenceError | Error, [number, string, boolean]>.Left
```

#### `Either.left`
```typescript
function left<L, R>(value: L): Either<L, R>;
```
- Returns `Either` with `Left` state which contain value with `L` type.
Example:
```typescript
const v2 = Either.left(new Error()); // Either<Error, unknown>.Left
const v2 = Either.left<Error, number>(new Error()); // Either<Error, number>.Left
```

#### `Either.right`
```typescript
function right<L, R>(value: R): Either<L, R>;
```
- Returns `Either` with `Right` state which contain value with `R` type.
Example:
```typescript
const v2 = Either.right(2); // Either<unknown, number>.Right
const v2 = Either.right<Error, number>(2); // Either<Error, number>.Right
```

#### `Either.from`

Return only `Right` typed value.

```typescript
function from<R>(value: R): Either<unknown, R>;
```
- Returns `Either` with `Right` state which contain value with `R` type.
Example:
```typescript
Either.from(2); // Either<unknown, number>.Right
```

#### `Either#isLeft`
```typescript
function isLeft(): boolean;
```
- Returns `true` if state of `Either` is `Left` otherwise `false`
Example:
```typescript
const v1 = Either.right(2);
const v2 = Either.left(2);

v1.isLeft() // false
v2.isLeft() // true
```

#### `Either#isRight`
```typescript
function isRight(): boolean;
```
- Returns `true` if state of `Either` is `Right` otherwise `false`
Example:
```typescript
const v1 = Either.right(2);
const v2 = Either.left(2);

v1.isRight() // true
v2.isRight() // false
```

#### `Either#join`
```typescript
function join<L1, L2, R>(this: Either<L1, Either<L2, R>>): Either<L1 | L2, R>;
```
- `this: Either<L1, Either<L2, R>>` - `Either` instance which contains other `Either` instance as `Right` value.
- Returns unwrapped `Either` - if current `Either` has `Right` state and inner `Either` has `Right` state then returns inner `Either` `Right`, if inner `Either` has `Left` state then return inner `Either` `Left` otherwise outer `Either` `Left`.
Example:
```typescript
const v1 = Either.right(Either.right(2));
const v2 = Either.right(Either.left(new Error()));
const v3 = Either.left<TypeError, Either<Error, number>>(new TypeError());

v1.join() // Either.Right with value 2
v2.join() // Either.Left with value new Error 
v3.join() // Either.Left with value new TypeError 
```

#### `Either#map`
```typescript
function map<L, R, NewR>(fn: (val: R) => NewR): Either<L, NewR>;
```
- Returns mapped by `fn` function value wrapped by `Either` if `Either` is `Right` otherwise `Left` with `L` value
Example:
```typescript
const v1 = Either.right<Error, number>(2);
const v2 = Either.left<Error, number>(new Error());

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
const v1 = Either.right<Error, number>(2);
const v2 = Either.left<Error, number>(new Error());

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
const v1 = Either.right<Error, number>(2);
const v2 = Either.left<Error, number>(new Error());

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
const v1 = Either.right<Error, number>(2);
const v2 = Either.left<Error, number>(new Error());

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
const v1 = Either.right<Error, number>(2);
const v2 = Either.left<Error, number>(new Error());
const fn1 = Either.right<Error, (a: number) => number>((a: number) => a * 2);
const fn2 = Either.left<Error, (a: number) => number>(new Error());

const newVal1 = fn1.apply(v1); // Either<Error, number>.Right with value 4 
const newVal2 = fn1.apply(v2); // Either<Error, number>.Left with value new Error()
const newVal3 = fn2.apply(v1); // Either<Error, number>.Left with value new Error()
const newVal4 = fn2.apply(v2); // Either<Error, number>.Left with value new Error()
```

##### `Either#asyncApply`

Async variant of [`Either#apply`](#eitherapply)

```typescript
function asyncApply<A, B>(this: Maybe<(a: Promise<A> | A) => Promise<B>>, arg: Maybe<Promise<A> | A>): Promise<Maybe<B>>;
function asyncApply<A, B>(this: Maybe<Promise<A> | A>, fn: Maybe<(a: Promise<A> | A) => Promise<B>>): Promise<Maybe<B>>;
```
- `this | fn` - function wrapped by Maybe, which should be applied to value `arg`
- `arg | this` - value which should be applied to `fn`
- Returns `Promise` with mapped by `fn` function value wrapped by `Either` if `Either` is `Right` otherwise `Left` with `L` value
Example:
```typescript
const v1 = Either.right<Error, number>(2);
const v2 = Either.left<Error, number>(new Error());
const fn1 = Either.right<Error, (a: number) => Promise<number>>((a: number) => Promise.resolve(a * 2));
const fn2 = Either.left<Error, (a: number) => Promise<number>>(new Error());

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
const v1 = Either.right<Error, number>(2);
const v2 = Either.left<Error, number>(new Error());

// Either<Error | TypeError, string>.Right with value "2"
const newVal1 = v1.chain(a => Either.right<TypeError, string>(a.toString()));
// Either<Error | TypeError, string>.Left with value new TypeError()
const newVal2 = v1.chain(a => Either.left<TypeError, string>(new TypeError()));
// Either<Error | TypeError, string>.Left with value new Error()
const newVal3 = v2.chain(a => Either.right<TypeError, string>(a.toString()));
// Either<Error | TypeError, string>.Left with value new Error()
const newVal4 = v2.chain(a => Either.left<TypeError, string>(new TypeError()));
```

##### `Either#asyncChain`
```typescript
function chain<L, R, NewL, NewR>(fn: (val: R) => Promise<Either<NewL, NewR>>): Promise<Either<L | newL, NewR>>;
```
- Returns `Promise` with mapped by `fn` function value wrapped by `Either` if `Either` is `Right` and returned by `fn` value is `Right` too otherwise `Left`
Example:
```typescript
const v1 = Either.right<Error, number>(2);
const v2 = Either.left<Error, number>(new Error());

// Promise<Either<Error | TypeError, string>.Right> with value "2"
const newVal1 = v1.chain(a => Either.right<TypeError, string>(a.toString()));
// Promise<Either<Error | TypeError, string>.Left> with value new TypeError()
const newVal2 = v1.chain(a => Either.left<TypeError, string>(new TypeError()));
// Promise<Either<Error | TypeError, string>.Left> with value new Error()
const newVal3 = v2.chain(a => Either.right<TypeError, string>(a.toString()));
// Promise<Either<Error | TypeError, string>.Left> with value new Error()
const newVal4 = v2.chain(a => Either.left<TypeError, string>(new TypeError()));
```

#### Helpers

```typescript
// Value from Either instance
const { value } = Either.right<Error, number>(2); // number | Error
const { value } = Either.right(2); // any
const { value } = Either.left<Error, number>(new Error()); // number | Error
const { value } = Either.left(2); // any
```

## License

MIT (c) Artem Kobzar see LICENSE file.
