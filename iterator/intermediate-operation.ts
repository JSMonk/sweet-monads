import type { Maybe } from "@sweet-monads/maybe";

export interface IntermidiateOperation<A, B> {
  execute(v: A): Maybe<B>;
}
