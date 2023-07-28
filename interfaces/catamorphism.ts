export interface Catamorphism<Variants extends unknown[]> {
  fold<C>(...args: { [K in keyof Variants]: (value: Variants[K]) => C }): C;
}
