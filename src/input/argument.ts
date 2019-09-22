import { Any, O as Obj } from 'ts-toolbelt';
import { Config, config } from './config';
import { InputType, TypeMap, InputConfig, inputDefaults } from './input';

type ArgumentType = Exclude<InputType, 'boolean'>;

export type ArgumentConfig = Obj.Merge<InputConfig, { type?: ArgumentType }>;

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

// TODO: implement required
export type ArgumentTypes<L extends ArgumentConfigs> = {
	[I in keyof L]: TypeMap[
		Any.Cast<
			'type' extends keyof L[I] ? L[I] : typeof argumentDefaults,
			{ type: ArgumentType }
		>['type']
	]
};