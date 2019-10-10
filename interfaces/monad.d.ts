import { Applicative, ApplicativeConstructor } from "./applicative";

export interface Monad<T> extends Applicative<T> {
  chain<B>(f: (a: T) => Monad<B>): Monad<B>;
}

export interface MonadConstructor extends ApplicativeConstructor {
  from<I>(item: I): Monad<I>;
}
