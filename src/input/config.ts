import { Any, O as Obj } from 'ts-toolbelt';

/**
 * A config is just an object type with 0 or more optional keys.  Any key that is optional must have a default value.
 * So, if you have a config, `type MyConfig = {foo: string, bar?: number}`, the `ConfigDefaults<MyConfig>` would be
 * `{bar: number}`.  In other words, it derives a new type, extracting just the optional key pairs and making them
 * required.
 */
type ConfigDefaults<C extends object> = Any.Compute<Required<Pick<C, Obj.OptionalKeys<C>>>>;

export type Config<
	Schema extends object,
	Defaults extends ConfigDefaults<Schema>,
	Conf extends Schema
> = Obj.Assign<Defaults, [Conf]>;

/**
 * Config loader that merges input with defaults.  Both the schema and default types must be explicitly specified even
 * though TypeScript will try to infer them.  The default type will be checked against the schema for you.
 */
export const config = <Schema extends object>() =>
	<Defaults extends ConfigDefaults<Schema>>(defaults: Defaults) =>
		<Conf extends Schema>(conf: Conf) => ({
			...defaults,
			...conf,
		}) as unknown as Config<Schema, Defaults, Conf>;
