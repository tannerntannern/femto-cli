import { Any, O as Obj } from 'ts-toolbelt';
import { Config, config } from './config';
import { InputType, TypeOf, InputConfig, inputDefaults } from './input';

export type ArgumentConfig = Obj.Merge<InputConfig, {}>;

export const argumentDefaults = {
	...inputDefaults,
	type: 'string' as 'string',
};

export type Argument<Conf extends ArgumentConfig> = Config<ArgumentConfig, typeof argumentDefaults, Conf>;

export const makeArgument = config<ArgumentConfig>()(argumentDefaults);

export type ArgumentConfigs = ArgumentConfig[];

export type Arguments<Confs extends ArgumentConfigs> = {
	[I in keyof Confs]: Argument<Any.Cast<Confs[I], ArgumentConfig>>
};

// TODO: can this be used?
type _ArgumentType<
	C extends ArgumentConfig,
	_A extends Argument<ArgumentConfig> = Any.Cast<Argument<C>, Argument<ArgumentConfig>>
> = true extends _A['required']
	? [TypeOf<_A['type']>]
	: [TypeOf<_A['type']>?];

// TODO: implement required
export type ArgumentTypes<L extends ArgumentConfigs> = {
	[I in keyof L]: TypeOf<
		Any.Cast<
			'type' extends keyof L[I] ? L[I] : typeof argumentDefaults,
			{ type: InputType }
		>['type']
	>
};
