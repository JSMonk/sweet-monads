// import { ClassImplements } from "@sweet-monads/interfaces";
import type {
  Monad,
  Alternative
  // AsyncChainable,
  // MonadConstructor,
  // ApplicativeConstructor,
} from "@sweet-monads/interfaces";

const enum MaybeState {
  Just = "Just",
  None = "None"
}

function isWrappedFunction<A, B>(m: Maybe<A> | Maybe<(a: A) => B>): m is Maybe<(a: A) => B> {
  return typeof m.value === "function";
}

// TODO: Write AST converter to eliminate these checks from the runtime
// @ClassImplements<MonadConstructor>()
// @ClassImplements<ApplicativeConstructor>()
// @ClassImplements<AsyncChainable<Maybe<any>>>()
export default class MaybeConstructor<T, S extends MaybeState = MaybeState> implements Monad<T>, Alternative<T> {
  static chain<A, B>(f: (v: A) => Promise<Maybe<B>>) {
    return (m: Maybe<A>): Promise<Maybe<B>> => m.asyncChain(f);
  }

  static merge<V1>(values: [Maybe<V1>]): Maybe<[V1]>;
  static merge<V1, V2>(values: [Maybe<V1>, Maybe<V2>]): Maybe<[V1, V2]>;
  static merge<V1, V2, V3>(values: [Maybe<V1>, Maybe<V2>, Maybe<V3>]): Maybe<[V1, V2, V3]>;
  static merge<V1, V2, V3, V4>(values: [Maybe<V1>, Maybe<V2>, Maybe<V3>, Maybe<V4>]): Maybe<[V1, V2, V3, V4]>;
  static merge<V1, V2, V3, V4, V5>(
    values: [Maybe<V1>, Maybe<V2>, Maybe<V3>, Maybe<V4>, Maybe<V5>]
  ): Maybe<[V1, V2, V3, V4, V5]>;
  static merge<V1, V2, V3, V4, V5, V6>(
    values: [Maybe<V1>, Maybe<V2>, Maybe<V3>, Maybe<V4>, Maybe<V5>, Maybe<V6>]
  ): Maybe<[V1, V2, V3, V4, V5, V6]>;
  static merge<V1, V2, V3, V4, V5, V6, V7>(
    values: [Maybe<V1>, Maybe<V2>, Maybe<V3>, Maybe<V4>, Maybe<V5>, Maybe<V6>, Maybe<V7>]
  ): Maybe<[V1, V2, V3, V4, V5, V6, V7]>;
  static merge<V1, V2, V3, V4, V5, V6, V7, V8>(
    values: [Maybe<V1>, Maybe<V2>, Maybe<V3>, Maybe<V4>, Maybe<V5>, Maybe<V6>, Maybe<V7>, Maybe<V8>]
  ): Maybe<[V1, V2, V3, V4, V5, V6, V7, V8]>;
  static merge<V1, V2, V3, V4, V5, V6, V7, V8, V9>(
    values: [Maybe<V1>, Maybe<V2>, Maybe<V3>, Maybe<V4>, Maybe<V5>, Maybe<V6>, Maybe<V7>, Maybe<V8>, Maybe<V9>]
  ): Maybe<[V1, V2, V3, V4, V5, V6, V7, V8, V9]>;
  static merge<V1, V2, V3, V4, V5, V6, V7, V8, V9, V10>(
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
  static merge<T>(maybies: Array<Maybe<T>>): Maybe<T[]>;
  static merge(maybies: Array<Maybe<unknown>>) {
    return maybies.reduce(
      (res: Maybe<Array<unknown>>, v) => v.chain(v => res.map(res => res.concat([v]))),
      MaybeConstructor.just<Array<unknown>>([])
    );
  }

  static from<T>(v: T) {
    return this.just(v);
  }

  static none<T>(): Maybe<T> {
    return new MaybeConstructor<T, MaybeState.None>(MaybeState.None, undefined);
  }

  static just<T>(v: T): Maybe<T> {
    return new MaybeConstructor<T, MaybeState.Just>(MaybeState.Just, v);
  }

  private constructor(private readonly type: S, public readonly value: S extends MaybeState.Just ? T : undefined) {}

  isNone(): this is MaybeConstructor<T, MaybeState.None> {
    return this.type === MaybeState.None;
  }

  isJust(): this is MaybeConstructor<T, MaybeState.Just> {
    return this.type === MaybeState.Just;
  }

  join<V>(this: Maybe<Maybe<V>>): Maybe<V> {
    return this.chain(x => x);
  }

  map<V>(f: (r: T) => V): Maybe<V> {
    if (this.isJust()) {
      return MaybeConstructor.just<V>(f(this.value));
    }
    return MaybeConstructor.none<V>();
  }

  asyncMap<V>(f: (r: T) => Promise<V>): Promise<Maybe<V>> {
    if (this.isJust()) {
      return f(this.value).then(MaybeConstructor.just);
    }
    return Promise.resolve(MaybeConstructor.none<V>());
  }

  apply<A, B>(this: Maybe<(a: A) => B>, arg: Maybe<A>): Maybe<B>;
  apply<A, B>(this: Maybe<A>, fn: Maybe<(a: A) => B>): Maybe<B>;
  apply<A, B>(this: Maybe<A> | Maybe<(a: A) => B>, argOrFn: Maybe<A> | Maybe<(a: A) => B>): Maybe<B> {
    if (this.isNone() || argOrFn.isNone()) {
      return MaybeConstructor.none<B>();
    }
    if (isWrappedFunction(this)) {
      return (argOrFn as Maybe<A>).map(this.value as (a: A) => B);
    }
    if (isWrappedFunction(argOrFn)) {
      return (argOrFn as Maybe<(a: A) => B>).apply(this as Maybe<A>);
    }
    throw new Error("Some of the arguments should be a function");
  }

  asyncApply<A, B>(this: Maybe<(a: Promise<A> | A) => Promise<B>>, arg: Maybe<Promise<A> | A>): Promise<Maybe<B>>;
  asyncApply<A, B>(this: Maybe<Promise<A> | A>, fn: Maybe<(a: Promise<A> | A) => Promise<B>>): Promise<Maybe<B>>;
  asyncApply<A, B>(
    this: Maybe<Promise<A>> | Maybe<(a: Promise<A> | A) => Promise<B>>,
    argOrFn: Maybe<Promise<A>> | Maybe<(a: Promise<A> | A) => Promise<B>>
  ): Promise<Maybe<B>> {
    if (this.isNone() || argOrFn.isNone()) {
      return Promise.resolve(MaybeConstructor.none<B>());
    }
    if (isWrappedFunction(this)) {
      return (argOrFn as Maybe<Promise<A>>).asyncMap(this.value as (a: A | Promise<A>) => Promise<B>);
    }
    if (isWrappedFunction(argOrFn)) {
      return (argOrFn as Maybe<(a: A | Promise<A>) => Promise<B>>).asyncApply(this as Maybe<Promise<A>>);
    }
    throw new Error("Some of the arguments should be a function");
  }

  chain<V>(f: (r: T) => Maybe<V>): Maybe<V> {
    if (this.isJust()) {
      return f(this.value as T);
    }
    return MaybeConstructor.none<V>();
  }

  asyncChain<V>(f: (r: T) => Promise<Maybe<V>>): Promise<Maybe<V>> {
    if (this.isJust()) {
      return f(this.value as T);
    }
    return Promise.resolve(MaybeConstructor.none<V>());
  }

  or(x: Maybe<T>) {
    return this.isNone() ? x : (this as Maybe<T>);
  }
}

export type Maybe<T> = MaybeConstructor<T, MaybeState.Just> | MaybeConstructor<T, MaybeState.None>;

export const { merge, just, none, from, chain } = MaybeConstructor;

export const isMaybe = <T>(value: unknown | Maybe<T>): value is Maybe<T> => value instanceof MaybeConstructor;
