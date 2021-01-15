import { just } from "@sweet-monads/maybe";
import { IntermidiateOperation } from "./intermediate-operation";
import type { Maybe } from "@sweet-monads/maybe";

export class MapOperation<A, B> extends IntermidiateOperation<A, B> {
  constructor(private readonly fn: (v: A) => B) {
    super();
  }

  execute(value: A): Maybe<B> {
    return just(this.fn(value));
  }
}
