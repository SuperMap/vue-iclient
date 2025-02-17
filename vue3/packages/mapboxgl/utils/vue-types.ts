export type InferDefaults<T> = {
  [K in keyof T]?: InferDefault<T, T[K]>
}
export type NativeType = null | number | string | boolean | symbol | Function
export type InferDefault<P, T> = ((props: P) => T & {}) | (T extends NativeType ? T : never)

export type RecordToUnion<T extends Record<string, any>> = T[keyof T];

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type ShortEmits<T extends Record<string, any>> = UnionToIntersection<RecordToUnion<{
  [K in keyof T]: (evt: K, ...args: T[K]) => void;
}>>;