export interface Catamorphism<A, B> {
  fold<C>(l: (a: A) => C, r: (b: B) => C): C;
}
