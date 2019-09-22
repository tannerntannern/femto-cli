import { A as Any, O as Obj } from 'ts-toolbelt';
import { Config, config } from './config';
import { InputConfig, InputType, TypeMap, inputDefaults } from './input';

type OptionType = InputType;

export type OptionConfig = Obj.Merge<InputConfig, {
	type?: OptionType,
	alias?: string
}>;

export const optionDefaults = {
	...inputDefaults,
	type: 'boolean' as 'boolean',
	// TODO: ...
	alias: null as null,
};

export type Option<Conf extends OptionConfig> = Config<OptionConfig, typeof optionDefaults, Conf>;

export const makeOption = config<OptionConfig>()(optionDefaults);

export type OptionConfigs = {[name: string]: OptionConfig};

export type Options<Confs extends OptionConfigs> = {
	[K in keyof Confs]: Option<Confs[K]>
};

// TODO: implement required
export type OptionTypes<O extends OptionConfigs> = Any.Compute<{
	[K in keyof O]: TypeMap[
		Any.Cast<
			'type' extends keyof O[K] ? O[K] : typeof optionDefaults,
			{ type: OptionType }
		>['type']
	]
}>;
