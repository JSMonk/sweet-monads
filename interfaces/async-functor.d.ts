import type { Functor } from "./functor";

export interface AsyncFunctor<T> extends Functor<T> {
  asyncMap<R>(f: (a: T) => Promise<R>): Promise<AsyncFunctor<R>>;
}
