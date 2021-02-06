// import { ClassImplements } from "@sweet-monads/interfaces";
import type {
  Monad,
  Alternative
  // AsyncChainable,
  // MonadConstructor,
  // ApplicativeConstructor,
} from "@sweet-monads/interfaces";

const enum EitherType {
  Left = "Left",
  Right = "Right"
}

function isWrappedFunction<A, B, L>(m: Either<L, A> | Either<L, (a: A) => B>): m is Either<L, (a: A) => B> {
  return typeof m.value === "function";
}

// TODO: Write AST converter to eliminate these checks from the runtime
// @ClassImplements<MonadConstructor>()
// @ClassImplements<ApplicativeConstructor>()
// @ClassImplements<AsyncChainable<Either<any, any>>>()
class EitherConstructor<L, R, T extends EitherType = EitherType> implements Monad<R>, Alternative<T> {
  static chain<L, R, NR>(f: (v: R) => Promise<Either<never, NR>>): (m: Either<L, R>) => Promise<Either<L, NR>>;
  static chain<L, R, NL>(f: (v: R) => Promise<Either<NL, never>>): (m: Either<L, R>) => Promise<Either<NL | L, R>>;
  static chain<L, R, NL, NR>(f: (v: R) => Promise<Either<NL, NR>>): (m: Either<L, R>) => Promise<Either<NL | L, NR>>;
  static chain<L = never, R = never, NL = never, NR = never>(f: (v: R) => Promise<Either<NL, NR>>) {
    return (m: Either<L, R>): Promise<Either<L | NL, NR>> => m.asyncChain(f);
  }

