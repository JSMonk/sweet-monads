# @sweet-monads/identity

[Identity Monad](https://blog.ploeh.dk/2022/05/16/the-identity-monad/), The Identity monad is a monad that does not embody any computational strategy. It simply applies the bound function to its input without any modification.


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

> npm install @sweet-monads/identity

```typescript
// Before
app.use(
  express.static(
    path.resolve(getDirname(import.meta.url), "../public")
  )
)


// After
Identity.from(import.meta.url)
    .map(getDirname)
    .map(dir => path.resolve(dir, "../public"))
    .map(express.static)
    .map(app.use);
```

## API

- [`chain`](#chain)
- [`from`](#from)
- [`isIdentity`](#isidentity)
- [`Identity#join`](#identityjoin)
- [`Identity#map`](#identitymap)
- [`Identity#asyncMap`](#identityasyncmap)
- [`Identity#apply`](#identityapply)
- [`Identity#asyncApply`](#identityasyncapply)
- [`Identity#chain`](#identitychain)
- [`Identity#asyncChain`](#identityasyncchain)
- [Helpers](#helpers)

#### `chain`

```typescript
function chain<A, B>(fn: (v: A) => Promise<Identity<B>>): (m: Identity<A>) => Promise<Identity<B>>;
```

- `fn: (v: A) => Promise<Identity<B>>` - function which should be applied asynchronously to `Identity<A>` value
- Returns function with `Identity<A>` argument and mapped by `fn` value (could be used inside `Promise#then` function).

Example:

```typescript
const getValue = async () => from(1);

// Identity<number>
const result = await getValue()
  .then(Identity.chain(async v => from(v * 2)))
  .then(Identity.chain(async () => from(null)));
```

#### `from`

```typescript
function from<T>(value: T): Identity<T>;
```

- Returns `Identity` which contains value with `T` type.
  Example:

```typescript
const v1 = from(2); // Identity<number>
const v2 = from<2>(2); // Identity<2>
```


#### `isIdentity`

```typescript
function isIdentity<T>(value: unknown | Identity<T>): value is Identity<T>;
```

- Returns `boolean` if given `value` is instance of Identity constructor.
  Example:

```typescript
const value: unknown = 2;
if (isIdentity(value)) {
  // ... value is Identity<unknown> at this block
}
```


#### `Identity#join`

```typescript
function join<V>(this: Identity<Identity<V>>): Identity<V>;
```

- `this: Identity<Identity<V>>` - `Identity` instance which contains another `Identity` instance.
- Returns unwrapped (inner) `Identity`.
  Example:

```typescript
const v = from(from(2));

v1.join(); // Identity with value 2
```

#### `Identity#map`

```typescript
function map<Val, NewVal>(fn: (val: Val) => NewVal): Identity<NewVal>;
```

- Returns mapped by `fn` function value wrapped with `Identity`.
  Example:

```typescript
const v = just(2);

const newVal = v.map(a => a.toString()); // Identity<string> with value "2"
```

##### `Identity#asyncMap`

```typescript
function asyncMap<Val, NewVal>(fn: (val: Val) => Promise<NewVal>): Promise<Identity<NewVal>>;
```

- Returns `Promise` with mapped by `fn` function value wrapped with `Identity`
  Example:

```typescript
const v = from(2);

// Promise<Identity<string>> with value "2"
const newVal = v.asyncMap(a => Promise.resolve(a.toString()));
```

##### `Identity#apply`

```typescript
function apply<A, B>(this: Identity<(a: A) => B>, arg: Identity<A>): Identity<B>;
function apply<A, B>(this: Identity<A>, fn: Identity<(a: A) => B>): Identity<B>;
```

- `this | fn` - function wrapped by Identity, which should be applied to value `arg`
- `arg | this` - value which should be applied to `fn`
- Returns mapped by `fn` function value wrapped by `Identity`.
  Example:

```typescript
const v = from(2);
const fn = from((a: number) => a * 2);

const newVal1 = fn.apply(v); // Identity<number> with value 4
const newVal2 = v.apply(fn); // Identity<number> with value 4
```

##### `Identity#asyncApply`

Async variant of [`Identity#apply`](#identityapply)

```typescript
function asyncApply<A, B>(
  this: Identity<(a: Promise<A> | A) => Promise<B>>,
  arg: Identity<Promise<A> | A>
): Promise<Identity<B>>;
function asyncApply<A, B>(this: Identity<Promise<A> | A>, fn: Identity<(a: Promise<A> | A) => Promise<B>>): Promise<Identity<B>>;
```

- `this | fn` - function wrapped by Identity, which should be applied to value `arg`
- `arg | this` - value which should be applied to `fn`
- Returns `Promise` with mapped by `fn` function value wrapped by `Identity`.
  Example:

```typescript
const v = from(2);
const fn = from((a: number) => Promise, resolve(a * 2));

const newVal1 = fn.apply(v); // Promise<Identity<number>> with value 4
const newVal2 = v.apply(fn); // Promise<Identity<number>> with value 4
```

#### `Identity#chain`

```typescript
function chain<Val, NewVal>(fn: (val: Val) => Identity<NewVal>): Identity<NewVal>;
```

- Returns mapped by `fn` function value wrapped by `Identity`
  Example:

```typescript
const v = from(2);

const newVal = v1.chain(a => from(a.toString())); // Identity<string> with value "2"
```

##### `Identity#asyncChain`

```typescript
function asyncChain<Val, NewVal>(fn: (val: Val) => Promise<Identity<NewVal>>): Promise<Identity<NewVal>>;
```

- Returns `Promise` with mapped by `fn` function value wrapped with `Identity`.
  Example:

```typescript
const v = from(2);

// Promise<Identity<string>> with value "2"
const newVal = v.asyncChain(a => Promise.resolve(from(a.toString())));
```

#### Helpers

```typescript
// Value from Identity instance
const { value } = from(2); // number
```

```typescript
const value = from(2).unwrap(); // returns 2
```

## License

MIT (c) Artem Kobzar see LICENSE file.
