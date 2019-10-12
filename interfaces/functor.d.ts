export interface Functor<T> {
  map<R>(f: (a: T) => R): Functor<R>;
  asyncMap<R>(f: (a: T) => Promise<R>): Promise<Functor<R>>;
}
