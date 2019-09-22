// TODO: implement enum types!

import { A as Any, T as Tup } from 'ts-toolbelt';
import {
	ArgumentConfig,
	ArgumentConfigs,
	Arguments,
	ArgumentTypes,
	makeArgument,
	DocumentationConfig,
	Documentation,
	makeDocumentation,
	OptionConfig,
	OptionConfigs,
	Options,
	OptionTypes,
	makeOption,
} from './input';

type KeyPair<Key extends string, Val extends any> = {[K in Key]: Val};

type VoidLike = void | Promise<void>;
type Action<A extends ArgumentConfigs, O extends OptionConfigs, R> = (inputs: Any.Compute<{
	args: Tup.Reverse<ArgumentTypes<A>>,
	options: OptionTypes<O>,
}>) => R;

type ExecReturn<D extends boolean> = true extends D ? VoidLike : never;

export type Command<
	Meta extends DocumentationConfig,
	Arg extends ArgumentConfigs,
	Opt extends OptionConfigs,
	D extends boolean = boolean
> = {
	meta: <M extends DocumentationConfig>(meta: M) => Command<M, Arg, Opt, D>,
	argument: <C extends ArgumentConfig>(config: C) => Command<Meta, Tup.Prepend<Arg, C>, Opt, D>,
	option: <N extends string, C extends OptionConfig>(name: N, config: C) => Command<Meta, Arg, Any.Compute<Opt & KeyPair<N, C>>, D>,
	action: <Act extends Action<Arg, Opt, VoidLike>>(action: Act) => Command<Meta, Arg, Opt, true>,
	exec: Action<Arg, Opt, ExecReturn<D>>,
	getMeta: () => Documentation<Meta>,
	getArguments: () => Arguments<Tup.Reverse<Arg>>,
	getOptions: () => Any.Compute<Options<Opt>>,
};

/**
 * Returns a command object that can further be built upon with a chainable API
 */
export const command = <Meta extends DocumentationConfig>(meta: Meta) => {
	let met: any = makeDocumentation(meta);
	const args = [];
	const options: any = {};
	let action;

	let commandRef;
	const command: Command<Meta, [], {}, false> = {
		getMeta: () => met,
		getArguments: () => args as any,
		getOptions: () => options,
		meta: m => { met = makeDocumentation(m); return commandRef; },
		argument: config => { args.push(makeArgument(config)); return commandRef; },
		option: (name, config) => { options[name] = makeOption(config); return commandRef; },
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
