import { Monad } from "@sweet-monads/interfaces";

enum MaybeState {
  Just = "Just",
  None = "None"
}

function isWrappedFunction<A, B>(
  m: Maybe<A> | Maybe<(a: A) => B>
): m is Maybe<(a: A) => B> {
  return typeof m.value === "function";
}

export class Maybe<T> implements Monad<T> {
  static merge<V1>(values: [Maybe<V1>]): Maybe<[V1]>;
  static merge<V1, V2>(values: [Maybe<V1>, Maybe<V2>]): Maybe<[V1, V2]>;
  static merge<V1, V2, V3>(
    values: [Maybe<V1>, Maybe<V2>, Maybe<V3>]
  ): Maybe<[V1, V2, V3]>;
  static merge<V1, V2, V3, V4>(
    values: [Maybe<V1>, Maybe<V2>, Maybe<V3>, Maybe<V4>]
  ): Maybe<[V1, V2, V3, V4]>;
  static merge<V1, V2, V3, V4, V5>(
    values: [Maybe<V1>, Maybe<V2>, Maybe<V3>, Maybe<V4>, Maybe<V5>]
  ): Maybe<[V1, V2, V3, V4, V5]>;
  static merge<V1, V2, V3, V4, V5, V6>(
    values: [Maybe<V1>, Maybe<V2>, Maybe<V3>, Maybe<V4>, Maybe<V5>, Maybe<V6>]
  ): Maybe<[V1, V2, V3, V4, V5, V6]>;
  static merge<V1, V2, V3, V4, V5, V6, V7>(
    values: [
      Maybe<V1>,
      Maybe<V2>,
      Maybe<V3>,
      Maybe<V4>,
      Maybe<V5>,
      Maybe<V6>,
      Maybe<V7>
    ]
  ): Maybe<[V1, V2, V3, V4, V5, V6, V7]>;
  static merge<V1, V2, V3, V4, V5, V6, V7, V8>(
    values: [
      Maybe<V1>,
      Maybe<V2>,
      Maybe<V3>,
      Maybe<V4>,
      Maybe<V5>,
      Maybe<V6>,
      Maybe<V7>,
      Maybe<V8>
    ]
  ): Maybe<[V1, V2, V3, V4, V5, V6, V7, V8]>;
  static merge<V1, V2, V3, V4, V5, V6, V7, V8, V9>(
    values: [
      Maybe<V1>,
      Maybe<V2>,
      Maybe<V3>,
      Maybe<V4>,
      Maybe<V5>,
      Maybe<V6>,
      Maybe<V7>,
      Maybe<V8>,
      Maybe<V9>
    ]
  ): Maybe<[V1, V2, V3, V4, V5, V6, V7, V8, V9]>;
  static merge<V1, V2, V3, V4, V5, V6, V7, V8, V9, L10, V10>(
    values: [
      Maybe<V1>,
      Maybe<V2>,
      Maybe<V3>,
      Maybe<V4>,
      Maybe<V5>,
      Maybe<V6>,
      Maybe<V7>,
      Maybe<V8>,
      Maybe<V9>,
      Maybe<V10>
    ]
  ): Maybe<[V1, V2, V3, V4, V5, V6, V7, V8, V9, V10]>;
  static merge(maybies: Array<Maybe<unknown>>) {
    return maybies.reduce(
      (res: Maybe<Array<unknown>>, v) =>
        v.chain(v => res.map(res => res.concat([v]))),
      Maybe.just<Array<unknown>>([])
    );
  }

  static from<T>(v: T) {
    return this.just(v);
  }

  static none<T>() {
    return new Maybe<T>(MaybeState.None);
  }

  static just<T>(v: T) {
    return new Maybe<T>(MaybeState.Just, v);
  }

  private constructor(type: MaybeState.None);
  private constructor(type: MaybeState.Just, v: T);
  private constructor(
    private readonly state: MaybeState,
    public readonly value?: T
  ) {}

  isNone() {
    return this.state === MaybeState.None;
  }

  isJust() {
    return this.state === MaybeState.Just;
  }

  join<V>(this: Maybe<Maybe<V>>): Maybe<V> {
    return this.chain(x => x);
  }

  map<V>(f: (r: T) => V): Maybe<V> {
    if (this.isJust()) {
      return Maybe.just<V>(f(this.value as T));
    }
    return Maybe.none<V>();
  }

  asyncMap<V>(f: (r: T) => Promise<V>): Promise<Maybe<V>> {
    if (this.isNone()) {
      return Promise.resolve(Maybe.none<V>());
    }
    return f(this.value as T).then(v => Maybe.just<V>(v));
  }

  apply<A, B>(this: Maybe<(a: A) => B>, arg: Maybe<A>): Maybe<B>;
  apply<A, B>(this: Maybe<A>, fn: Maybe<(a: A) => B>): Maybe<B>;
  apply<A, B>(
    this: Maybe<A> | Maybe<(a: A) => B>,
    argOrFn: Maybe<A> | Maybe<(a: A) => B>
  ): Maybe<B> {
    if (isWrappedFunction(this) && !isWrappedFunction(argOrFn)) {
      if (this.isJust()) {
        return argOrFn.map(this.value);
      }
      return Maybe.none<B>();
    }
    return (argOrFn as Maybe<(a: A) => B>).apply(this as Maybe<A>);
  }

  asyncApply<A, B>(
    this: Maybe<(a: Promise<A> | A) => Promise<B>>,
    arg: Maybe<Promise<A> | A>
  ): Promise<Maybe<B>>;
  asyncApply<A, B>(
    this: Maybe<Promise<A> | A>,
    fn: Maybe<(a: Promise<A> | A) => Promise<B>>
  ): Promise<Maybe<B>>;
  asyncApply<A, B>(
    this: Maybe<Promise<A>> | Maybe<(a: Promise<A> | A) => Promise<B>>,
    argOrFn: Maybe<Promise<A>> | Maybe<(a: Promise<A> | A) => Promise<B>>
  ): Promise<Maybe<B>> {
    if (isWrappedFunction(this) && !isWrappedFunction(argOrFn)) {
      if (this.isJust()) {
        const { value: fn } = this;
        return argOrFn.asyncMap(fn);
      }
      return Promise.resolve(Maybe.none<B>());
    }
    return (argOrFn as Maybe<(a: A) => Promise<B>>).asyncApply(this as Maybe<
      Promise<A>
    >);
  }

  chain<V>(f: (r: T) => Maybe<V>): Maybe<V> {
    if (this.isNone()) {
      return Maybe.none<V>();
    }
    return f(this.value as T);
  }

  asyncChain<V>(f: (r: T) => Promise<Maybe<V>>): Promise<Maybe<V>> {
    if (this.isNone()) {
      return Promise.resolve(Maybe.none<V>());
    }
    return f(this.value as T);
  }
}