  static mergeInOne<L1, R1>(values: [Either<L1, R1>]): Either<L1, [R1]>;
  static mergeInOne<L1, R1, L2, R2>(values: [Either<L1, R1>, Either<L2, R2>]): Either<L1 | L2, [R1, R2]>;
  static mergeInOne<L1, R1, L2, R2, L3, R3>(
    values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>]
  ): Either<L1 | L2 | L3, [R1, R2, R3]>;
  static mergeInOne<L1, R1, L2, R2, L3, R3, L4, R4>(
    values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>]
  ): Either<L1 | L2 | L3 | L4, [R1, R2, R3, R4]>;
  static mergeInOne<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5>(
    values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>, Either<L5, R5>]
  ): Either<L1 | L2 | L3 | L4 | L5, [R1, R2, R3, R4, R5]>;
  static mergeInOne<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6>(
    values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>, Either<L5, R5>, Either<L6, R6>]
  ): Either<L1 | L2 | L3 | L4 | L5 | L6, [R1, R2, R3, R4, R5, R6]>;
  static mergeInOne<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6, L7, R7>(
    values: [
      Either<L1, R1>,
      Either<L2, R2>,
      Either<L3, R3>,
      Either<L4, R4>,
      Either<L5, R5>,
      Either<L6, R6>,
      Either<L7, R7>
    ]
  ): Either<L1 | L2 | L3 | L4 | L5 | L6 | L7, [R1, R2, R3, R4, R5, R6, R7]>;
  static mergeInOne<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6, L7, R7, L8, R8>(
    values: [
      Either<L1, R1>,
      Either<L2, R2>,
      Either<L3, R3>,
      Either<L4, R4>,
      Either<L5, R5>,
      Either<L6, R6>,
      Either<L7, R7>,
      Either<L8, R8>
    ]
  ): Either<L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8, [R1, R2, R3, R4, R5, R6, R7, R8]>;
  static mergeInOne<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6, L7, R7, L8, R8, L9, R9>(
    values: [
      Either<L1, R1>,
      Either<L2, R2>,
      Either<L3, R3>,
      Either<L4, R4>,
      Either<L5, R5>,
      Either<L6, R6>,
      Either<L7, R7>,
      Either<L8, R8>,
      Either<L9, R9>
    ]
  ): Either<L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9, [R1, R2, R3, R4, R5, R6, R7, R8, R9]>;
  static mergeInOne<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6, L7, R7, L8, R8, L9, R9, L10, R10>(
    values: [
      Either<L1, R1>,
      Either<L2, R2>,
      Either<L3, R3>,
      Either<L4, R4>,
      Either<L5, R5>,
      Either<L6, R6>,
      Either<L7, R7>,
      Either<L8, R8>,
      Either<L9, R9>,
      Either<L10, R10>
    ]
  ): Either<L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10, [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10]>;
  static mergeInOne<L, R>(either: Array<Either<L, R>>): Either<L, R[]>;
  static mergeInOne(eithers: Array<Either<unknown, unknown>>) {
    return eithers.reduce(
      (res: Either<unknown, Array<unknown>>, v) => v.chain(v => res.map(res => res.concat([v]))),
      EitherConstructor.right<unknown, Array<unknown>>([])
    );
  }

  static merge = EitherConstructor.mergeInOne;

  static mergeInMany<L1, R1>(values: [Either<L1, R1>]): Either<Array<L1>, [R1]>;
  static mergeInMany<L1, R1, L2, R2>(values: [Either<L1, R1>, Either<L2, R2>]): Either<Array<L1 | L2>, [R1, R2]>;
  static mergeInMany<L1, R1, L2, R2, L3, R3>(
    values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>]
  ): Either<Array<L1 | L2 | L3>, [R1, R2, R3]>;
  static mergeInMany<L1, R1, L2, R2, L3, R3, L4, R4>(
    values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>]
  ): Either<Array<L1 | L2 | L3 | L4>, [R1, R2, R3, R4]>;
  static mergeInMany<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5>(
    values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>, Either<L5, R5>]
  ): EitherConstructor<Array<L1 | L2 | L3 | L4 | L5>, [R1, R2, R3, R4, R5]>;
  static mergeInMany<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6>(
    values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>, Either<L5, R5>, Either<L6, R6>]
  ): Either<Array<L1 | L2 | L3 | L4 | L5 | L6>, [R1, R2, R3, R4, R5, R6]>;
  static mergeInMany<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6, L7, R7>(
    values: [
      Either<L1, R1>,
      Either<L2, R2>,
      Either<L3, R3>,
      Either<L4, R4>,
      Either<L5, R5>,
      Either<L6, R6>,
      Either<L7, R7>
    ]
  ): Either<Array<L1 | L2 | L3 | L4 | L5 | L6 | L7>, [R1, R2, R3, R4, R5, R6, R7]>;
  static mergeInMany<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6, L7, R7, L8, R8>(
    values: [
      Either<L1, R1>,
      Either<L2, R2>,
      Either<L3, R3>,
      Either<L4, R4>,
      Either<L5, R5>,
      Either<L6, R6>,
      Either<L7, R7>,
      Either<L8, R8>
    ]
  ): EitherConstructor<Array<L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8>, [R1, R2, R3, R4, R5, R6, R7, R8]>;
  static mergeInMany<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6, L7, R7, L8, R8, L9, R9>(
    values: [
      Either<L1, R1>,
      Either<L2, R2>,
      Either<L3, R3>,
      Either<L4, R4>,
      Either<L5, R5>,
      Either<L6, R6>,
      Either<L7, R7>,
      Either<L8, R8>,
      Either<L9, R9>
    ]
  ): Either<Array<L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9>, [R1, R2, R3, R4, R5, R6, R7, R8, R9]>;
  static mergeInMany<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6, L7, R7, L8, R8, L9, R9, L10, R10>(
    values: [
      Either<L1, R1>,
      Either<L2, R2>,
      Either<L3, R3>,
      Either<L4, R4>,
      Either<L5, R5>,
      Either<L6, R6>,
      Either<L7, R7>,
      Either<L8, R8>,
      Either<L9, R9>,
      Either<L10, R10>
    ]
  ): Either<Array<L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10>, [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10]>;
  static mergeInMany<L, R>(either: Array<Either<L, R>>): Either<L[], R[]>;
  static mergeInMany(eithers: Array<Either<unknown, unknown>>) {
    return eithers.reduce((res: EitherConstructor<Array<unknown>, Array<unknown>>, v): EitherConstructor<
      Array<unknown>,
      Array<unknown>
    > => {
      if (res.isLeft()) {
        return v.isLeft() ? EitherConstructor.left(res.value.concat([v.value])) : res;
      }
      return v.isLeft()
        ? EitherConstructor.left([v.value])
        : (v.chain(v => res.map(res => [...res, v])) as EitherConstructor<Array<unknown>, Array<unknown>>);
    }, EitherConstructor.right<Array<unknown>, Array<unknown>>([]));
  }

  static from<T>(v: T) {
    return this.right(v);
  }

  static right<L = never, T = never>(v: T): Either<L, T> {
    return new EitherConstructor<L, T, EitherType.Right>(EitherType.Right, v);
  }

  static left<T = never, R = never>(v: T): Either<T, R> {
    return new EitherConstructor<T, R, EitherType.Left>(EitherType.Left, v);
  }

  private constructor(private readonly type: T, public readonly value: T extends EitherType.Left ? L : R) {}

  isLeft(): this is EitherConstructor<L, R, EitherType.Left> {
    return this.type === EitherType.Left;
  }

  isRight(): this is EitherConstructor<L, R, EitherType.Right> {
    return this.type === EitherType.Right;
  }

  join<L1, L2, R>(this: Either<L1, Either<L2, R>>): Either<L1 | L2, R> {
    return this.chain(x => x);
  }

  mapRight<T>(f: (r: R) => T): Either<L, T> {
    return this.map(f);
  }

  mapLeft<T>(f: (l: L) => T): Either<T, R> {
    if (this.isLeft()) {
      return EitherConstructor.left<T, R>(f(this.value as L));
    }
    return EitherConstructor.right<T, R>(this.value as R);
  }

  map<T>(f: (r: R) => T): Either<L, T> {
    if (this.isLeft()) {
      return EitherConstructor.left<L, T>(this.value as L);
    }
    return EitherConstructor.right<L, T>(f(this.value as R));
  }

  asyncMap<T>(f: (r: R) => Promise<T>): Promise<Either<L, T>> {
    if (this.isLeft()) {
      return Promise.resolve(EitherConstructor.left<L, T>(this.value as L));
    }
    return f(this.value as R).then(v => EitherConstructor.right<L, T>(v));
  }

  apply<A, B>(this: Either<L, (a: A) => B>, arg: Either<L, A>): Either<L, B>;
  apply<A, B>(this: Either<L, A>, fn: Either<L, (a: A) => B>): Either<L, B>;
  apply<A, B>(
    this: Either<L, A> | Either<L, (a: A) => B>,
    argOrFn: Either<L, A> | Either<L, (a: A) => B>
  ): EitherConstructor<L, B> {
    if (this.isLeft()) {
      return EitherConstructor.left<L, B>(this.value as L);
    }
    if (argOrFn.isLeft()) {
      return EitherConstructor.left<L, B>(argOrFn.value as L);
    }
    if (isWrappedFunction(this)) {
      return (argOrFn as Either<L, A>).map(this.value as (a: A) => B);
    }
    if (isWrappedFunction(argOrFn)) {
      return (argOrFn as Either<L, (a: A) => B>).apply(this as Either<L, A>);
    }
    throw new Error("Some of the arguments should be a function");
  }

  asyncApply<A, B>(
    this: Either<L, (a: Promise<A> | A) => Promise<B>>,
    arg: Either<L, Promise<A>>
  ): Promise<Either<L, B>>;
  asyncApply<A, B>(
    this: Either<L, Promise<A>>,
    fn: Either<L, Promise<(a: Promise<A> | A) => B>>
  ): Promise<Either<L, B>>;
  asyncApply<A, B>(
    this: Either<L, Promise<A>> | Either<L, (a: Promise<A> | A) => Promise<B>>,
    argOrFn: Either<L, Promise<A>> | Either<L, (a: Promise<A> | A) => Promise<B>>
  ): Promise<Either<L, B>> {
    if (this.isLeft()) {
      return Promise.resolve(EitherConstructor.left<L, B>(this.value as L));
    }
    if (argOrFn.isLeft()) {
      return Promise.resolve(EitherConstructor.left<L, B>(argOrFn.value as L));
    }
    if (isWrappedFunction(this)) {
      return (argOrFn as Either<L, Promise<A>>).asyncMap(this.value as (a: A | Promise<A>) => Promise<B>);
    }
    if (isWrappedFunction(argOrFn)) {
      return (argOrFn as Either<L, (a: Promise<A> | A) => Promise<B>>).asyncApply(this as Either<L, Promise<A>>);
    }
    throw new Error("Some of the arguments should be a function");
  }

  chain<A, B>(f: (r: R) => Either<A, B>): Either<A | L, B> {
    if (this.isLeft()) {
      return EitherConstructor.left<L, B>(this.value as L);
    }
    return f(this.value as R);
  }

  asyncChain<A, B>(f: (r: R) => Promise<Either<A, B>>): Promise<Either<A | L, B>> {
    if (this.isLeft()) {
      return Promise.resolve(EitherConstructor.left<L, B>(this.value));
    }
    return f(this.value as R);
  }

  or(x: Either<L, R>) {
    return this.isLeft() ? x : (this as Either<L, R>);
  }
}

export type Either<L, R> = EitherConstructor<L, R, EitherType.Right> | EitherConstructor<L, R, EitherType.Left>;

export const { merge, mergeInOne, mergeInMany, left, right, from, chain } = EitherConstructor;

export const isEither = <L, R>(value: unknown | Either<L, R>): value is Either<L, R> =>
  value instanceof EitherConstructor;
