type Types = {
	'boolean': boolean,
	'string': string,
	'number': number,
};
type ArgumentType = Exclude<keyof Types, 'boolean'>;
type DefaultArgumentType = Types['string'];
type FlagType = keyof Types;
type DefaultFlagType = Types['boolean'];

type Documented = { summary: string, description?: string };
type Input = Documented & { required?: boolean };
type Argument = Input & { type?: ArgumentType };
type Flag = Input & { type?: FlagType, shortName?: string };

type TypeOf<I extends Argument | Flag> =
	I['type'] extends keyof Types
		? Types[I['type']]
		: (I extends Argument ? DefaultArgumentType : DefaultFlagType);

type Schema = Documented & {
	name: string,
	args?: Argument[],
	flags?: { [name: string]: Flag }
};
