/**
 * Given an object-based type, this type will add another prop/value.
 */
export type ExtendObj<O extends {[key: string]: any}, P extends string, V> = { [K in (keyof O) | P]: K extends keyof O ? O[K] : V };

/**
 * Prepends type element E to tuple T.
 */
export type PrependTuple<T extends any[], E> = Parameters<(e: E, ...t: T) => void>;

/**
 * Recursively reverses a tuple.  "Borrowed" from https://github.com/ksxnodemodules/typescript-tuple
 */
export type Reverse<Tuple extends any[], Prefix extends any[] = []> = {
	empty: Prefix,
	nonEmpty: ((..._: Tuple) => any) extends ((_: infer First, ..._1: infer Next) => any)
		? Reverse<Next, PrependTuple<Prefix, First>>
		: never
}[
	Tuple extends [any, ...any[]] ? 'nonEmpty' : 'empty'
];
