import { just, none } from "@sweet-monads/maybe";
import { IntermidiateOperation } from "./intermediate-operation.js";
import type { Maybe } from "@sweet-monads/maybe";

export class FilterOperation<A, B extends A = A> extends IntermidiateOperation<A, B> {
  constructor(private readonly predicate: (v: A, terminate: () => void) => v is B) {
    super();
  }

  execute(value: A): Maybe<B> {
    const result = this.predicate(value, () => this.terminate());
    if (this.terminated) {
      return none<B>();
    }
    return result ? just<B>(value as B) : none<B>();
  }
}
