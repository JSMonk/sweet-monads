import type { Monad } from "@sweet-monads/interfaces";

export function chain<T, R>(f: (v: T) => Promise<Monad<R>>) {
  return (m: Monad<T>) => m.asyncChain<R>(f);
}
