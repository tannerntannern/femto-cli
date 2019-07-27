// TODO: implement enum types!

import { ExtendObj, PrependTuple, Reverse } from './util';

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
export type Argument = Input & { type?: ArgumentType };
export type Option = Input & { type?: OptionType, shortName?: string };

type Args = Argument[];
type Opts = {[name: string]: Option};
type VoidLike = void | Promise<void>;
type Action<A extends Args, O extends Opts, R> = (options: OptionTypes<O>, ...args: Reverse<ArgumentTypes<A>>) => R

type GetType <I extends {type?: keyof Types}, D extends keyof Types = 'string'> = 'type' extends keyof I ? Types[I['type']] : Types[D];
type ArgumentTypes<A extends Args> = {[K in keyof A]: GetType<A[K], DefaultArgumentType>};
type OptionTypes<O extends Opts> = {[K in keyof O]: GetType<O[K], DefaultFlagType>};

type ExecReturn<D extends boolean> = true extends D ? VoidLike : never;

export type Command<A extends Args, O extends Opts, D extends boolean> = {
	getMeta: () => Documented,
	getArguments: () => Reverse<A>,
	getOptions: () => O,
	meta: (meta: Documented) => Command<A, O, D>,
	argument: <C extends Argument>(config: C) => Command<PrependTuple<A, C>, O, D>,
	option: <N extends string, C extends Option>(name: N, config: C) => Command<A, ExtendObj<O, N, C>, D>,
	action: <Act extends Action<A, O, VoidLike>>(action: Act) => Command<A, O, true>,
	exec: Action<A, O, ExecReturn<D>>,
};

/**
 * Returns a command object that can further be built upon with a chainable API
 */
export const command = <M extends Documented>(meta: M): Command<[], {}, false> => {
	let met: Documented = meta;
	const args: Args = [];
	const options: Opts = {};
	let action: Action<Args, Opts, VoidLike>;

	let commandRef;
	const command: Command<[], {}, false> = {
		getMeta: () => met,
		getArguments: () => args as any,
		getOptions: () => options,
		meta: m => { met = m; return commandRef; },
		argument: config => { args.push(config); return commandRef; },
		option: (name, config) => { options[name] = config; return commandRef; },
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
