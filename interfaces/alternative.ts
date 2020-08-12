export interface Alternative<T> {
  or(arg: Alternative<T>): Alternative<T>;
}
