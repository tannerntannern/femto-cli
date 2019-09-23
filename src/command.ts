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
	exec: Action<Arg, Opt, true extends D ? VoidLike : never>,
	getMeta: () => Documentation<Meta>,
	getArguments: () => Arguments<Tup.Reverse<Arg>>,
	getOptions: () => Any.Compute<Options<Opt>>,
};

const validateArguments = <Confs extends ArgumentConfigs>(
	args: Arguments<Confs>,
	argValues: ArgumentTypes<Confs>,
) => {
	// TODO: ...
};

const validateOptions = (options: Options<OptionConfigs>, optionValues: OptionTypes<OptionConfigs>) => {
	for (let key of Object.getOwnPropertyNames(options)) {
		const option = options[key];
		const optionValue = optionValues[key];
		const typeofOptionValue = typeof optionValue;

		if (typeofOptionValue === 'undefined') {
			if (option.required) {
				throw new Error(`No value supplied for required option "${key}"`);
			} else {
				continue;
			}
		}

		if (typeofOptionValue !== option.type) {
			throw new Error(`Invalid value "${optionValue}" for option "${key}: Expected ${option.type} but got ${typeofOptionValue}`);
		}
	}
};

/**
 * Returns a command object that can further be built upon with a chainable API
 */
export const command = <Meta extends DocumentationConfig>(meta: Meta) => {
	let _met: any = makeDocumentation(meta);
	const _args = [];
	const _options: any = {};
	let _action;

	let commandRef;
	const command: Command<Meta, [], {}, false> = {
		getMeta: () => _met,
		getArguments: () => _args as any,
		getOptions: () => _options,
		meta: m => { _met = makeDocumentation(m); return commandRef; },
		argument: config => { _args.push(makeArgument(config)); return commandRef; },
		option: (name, config) => { _options[name] = makeOption(config); return commandRef; },
		action: a => { _action = a; return commandRef; },
		// @ts-ignore: this is fine
		exec: ({ args, options }) => {
			if (!_action) throw new Error('Command not implemented');
			validateArguments(_args, args);
			validateOptions(_options, options);

			return _action(...args);
		}
	};

	commandRef = command;
	return command;
};
