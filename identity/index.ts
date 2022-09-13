import type {
  AsyncMonad,
  AsyncChainable,
  ClassImplements,
  MonadConstructor,
  ApplicativeConstructor,
  Container
} from "@sweet-monads/interfaces";

function isWrappedFunction<A, B>(m: Identity<A | Promise<A>> | Identity<(a: A) => B>): m is Identity<(a: A) => B> {
  return typeof m.value === "function";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type StaticCheck = ClassImplements<
  typeof IdentityConstructor,
  [MonadConstructor, ApplicativeConstructor, AsyncChainable<Identity<any>>]
>;

class IdentityConstructor<T> implements AsyncMonad<T>, Container<T> {
  static chain<A, B>(f: (v: A) => Promise<Identity<B>>) {
    return (m: Identity<A>): Promise<Identity<B>> => m.asyncChain(f);
  }

  static from<T>(v: T): Identity<T> {
    return new IdentityConstructor(v);
  }

  private constructor(public readonly value: T) {}

  join<A>(this: Identity<Identity<A>>): Identity<A> {
    return this.chain(x => x);
  }

  map<B, A extends unknown[] = []>(f: (r: T, ...parameters: A) => B, ...parameters: A): Identity<B> {
    return IdentityConstructor.from(f(this.value, ...parameters));
  }

  asyncMap<B, A extends unknown[] = []>(
    f: (r: T, ...parameters: A) => Promise<B>,
    ...parameters: A
  ): Promise<Identity<B>> {
    return f(this.value, ...parameters).then(v => IdentityConstructor.from(v));
  }

  apply<A, B>(this: Identity<(a: A) => B>, arg: Identity<A>): Identity<B>;
  apply<A, B>(this: Identity<A>, fn: Identity<(a: A) => B>): Identity<B>;
  apply<A, B>(
    this: Identity<A> | Identity<(a: A) => B>,
    argOrFn: Identity<A> | Identity<(a: A) => B>
  ): IdentityConstructor<B> {
    if (isWrappedFunction(this)) {
      return (argOrFn as Identity<A>).map(this.value as (a: A) => B);
    }
    if (isWrappedFunction(argOrFn)) {
      return (argOrFn as Identity<(a: A) => B>).apply(this);
    }

    throw new Error("Some of the arguments should be a function");
  }

  asyncApply<A, B>(this: Identity<(a: A) => Promise<B>>, arg: Identity<Promise<A> | A>): Promise<Identity<B>>;
  asyncApply<A, B>(this: Identity<Promise<A> | A>, fn: Identity<Promise<(a: A) => B>>): Promise<Identity<B>>;
  asyncApply<A, B>(
    this: Identity<Promise<A> | A> | Identity<(a: A) => Promise<B>>,
    argOrFn: Identity<Promise<A> | A> | Identity<(a: A) => Promise<B>>
  ): Promise<Identity<B>> {
    if (isWrappedFunction(this)) {
      return (argOrFn as Identity<Promise<A> | A>)
        .map(a => Promise.resolve(a))
        .asyncMap(pa => pa.then(this.value as (a: A) => Promise<B>));
    }
    if (isWrappedFunction(argOrFn)) {
      return (argOrFn as Identity<(a: Promise<A> | A) => Promise<B>>).asyncApply(this as Identity<Promise<A>>);
    }
    throw new Error("Some of the arguments should be a function");
  }

  chain<B, A extends unknown[] = []>(f: (r: T, ...parameters: A) => Identity<B>, ...parameters: A): Identity<B> {
    return f(this.value, ...parameters);
  }

  asyncChain<B, A extends unknown[] = []>(
    f: (r: T, ...parameters: A) => Promise<Identity<B>>,
    ...parameters: A
  ): Promise<Identity<B>> {
    return f(this.value, ...parameters);
  }

  unwrap(): T {
    return this.value;
  }
}

export type Identity<T> = IdentityConstructor<T>;

export const { from, chain } = IdentityConstructor;

export const isIdentity = <T>(value: unknown | Identity<T>): value is Identity<T> =>
  value instanceof IdentityConstructor;
