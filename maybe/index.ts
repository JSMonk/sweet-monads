import { Monad } from "@sweet-monads/interfaces";

enum MaybeState {
  Just = "Just",
  None = "None"
}

export class Maybe<T> implements Monad<T> {
  static merge<V1>(values: [Maybe<V1>]): Maybe<[V1]>;
  static merge<V1, V2>(values: [Maybe<V1>, Maybe<V2>]): Maybe<[V1, V2]>;
  static merge<V1, V2, V3>(values: [Maybe<V1>, Maybe<V2>, Maybe<V3>]): Maybe<[V1, V2, V3]>;
  static merge<V1, V2, V3, V4>(values: [Maybe<V1>, Maybe<V2>, Maybe<V3>, Maybe<V4>]): Maybe<[V1, V2, V3, V4]>;
  static merge<V1, V2, V3, V4, V5>(values: [Maybe<V1>, Maybe<V2>, Maybe<V3>, Maybe<V4>, Maybe<V5>]): Maybe<[V1, V2, V3, V4, V5]>;
  static merge<V1, V2, V3, V4, V5, V6>(values: [Maybe<V1>, Maybe<V2>, Maybe<V3>, Maybe<V4>, Maybe<V5>, Maybe<V6>]): Maybe<[V1, V2, V3, V4, V5, V6]>;
  static merge<V1, V2, V3, V4, V5, V6, V7>(values: [Maybe<V1>, Maybe<V2>, Maybe<V3>, Maybe<V4>, Maybe<V5>, Maybe<V6>, Maybe<V7>]): Maybe<[V1, V2, V3, V4, V5, V6, V7]>;
  static merge<V1, V2, V3, V4, V5, V6, V7, V8>(values: [Maybe<V1>, Maybe<V2>, Maybe<V3>, Maybe<V4>, Maybe<V5>, Maybe<V6>, Maybe<V7>, Maybe<V8>]): Maybe<[V1, V2, V3, V4, V5, V6, V7, V8]>;
  static merge<V1, V2, V3, V4, V5, V6, V7, V8, V9>(values: [Maybe<V1>, Maybe<V2>, Maybe<V3>, Maybe<V4>, Maybe<V5>, Maybe<V6>, Maybe<V7>, Maybe<V8>, Maybe<V9>]): Maybe<[V1, V2, V3, V4, V5, V6, V7, V8, V9]>;
  static merge<V1, V2, V3, V4, V5, V6, V7, V8, V9, L10, V10>(values: [Maybe<V1>, Maybe<V2>, Maybe<V3>, Maybe<V4>, Maybe<V5>, Maybe<V6>, Maybe<V7>, Maybe<V8>, Maybe<V9>, Maybe<V10>]): Maybe<[V1, V2, V3, V4, V5, V6, V7, V8, V9, V10]>;
  static merge(maybies: Array<Maybe<unknown>>) {
    return maybies.reduce(
      (res: Maybe<Array<unknown>>, v) =>
        v.chain(v => res.map(res => res.concat([v]))),
      Maybe.just<Array<unknown>>([])
    );
  }
  static none<T>() {
    return new Maybe<T>(MaybeState.None);
  }

  static just<T>(v: T) {
    return new Maybe<T>(MaybeState.Just, v);
  }

  constructor(type: MaybeState.None);
  constructor(type: MaybeState.Just, v: T);
  constructor(public readonly state: MaybeState, public readonly value?: T) {}

  isNone() {
    return this.state === MaybeState.None;
  }

  isJust() {
    return this.state === MaybeState.Just;
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
