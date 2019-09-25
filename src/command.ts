import { A as Any, T as Tup } from 'ts-toolbelt';
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
	Option,
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

const validateValue = <Conf extends Argument<ArgumentConfig> | Option<OptionConfig>>(conf: Conf, val: unknown, name: string) => {
	const typeofVal = typeof val;

	if (typeofVal === 'undefined' && conf.required)
		throw new Error(`No value supplied for ${name}`);

	if (conf.type instanceof Array && !(conf.type as any[]).includes(val))
		throw new Error(`The ${name} must be one of the following: ${conf.type.join(', ')}`);

	if (!(conf.type instanceof Array) && typeofVal !== conf.type)
		throw new Error(`Invalid value for ${name}: Expected ${conf.type} but got ${typeofVal}`);

	return true;
};

const validateArguments = <Confs extends ArgumentConfigs>(args: Arguments<Confs>, argValues: ArgumentTypes<Confs>) =>
	args.forEach((arg, i) => validateValue(arg, argValues[i], `argument ${i + 1}`));

const validateOptions = (options: Options<OptionConfigs>, optionValues: OptionTypes<OptionConfigs>) =>
	Object.keys(options).forEach(key => validateValue(options[key], optionValues[key], `option ${key}`));

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
