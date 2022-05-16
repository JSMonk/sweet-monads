import type { Applicative } from "./applicative";
import type { AsyncFunctor } from "./async-functor";

export interface AsyncApplicative<I> extends AsyncFunctor<I>, Applicative<I> {
  asyncApply<A, B>(
    this: AsyncApplicative<(a: A) => Promise<B>>,
    arg: AsyncApplicative<Promise<A> | A>
  ): Promise<AsyncApplicative<B>>;
  asyncApply<A, B>(
    this: AsyncApplicative<Promise<A> | A>,
    fn: AsyncApplicative<(a: A) => Promise<B>>
  ): Promise<AsyncApplicative<B>>;
}
