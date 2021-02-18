type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type TupleToUnion<T extends any[]> = T[number];

type TupleToIntersection<T extends any[]> = UnionToIntersection<TupleToUnion<T>>;

export type ClassImplements<C extends TupleToIntersection<I>, I extends any[]> = C;
