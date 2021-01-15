import type { Maybe } from "@sweet-monads/maybe";

export abstract class IntermidiateOperation<A, B> {
  protected terminated: boolean = false;

  public get isTerminated(): boolean {
    return this.terminated;
  }

  abstract execute(v: A): Maybe<B>;

  protected terminate() {
    this.terminated = true;
  }
}
