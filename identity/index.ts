import type {
  AsyncMonad,
  AsyncChainable,
  ClassImplements,
  MonadConstructor,
  ApplicativeConstructor,
  Container
} from "@sweet-monads/interfaces";


function isWrappedFunction<A, B>(m: Identity<A> | Identity<(a: A) => B>): m is Identity<(a: A) => B> {
  return typeof m.value === "function";
}

function isWrappedAsyncFunction<A, B>(
  m: Identity<A | Promise<A>> | Identity<(a: A) => B | Promise<B>>
): m is Identity<(a: A) => B> {
  return typeof m.value === "function";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type StaticCheck = ClassImplements<
  typeof Identity,
  [MonadConstructor, ApplicativeConstructor, AsyncChainable<Identity<any>>]
>;
export default class Identity<T> implements AsyncMonad<T>, Container<T> {
  static chain<A, B>(f: (v: A) => Promise<Identity<B>>) {
    return (m: Identity<A>): Promise<Identity<B>> => m.asyncChain(f);
  }

  static from<T>(v: T): Identity<T> {
    return new Identity(v);
  }

  private constructor(public readonly value: T) {}

  join<V>(this: Identity<Identity<V>>): Identity<V> {
    return this.chain(x => x);
  }

  map<V>(f: (r: T) => V): Identity<V> {
    return Identity.from<V>(f(this.value));
  }

  asyncMap<V>(f: (r: T) => Promise<V>): Promise<Identity<V>> {
    return f(this.value).then(Identity.from);
  }

  apply<A, B>(this: Identity<(a: A) => B>, arg: Identity<A>): Identity<B>;
  apply<A, B>(this: Identity<A>, fn: Identity<(a: A) => B>): Identity<B>;

  apply<A, B>(this: Identity<A> | Identity<(a: A) => B>, argOrFn: Identity<A> | Identity<(a: A) => B>): Identity<B> {
    if (isWrappedFunction(this)) {
      return (argOrFn as Identity<A>).map(this.value as (a: A) => B);
    }
    if (isWrappedFunction(argOrFn)) {
      return (argOrFn as Identity<(a: A) => B>).apply(this as Identity<A>);
    }

    throw new Error("Some of the arguments should be a function");
  }

  asyncApply<A, B>(this: Identity<(a: A) => Promise<B>>, arg: Identity<Promise<A> | A>): Promise<Identity<B>>;
  asyncApply<A, B>(this: Identity<Promise<A> | A>, fn: Identity<(a: A) => Promise<B>>): Promise<Identity<B>>;
  asyncApply<A, B>(
    this: Identity<Promise<A> | A> | Identity<(a: A) => Promise<B>>,
    argOrFn: Identity<Promise<A> | A> | Identity<(a: A) => Promise<B>>
  ): Promise<Identity<B>> {
    if (isWrappedFunction(this)) {
      return (argOrFn as Identity<Promise<A> | A>)
        .map(a => Promise.resolve(a))
        .asyncMap(pa => pa.then(this.value as (a: A) => Promise<B>));
    }
    if (isWrappedAsyncFunction(argOrFn)) {
      return (argOrFn as Identity<(a: A) => Promise<B>>).asyncApply(this as Identity<Promise<A>>);
    }
    throw new Error("Some of the arguments should be a function");
  }

  chain<V>(f: (r: T) => Identity<V>): Identity<V> {
      return f(this.value as T);
  }

  asyncChain<V>(f: (r: T) => Promise<Identity<V>>): Promise<Identity<V>> {
      return f(this.value as T);
  }

  unwrap(): T {
    return this.value;
  }
}

export const { from, chain } = Identity;

export const isIdentity = <T>(value: unknown | Identity<T>): value is Identity<T> => value instanceof Identity;
