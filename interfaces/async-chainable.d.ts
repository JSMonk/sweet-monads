import type { AsyncMonad } from "./async-monad";

export interface AsyncChainable<M extends AsyncMonad<unknown>> {
  chain<A, B>(f: (v: A) => Promise<M & AsyncMonad<B>>): (m: M & AsyncMonad<A>) => Promise<M & AsyncMonad<B>>;
}
