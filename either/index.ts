import { Monad } from "@sweet-monads/interfaces/monad";

enum EitherType {
  Left = "Left",
  Right = "Right"
}

export class Either<L, R> implements Monad<R> {
  static right<L, T>(v: T) {
    return new Either<L, T>(EitherType.Right, v);
  }

  static left<T, R>(v: T) {
    return new Either<T, R>(EitherType.Left, v);
  }

  constructor(type: EitherType.Left, v: L);
  constructor(type: EitherType.Right, v: R);
  constructor(private type: EitherType, private value: L | R) {}

  isLeft() {
    return this.type === EitherType.Left;
  }

  isRight() {
    return this.type === EitherType.Right;
  }

  mapRight<T>(f: (r: R) => T): Either<L, T> {
    return this.map(f);
  }

  mapLeft<T>(f: (l: L) => T): Either<T, R> {
    if (this.isLeft()) {
      return Either.left<T, R>(f(this.value as L));
    }
    return Either.right<T, R>(this.value as R);
  }

  chain<A, B>(f: (r: R) => Either<A, B>): Either<A, B> | Either<L, B> {
    if (this.isLeft()) {
      return Either.left<L, B>(this.value as L);
    }
    return f(this.value as R);
  }

  map<T>(f: (r: R) => T): Either<L, T> {
    if (this.isRight()) {
      return Either.right<L, T>(f(this.value as R));
    }
    return Either.left<L, T>(this.value as L);
  }
}
