import type { Applicative, ApplicativeConstructor } from "./applicative";

export interface Monad<T> extends Applicative<T> {
  chain<B>(f: (a: T) => Monad<B>): Monad<B>;
  join<I>(this: Monad<Monad<I>>): Monad<I>;
}

export interface MonadConstructor extends ApplicativeConstructor {
  from<I>(item: I): Monad<I>;
}
