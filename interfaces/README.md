# @sweet-monads/interfaces

Collection of interfaces which describe functional programming abstractions.

### This library belongs to *sweet-monads* project

> **sweet-monads** — easy-to-use monads implementation with static types definition and separated packages.

- No dependencies, one small file
- Easily auditable TypeScript/JS code
- Check out all libraries:
  [maybe](https://github.com/JSMonk/sweet-monads/tree/master/either),
  [either](https://github.com/JSMonk/sweet-monads/tree/master/either),
  [iterator](https://github.com/JSMonk/sweet-monads/tree/master/iterator),

## Usage

> npm install @sweet-monads/interfaces

```typescript
import { Functor } from "@sweet-monads/interfaces";

class Container<T> implements Functor<T> {
  map<A>(fn: (i: T) => A): Container<T> {
    return new Container<T>();
  }
}
```

## Available Interfaces

- [`Functor`](#functor)
- [`Applicative`](#applicative)
- [`Monad`](#monad)


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

expect( f.map(id) ).toEqual( f );
```

##### Functors preserve composition of morphisms

```typescript
declare function twice(x: number): number; // for all functions
declare function toString(x: number): string; // for all functions

const f = new SomeFunctorImplementation<number>();

expect( f.map(x => toString(twice(x))) ).toEqual( f.map(twice).map(toString) );
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

In development

#### Minimal Complete Definition

[`Functor`](#functor) implementation.

```typescript
static from<A>(x: A): Applicative<A>;
```

#### Applicative Laws

##### Identity Law

```typescript
declare var x: Applicative<unknown>;
const id = x => x;

expect( SomeApplicative.from(id).apply(x) ).toEqual( x );
```

##### Homomorphism Law

```typescript
declare var x: unknown;
declare var f: (x: unknown) => unknown;

expect( SomeApplicative.from(f).apply(x) ).toEqual( SomeApplicative.from(f(x)) );
```

### Monad

https://wiki.haskell.org/Monad

Monads can be thought of as composable computation descriptions. The essence of monad is thus separation of composition timeline from the composed computation's execution timeline, as well as the ability of computation to implicitly carry extra data, as pertaining to the computation itself, in addition to its one (hence the name) output, that it will produce when run (or queried, or called upon). This lends monads to supplementing pure calculations with features like I/O, common environment, updatable state, etc.

Methods:

##### `Monad#chain`
```typescript
function chain<A, B>(f: (x: A) => Monad<B>): Monad<B>;
```

#### Minimal Complete Definition

[`Applicative`](#applicative) implementation.

```typescript
chain<A, B>(f: (x: A) => Monad<B>): Monad<B>;
```

#### Monad Laws

##### Left identity Law

```typescript
declare var x: unknown;
declare function f(x: unknown): Monad<unknown>;

expect( SomeMonad.from(x).chain(f) ).toEqual( f(x) );
```

##### Right identity Law

```typescript
declare var mx: Monad<unknown>;
declare function f(x: unknown): Monad<unknown>;

expect( mx.chain(SomeMonad.from) ).toEqual( mx );
```

##### Associativity Law

```typescript
declare var mx: Monad<unknown>;
declare function f(x: unknown): Monad<unknown>;
declare function g(x: unknown): Monad<unknown>;

expect( mx.chain(x => f(x).chain(g)) ).toEqual( mx.chain(f).chain(g) );
```

## License

MIT (c) Artem Kobzar see LICENSE file.
