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

type GetOptionKeysWithOptionality<Confs extends OptionConfigs, R extends boolean, O extends Options<Confs> = Options<Confs>> = {
	[K in keyof O]-?: R extends Any.Cast<O[K], {required: boolean}>['required'] ? K : never
}[keyof O];

export type OptionTypes<O extends OptionConfigs> = Obj.Merge<
	{ [K in GetOptionKeysWithOptionality<O, false>]+?: TypeMap[Any.Cast<Option<O[K]>, Option<OptionConfig>>['type']] },
	{ [K in GetOptionKeysWithOptionality<O, true>]-?: TypeMap[Any.Cast<Option<O[K]>, Option<OptionConfig>>['type']] }
>;
