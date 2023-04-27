export interface Foldable<T, E> {
  fold<R, L>(fn1: (e?: E) => L, fn2: (x: T) => R): R | L;
}
