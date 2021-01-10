import { just } from "@sweet-monads/maybe";
import type { Maybe } from "@sweet-monads/maybe";
import type { IntermidiateOperation } from "./intermediate-operation";

export class MapOperation<A, B> implements IntermidiateOperation<A, B> {
  constructor(private readonly fn: (v: A) => B) {}

  execute(value: A): Maybe<B> {
    return just(this.fn(value));
  }
}
