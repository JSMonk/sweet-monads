import { Monad } from "../interfaces/monad";

enum MaybeState {
  Just = "Just",
  None = "None"
}

export class Maybe<T> implements Monad<T> {
  static none<T>() {
    return new Maybe<T>(MaybeState.None);
  }

  static just<T>(v: T) {
    return new Maybe<T>(MaybeState.Just, v);
  }

  constructor(type: MaybeState.None);
  constructor(type: MaybeState.Just, v: T);
  constructor(private state: MaybeState, private value?: T) {}

  isNone() {
    return this.state === MaybeState.None;
  }

  isJust() {
    return this.state === MaybeState.Just;
  }

  chain<R>(f: (r: T) => Maybe<R>): Maybe<R> {
    if (this.isNone()) {
      return Maybe.none<R>();
    }
    return f(this.value as T);
  }

  map<R>(f: (r: T) => R): Maybe<R> {
    if (this.isJust()) {
      return Maybe.just<R>(f(this.value as T));
    }
    return Maybe.none<R>();
  }
}
