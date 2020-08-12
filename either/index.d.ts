import { Monad } from "@sweet-monads/interfaces";
declare const enum EitherType {
    Left = "Left",
    Right = "Right"
}
declare class EitherConstructor<L, R, T extends EitherType = EitherType> implements Monad<R> {
    private readonly type;
    readonly value: T extends EitherType.Left ? L : R;
    static mergeInOne<L1, R1>(values: [Either<L1, R1>]): Either<L1, [R1]>;
    static mergeInOne<L1, R1, L2, R2>(values: [Either<L1, R1>, Either<L2, R2>]): Either<L1 | L2, [R1, R2]>;
    static mergeInOne<L1, R1, L2, R2, L3, R3>(values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>]): Either<L1 | L2 | L3, [R1, R2, R3]>;
    static mergeInOne<L1, R1, L2, R2, L3, R3, L4, R4>(values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>]): Either<L1 | L2 | L3 | L4, [R1, R2, R3, R4]>;
    static mergeInOne<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5>(values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>, Either<L5, R5>]): Either<L1 | L2 | L3 | L4 | L5, [R1, R2, R3, R4, R5]>;
    static mergeInOne<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6>(values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>, Either<L5, R5>, Either<L6, R6>]): Either<L1 | L2 | L3 | L4 | L5 | L6, [R1, R2, R3, R4, R5, R6]>;
    static mergeInOne<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6, L7, R7>(values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>, Either<L5, R5>, Either<L6, R6>, Either<L7, R7>]): Either<L1 | L2 | L3 | L4 | L5 | L6 | L7, [R1, R2, R3, R4, R5, R6, R7]>;
    static mergeInOne<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6, L7, R7, L8, R8>(values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>, Either<L5, R5>, Either<L6, R6>, Either<L7, R7>, Either<L8, R8>]): Either<L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8, [R1, R2, R3, R4, R5, R6, R7, R8]>;
    static mergeInOne<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6, L7, R7, L8, R8, L9, R9>(values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>, Either<L5, R5>, Either<L6, R6>, Either<L7, R7>, Either<L8, R8>, Either<L9, R9>]): Either<L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9, [R1, R2, R3, R4, R5, R6, R7, R8, R9]>;
    static mergeInOne<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6, L7, R7, L8, R8, L9, R9, L10, R10>(values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>, Either<L5, R5>, Either<L6, R6>, Either<L7, R7>, Either<L8, R8>, Either<L9, R9>, Either<L10, R10>]): Either<L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10, [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10]>;
    static mergeInOne<L, R>(either: Array<Either<L, R>>): Either<L, R[]>;
    static merge: typeof EitherConstructor.mergeInOne;
    static mergeInMany<L1, R1>(values: [Either<L1, R1>]): Either<Array<L1>, [R1]>;
    static mergeInMany<L1, R1, L2, R2>(values: [Either<L1, R1>, Either<L2, R2>]): Either<Array<L1 | L2>, [R1, R2]>;
    static mergeInMany<L1, R1, L2, R2, L3, R3>(values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>]): Either<Array<L1 | L2 | L3>, [R1, R2, R3]>;
    static mergeInMany<L1, R1, L2, R2, L3, R3, L4, R4>(values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>]): Either<Array<L1 | L2 | L3 | L4>, [R1, R2, R3, R4]>;
    static mergeInMany<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5>(values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>, Either<L5, R5>]): EitherConstructor<Array<L1 | L2 | L3 | L4 | L5>, [R1, R2, R3, R4, R5]>;
    static mergeInMany<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6>(values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>, Either<L5, R5>, Either<L6, R6>]): Either<Array<L1 | L2 | L3 | L4 | L5 | L6>, [R1, R2, R3, R4, R5, R6]>;
    static mergeInMany<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6, L7, R7>(values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>, Either<L5, R5>, Either<L6, R6>, Either<L7, R7>]): Either<Array<L1 | L2 | L3 | L4 | L5 | L6 | L7>, [R1, R2, R3, R4, R5, R6, R7]>;
    static mergeInMany<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6, L7, R7, L8, R8>(values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>, Either<L5, R5>, Either<L6, R6>, Either<L7, R7>, Either<L8, R8>]): EitherConstructor<Array<L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8>, [R1, R2, R3, R4, R5, R6, R7, R8]>;
    static mergeInMany<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6, L7, R7, L8, R8, L9, R9>(values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>, Either<L5, R5>, Either<L6, R6>, Either<L7, R7>, Either<L8, R8>, Either<L9, R9>]): Either<Array<L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9>, [R1, R2, R3, R4, R5, R6, R7, R8, R9]>;
    static mergeInMany<L1, R1, L2, R2, L3, R3, L4, R4, L5, R5, L6, R6, L7, R7, L8, R8, L9, R9, L10, R10>(values: [Either<L1, R1>, Either<L2, R2>, Either<L3, R3>, Either<L4, R4>, Either<L5, R5>, Either<L6, R6>, Either<L7, R7>, Either<L8, R8>, Either<L9, R9>, Either<L10, R10>]): Either<Array<L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10>, [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10]>;
    static mergeInMany<L, R>(either: Array<Either<L, R>>): Either<L[], R[]>;
    static from<T>(v: T): Either<{}, T>;
    static right<L, T>(v: T): Either<L, T>;
    static left<T, R>(v: T): Either<T, R>;
    private constructor();
    isLeft(): this is EitherConstructor<L, R, EitherType.Left>;
    isRight(): this is EitherConstructor<L, R, EitherType.Right>;
    join<L1, L2, R>(this: Either<L1, Either<L2, R>>): Either<L1 | L2, R>;
    mapRight<T>(f: (r: R) => T): Either<L, T>;
    mapLeft<T>(f: (l: L) => T): Either<T, R>;
    map<T>(f: (r: R) => T): Either<L, T>;
    asyncMap<T>(f: (r: R) => Promise<T>): Promise<Either<L, T>>;
    apply<A, B>(this: Either<L, (a: A) => B>, arg: Either<L, A>): Either<L, B>;
    apply<A, B>(this: Either<L, A>, fn: Either<L, (a: A) => B>): Either<L, B>;
    asyncApply<A, B>(this: Either<L, (a: Promise<A> | A) => Promise<B>>, arg: Either<L, Promise<A>>): Promise<Either<L, B>>;
    asyncApply<A, B>(this: Either<L, Promise<A>>, fn: Either<L, Promise<(a: Promise<A> | A) => B>>): Promise<Either<L, B>>;
    chain<A, B>(f: (r: R) => Either<A, B>): Either<A | L, B>;
    asyncChain<A, B>(f: (r: R) => Promise<Either<A, B>>): Promise<Either<A | L, B>>;
    or(x: Either<L, R>): Either<L, R>;
}
export declare type Either<L, R> = EitherConstructor<L, R, EitherType.Right> | EitherConstructor<L, R, EitherType.Left>;
export declare const merge: typeof EitherConstructor.mergeInOne, mergeInOne: typeof EitherConstructor.mergeInOne, mergeInMany: typeof EitherConstructor.mergeInMany, left: typeof EitherConstructor.left, right: typeof EitherConstructor.right, from: typeof EitherConstructor.from;
export declare const isEither: <L, R>(value: unknown) => value is Either<L, R>;
export {};
