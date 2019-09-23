// TODO: implement enum types!

import { A as Any, O as Obj, T as Tup } from 'ts-toolbelt';
import {
	ArgumentConfig,
	ArgumentConfigs,
	Argument,
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
	args: ArgumentTypes<Tup.Reverse<A>>,
	options: OptionTypes<O>,
}>) => R;

export type Command<
	Meta extends DocumentationConfig,
	Arg extends ArgumentConfigs,
	Opt extends OptionConfigs,
	HasAction extends boolean,
	CanAddReqArg extends boolean,
> = {
	meta: <M extends DocumentationConfig>(meta: M) =>
		Command<M, Arg, Opt, HasAction, CanAddReqArg>,
	argument: <C extends (true extends CanAddReqArg ? ArgumentConfig : ArgumentConfig & {required?: false})>(config: C) =>
		Command<Meta, Tup.Prepend<Arg, C>, Opt, HasAction, Any.Cast<Argument<C>, Argument<ArgumentConfig>>['required']>,
	option: <N extends string, C extends OptionConfig>(name: N, config: C) =>
		Command<Meta, Arg, Any.Compute<Opt & KeyPair<N, C>>, HasAction, CanAddReqArg>,
	action: <Act extends Action<Arg, Opt, VoidLike>>(action: Act) =>
		Command<Meta, Arg, Opt, true, CanAddReqArg>,

	exec: Action<Arg, Opt, true extends HasAction ? VoidLike : never>,
	getMeta: () => Documentation<Meta>,
	getArguments: () => Arguments<Tup.Reverse<Arg>>,
	getOptions: () => Any.Compute<Options<Opt>>,
};

const validateArguments = <Confs extends ArgumentConfigs>(args: Arguments<Confs>, argValues: ArgumentTypes<Confs>) => {
	for (let i = 0; i < args.length; i ++) {
		const num = i + 1;
		const arg = args[i];
		const argValue = argValues[i];
		const typeofArgValue = typeof argValue;

		if (typeofArgValue === 'undefined') {
			if (arg.required) {
				throw new Error(`No value supplied for required argument ${num}`);
			} else {
				// if we get here, we're at the end of the supplied argValues
				break;
			}
		}

		if (typeofArgValue !== arg.type) {
			throw new Error(`Invalid value for argument ${num}: Expected ${arg.type} but got ${typeofArgValue}`);
		}
	}
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
	const command: Command<Meta, [], {}, false, true> = {
		getMeta: () => _met,
		getArguments: () => _args as any,
		getOptions: () => _options,
		meta: m => { _met = makeDocumentation(m); return commandRef; },
		argument: config => { _args.push(makeArgument(config as any)); return commandRef; },
		option: (name, config) => { _options[name] = makeOption(config); return commandRef; },
		action: a => { _action = a; return commandRef; },
		// @ts-ignore: this is fine
		exec: ({ args, options }) => {
			if (!_action) throw new Error('Command not implemented');
			validateArguments(_args, args);
			validateOptions(_options, options);

			return _action({ args, options });
		}
	};

	commandRef = command;
	return command;
};
