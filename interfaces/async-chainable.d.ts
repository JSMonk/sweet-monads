import type { Monad } from "@sweet-monads/interfaces";

export interface AsyncChainable<M extends Monad<unknown>> {
  chain<A, B>(f: (v: A) => Promise<M & Monad<B>>): (m: M & Monad<A>) => Promise<M & Monad<B>>
}
