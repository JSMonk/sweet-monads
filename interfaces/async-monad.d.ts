import type { Monad } from "./monad";
import type { AsyncApplicative } from "./async-applicative";

export interface AsyncMonad<T> extends AsyncApplicative<T>, Monad<T> {
  asyncChain<B>(f: (a: T) => Promise<AsyncMonad<B>>): Promise<AsyncMonad<B>>;
}
