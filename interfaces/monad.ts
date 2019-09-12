import { Functor } from "./functor";

export interface Monad<T> extends Functor<T> {
  chain<B>(f: (a: T) => Monad<B>): Monad<B>;
}
