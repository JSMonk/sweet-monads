import type { Functor } from "./functor";

export interface Applicative<I> extends Functor<I> {
  apply<A, B>(this: Applicative<(a: A) => B>, arg: Applicative<A>): Applicative<B>;
  apply<A, B>(this: Applicative<A>, fn: Applicative<(a: A) => B>): Applicative<B>;
  asyncApply<A, B>(
    this: Applicative<(a: Promise<A> | A) => Promise<B>>,
    arg: Applicative<Promise<A> | A>
  ): Promise<Applicative<B>>;
  asyncApply<A, B>(
    this: Applicative<Promise<A> | A>,
    fn: Applicative<(a: Promise<A> | A) => Promise<B>>
  ): Promise<Applicative<B>>;
}

export interface ApplicativeConstructor {
  from<I>(item: I): Applicative<I>;
}
