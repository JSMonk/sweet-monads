export interface Functor<T> {
  map<R>(f: (a: T) => R): Functor<R>;
}
