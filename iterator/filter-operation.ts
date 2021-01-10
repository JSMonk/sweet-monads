import { just, none } from "@sweet-monads/maybe";
import type { Maybe } from "@sweet-monads/maybe";
import type { IntermidiateOperation } from "./intermediate-operation";

export class FilterOperation<A, B extends A = A>
  implements IntermidiateOperation<A, B> {
  constructor(private readonly predicate: (v: A) => v is B) {}

  execute(value: A): Maybe<B> {
    return this.predicate(value) ? just(value) : none();
  }
}
