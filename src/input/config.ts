import { Any, O as Obj } from 'ts-toolbelt';

type ConfigDefaults<C extends object> = Any.Compute<Required<Pick<C, Obj.OptionalKeys<C>>>>;

export type Config<C extends object, D extends ConfigDefaults<C>, Conf extends C> = Obj.Assign<D, [Conf]>;

/**
 * Config loader that merges input with defaults.  Both the schema and default types must be explicitly specified even
 * though TypeScript will try to infer them.  The default type will be checked against the schema for you.
 */
export const config = <C extends object>() =>
	<D extends ConfigDefaults<C>>(defaults: D) =>
		<Conf extends C>(conf: Conf) => ({
			...defaults,
			...conf,
		}) as unknown as Config<C, D, Conf>;
