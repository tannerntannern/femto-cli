// TODO: implement enum types!

import { A as Any, O as Obj, T as Tup } from 'ts-toolbelt';

type KeyPair<Key extends string, Val extends any> = Any.Compute<{[K in Key]: Val}>;

type Types = {
	'boolean': boolean,
	'string': string,
	'number': number,
};
type ArgumentType = Exclude<keyof Types, 'boolean'>;
type DefaultArgumentType = 'string';
type OptionType = keyof Types;
type DefaultFlagType = 'boolean';

type Documented = { summary: string, description?: string };
type Input = Documented /*& { required?: boolean } // TODO: implement required*/;
export type Argument = Any.Compute<Input & { type?: ArgumentType }>;
export type Option = Any.Compute<Input & { type?: OptionType, shortName?: string }>;

type Arguments = Argument[];
type Options = {[name: string]: Option}[];
type VoidLike = void | Promise<void>;
type Action<A extends Arguments, O extends Options, R> = (options: OptionTypes<O>, ...args: Tup.Reverse<ArgumentTypes<A>>) => R;

type CollapseOptions<O extends Options> = Obj.Assign<{}, O>;
type GetType <I extends {type?: keyof Types}, D extends keyof Types = 'string'> = 'type' extends keyof I ? Types[I['type']] : Types[D];
type ArgumentTypes<A extends Arguments> = {[K in keyof A]: GetType<A[K], DefaultArgumentType>};
type OptionTypes<O extends Options, _CO = CollapseOptions<O>> = Any.Compute<{[K in keyof _CO]: GetType<_CO[K], DefaultFlagType>}>;

type ExecReturn<D extends boolean> = true extends D ? VoidLike : never;

export type Command<A extends Arguments = Arguments, Opt extends Options = Options, D extends boolean = boolean> = {
	getMeta: () => Documented,
	getArguments: () => Tup.Reverse<A>,
	getOptions: () => CollapseOptions<Opt>,
	meta: (meta: Documented) => Command<A, Opt, D>,
	argument: <C extends Argument>(config: C) => Command<Tup.Prepend<A, C>, Opt, D>,
	option: <N extends string, C extends Option>(name: N, config: C) => Command<A, Tup.Prepend<Opt, KeyPair<N, C>>, D>,
	action: <Act extends Action<A, Opt, VoidLike>>(action: Act) => Command<A, Opt, true>,
	exec: Action<A, Opt, ExecReturn<D>>,
};

/**
 * Returns a command object that can further be built upon with a chainable API
 */
export const command = <M extends Documented>(meta: M): Command<[], [], false> => {
	let met: Documented = meta;
	const args: Arguments = [];
	const options: CollapseOptions<Options> = {};
	let action;

	let commandRef;
	const command: Command<[], [], false> = {
		getMeta: () => met,
		getArguments: () => args as any,
		getOptions: () => options,
		meta: m => { met = m; return commandRef; },
		argument: config => { args.push(config); return commandRef; },
		option: (name, config) => { options[name as any] = config; return commandRef; },
		action: a => { action = a; return commandRef; },
		// @ts-ignore: this is fine
		exec: (...args) => {
			if (!action) throw new Error('Command not implemented');
			else return action(...args);
		}
	};

	commandRef = command;
	return command;
};

/**
 * Duck-type predicate for Commands.
 */
export const isCommand = (thing: unknown): thing is Command =>
	['argument', 'option', 'action', 'exec'].every(key => typeof thing[key] === 'function');
