# @sweet-monads/interfaces

Collection of interfaces which describe functional programming abstractions.

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

> npm install @sweet-monads/interfaces

```typescript
import { Functor } from "@sweet-monads/interfaces";

class MyClass<T> implements Functor<T> {
  map<A>(fn: (i: T) => A): MyClass<A> {
    return new MyClass<A>();
  }
}
```

## Available Interfaces

- [`Functor`](#functor)
- [`AsyncFunctor`](#asyncfunctor)
- [`Alternative`](#alternative)
- [`Applicative`](#applicative)
- [`AsyncApplicative`](#asyncapplicative)
- [`Monad`](#monad)
- [`AsyncMonad`](#asyncmonad)
- [`AsyncChainable`](#asyncchainable)

### Functor

https://wiki.haskell.org/Functor

An abstract datatype `Functor<A>`, which has the ability for it's value(s) to be mapped over can become an instance of the Functor interface. That is to say, a new Functor, `Functor<B>` can be made from `Functor<A>` by transforming all of it's value(s), whilst leaving the structure of f itself unmodified.

Functors are required to obey certain laws in regards to their mapping. Ensuring instances of Functor obey these laws means the behaviour of fmap remains predictable.

Methods:

##### `Functor#map`

```typescript
function map<A, B>(f: (x: A) => B): Functor<B>;
```

#### Minimal Complete Definition

```typescript
map<A, B>(f: (x: A) => B): Functor<B>;
```

#### Functor Laws

##### Functors must preserve identity morphisms

```typescript
const f = new SomeFunctorImplementation(); // for all functors
const id = x => x;

expect(f.map(id)).toEqual(f);
```

##### Functors preserve composition of morphisms

```typescript
declare function twice(x: number): number; // for all functions
declare function toString(x: number): string; // for all functions

const f = new SomeFunctorImplementation<number>();

expect(f.map(x => toString(twice(x)))).toEqual(f.map(twice).map(toString));
```

### AsyncFunctor

Async version of [`Functor`](#functor), which provides async version of the [`map`](#functormap) method.

Methods:

##### `AsyncFunctor#asyncMap`

```typescript
function asyncMap<A, B>(f: (x: A) => Promise<B>): Promise<AsyncFunctor<B>>;
```

#### Minimal Complete Definition

[`Functor`](#functor) implementation.

```typescript
asyncMap<A, B>(f: (x: A) => Promise<B>): Promise<AsyncFunctor<B>>;
```

#### AsyncFunctor Laws
All the [`Functor Laws`](#functor-laws) should be applied to the async version, so:

##### AsyncFunctors must preserve identity morphisms
```typescript
const f = new SomeAsyncFunctorImplementation(); // for all functors
const id = x => Promise.resolve(x);

expect(await f.asyncMap(id)).toEqual(f);
```

##### AsyncFunctors preserve composition of morphisms

```typescript
declare function twice(x: number): Promise<number>; // for all functions
declare function toString(x: number): Promise<string>; // for all functions
Promise.resolve(toString(twice(x)))

const f = new SomeAsyncFunctorImplementation<number>();
expect(await f.asyncMap(x => twice(x).then(toString))).toEqual(await f.asyncMap(twice).then(f => f.asyncMap(toString)));
```


### Alternative

https://en.wikibooks.org/wiki/Haskell/Alternative_and_MonadPlus

Several classes (Applicative, Monad) have "monoidal" subclasses, intended to model computations that support "failure" and "choice" (in some appropriate sense).
The basic intuition is that `empty` represents some sort of "failure", and `or` represents a choice between alternatives. (However, this intuition does not fully capture the nuance possible; see the section on Laws below.) Of course, `or` should be associative and `empty` should be the identity element for it. Instances of Alternative must implement `empty` and `or`; some and many have default implementations but are included in the class since specialized implementations may be more efficient than the default.

Current implementation is not fully port of `Alternative` from Haskell, because we don't make the interface an child interface of [`Applicative`](#applicative) and dropped `empty` static member for ability to implement `Alternative` for classes like `Either`.

Methods:

##### `Alternative#or`

```typescript
function or<T>(arg: Alternative<T>): Alternative<T>;
```

### Applicative

https://wiki.haskell.org/Applicative_functor

This module describes a structure intermediate between a functor and a monad (technically, a strong lax monoidal functor). Compared with monads, this interface lacks the full power of the binding operation `chain`.

Methods:

##### `Applicative.from`

```typescript
function from<A>(x: A): Applicative<A>;
```

##### `Applicative#apply`

```typescript
function apply<A, B>(this: Applicative<(a: A) => B>, arg: Applicative<A>): Applicative<B>;
function apply<A, B>(this: Applicative<A>, fn: Applicative<(a: A) => B>): Applicative<B>;
```

#### Minimal Complete Definition

[`Functor`](#functor) implementation.

```typescript
static from<A>(x: A): Applicative<A>;
```

```typescript
apply<A, B>(this: Applicative<(a: A) => B>, arg: Applicative<A>): Applicative<B>;
apply<A, B>(this: Applicative<A>, fn: Applicative<(a: A) => B>): Applicative<B>;
```

#### Applicative Laws

##### Identity Law

```typescript
declare var x: Applicative<unknown>;
const id = x => x;

expect(SomeApplicative.from(id).apply(x)).toEqual(x);
```

##### Homomorphism Law

```typescript
declare var x: unknown;
declare var f: (x: unknown) => unknown;

expect(SomeApplicative.from(f).apply(x)).toEqual(SomeApplicative.from(f(x)));
```

### AsyncApplicative

Async version of [`Applicative`](#applicative), which provides async version of the [`apply`](#applicativeapply) method.

Methods:

##### `AsyncApplicative#asyncApply`

```typescript
function asyncApply<A, B>(this: AsyncApplicative<(a: A) => Promise<B>>, arg: AsyncApplicative<Promise<A> | A>): Promise<AsyncApplicative<B>>;
function asyncApply<A, B>(this: AsyncApplicative<Promise<A> | A>, fn: AsyncApplicative<(a: A) => Promise<B>>): Promise<AsyncApplicative<B>>;
```

#### Minimal Complete Definition

[`Applicative`](#applicative) implementation.

[`AsyncFunctor`](#asyncfunctor) implementation.

```typescript
asyncApply<A, B>(this: AsyncApplicative<(a: A) => Promise<B>>, arg: AsyncApplicative<Promise<A> | A>): Promise<AsyncApplicative<B>>;
asyncApply<A, B>(this: AsyncApplicative<Promise<A> | A>, fn: AsyncApplicative<(a: A) => Promise<B>>): Promise<AsyncApplicative<B>>;
```

#### AsyncApplicative Laws

All the [`Applicative Laws`](#applicative-laws) should be applied to the async version, so:

##### Identity Law

```typescript
declare var x: AsyncApplicative<unknown>;
const id = x => Promise.resolve(x);

expect(await SomeAsyncApplicative.from(id).asyncApply(x)).toEqual(x);
```

##### Homomorphism Law

```typescript
declare var x: unknown;
declare var f: (x: unknown) => Promise<unknown>;

expect(await SomeAsyncApplicative.from(f).asyncApply(x)).toEqual(SomeAsyncApplicative.from(await f(x)));
```

### Monad

https://wiki.haskell.org/Monad

Monads can be thought of as composable computation descriptions. The essence of monad is thus separation of composition timeline from the composed computation's execution timeline, as well as the ability of computation to implicitly carry extra data, as pertaining to the computation itself, in addition to its one (hence the name) output, that it will produce when run (or queried, or called upon). This lends monads to supplementing pure calculations with features like I/O, common environment, updatable state, etc.

Methods:

##### `Monad#chain`

```typescript
function chain<A, B>(f: (x: A) => Monad<B>): Monad<B>;
```

##### `Monad#join`

```typescript
function join<T>(this: Monad<Monad<T>>): Monad<T>;
```

#### Minimal Complete Definition

[`Applicative`](#applicative) implementation.

```typescript
chain<A, B>(f: (x: A) => Monad<B>): Monad<B>;
join<T>(this: Monad<Monad<T>>): Monad<T>;
```

#### Monad Laws

##### Left identity Law

```typescript
declare var x: unknown;
declare function f(x: unknown): Monad<unknown>;

expect(SomeMonad.from(x).chain(f)).toEqual(f(x));
```

##### Right identity Law

```typescript
declare var mx: Monad<unknown>;
declare function f(x: unknown): Monad<unknown>;

expect(mx.chain(SomeMonad.from)).toEqual(mx);
```

##### Associativity Law

```typescript
declare var mx: Monad<unknown>;
declare function f(x: unknown): Monad<unknown>;
declare function g(x: unknown): Monad<unknown>;

expect(mx.chain(x => f(x).chain(g))).toEqual(mx.chain(f).chain(g));
```

### AsyncMonad

Async version of [`Monad`](#monad), which provides async version of the [`chain`](#applicativeapply) method.

Methods:

##### `Monad#chain`

```typescript
function asyncChain<A, B>(f: (x: A) => Promise<AsyncMonad<B>>): Promise<AsyncMonad<B>>;
```

#### Minimal Complete Definition

[`Monad`](#monad) implementation.

[`AsyncApplicative`](#applicative) implementation.

```typescript
asyncChain<A, B>(f: (x: A) => Promise<AsyncMonad<B>>): Promise<Monad<B>>;
```

#### AsyncMonad Laws

All the [`Monad Laws`](#monad-laws) should be applied to the async version, so:

##### Left identity Law

```typescript
declare var x: unknown;
declare function f(x: unknown): Promise<AsyncMonad<unknown>>;

expect(await SomeAsyncMonad.from(x).asyncChain(f)).toEqual(await f(x));
```

##### Right identity Law

```typescript
declare var mx: AsyncMonad<unknown>;
declare function f(x: unknown): Promise<AsyncMonad<unknown>>;

expect(await mx.asyncChain(x => Promise.resolve(SomeAsyncMonad.from(x)))).toEqual(mx);
```

##### Associativity Law

```typescript
declare var ax: AsyncMonad<unknown>;
declare function f(x: unknown): Promise<AsyncMonad<unknown>>;
declare function g(x: unknown): Promise<AsyncMonad<unknown>>;

expect(await ax.asyncChain(x => f(x).then(fx => fx.asyncChain(g)))).toEqual(await ax.asyncChain(f).then(fx => fx.asyncChain(g)));
```


### AsyncChainable

Static interface which give an ability to use `AsyncMonad` more comfortable with `Promise`.

> Should be used with `ClassImplements` decorator

Methods:

##### `AsyncChainable<M>#chain`

```typescript
function chain<A, B>(f: (v: A) => Promise<M & AsyncMonad<B>>): (m: M & AsyncMonad<A>) => Promise<M & AsyncMonad<B>>;
```

#### Usage

```typescript
@ClassImplements<IdentityMonad<unknown>>
class IdentityMonad<T> extends AsyncMonad<T> { /*...*/ }

declare function getAsyncValue(): Promise<IdentityMonad<number>>
declare function sendToServer(value: number): Promise<IdentityMonad<void>>

const value = await getAsyncValue().then(chain(sendToServer));
```

### Container 

Is a value wrapper, that allows to get value (if state of the container is valid), or throws error if not.

Methods:

##### `Container#unwrap`

```typescript
const lucky = Math.random() > 0.5 ? just(":)") : none();

// Will either return ":)" or throw an error
lucky.unwrap();
```

## License

MIT (c) Artem Kobzar see LICENSE file.
