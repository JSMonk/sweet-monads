import { Functor } from "./functor";

export interface Applicative<I> extends Functor<I> {
  // to be implemented
}

export interface ApplicativeConstructor {
  from<I>(item: I): Applicative<I>;
}
