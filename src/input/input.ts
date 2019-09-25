import { O as Obj } from 'ts-toolbelt';
import { DocumentationConfig, documentationDefaults } from './documentation';
import { Config, config } from './config';

type TypeMap = {
	'boolean': boolean,
	'string': string,
	'number': number,
};

export type InputType = keyof TypeMap | string[] | number[];

export type TypeOf<T extends InputType> = T extends keyof TypeMap ? TypeMap[T] : T[Exclude<keyof T, string>];

export type InputConfig = Obj.Merge<
	DocumentationConfig,
	// TODO: enum types just result in string[] or number[] with getArguments(), getOptions(), exec(), etc.
	{ type?: InputType, required?: boolean }
>;

export const inputDefaults = {
	...documentationDefaults,
	type: 'string' as 'string',
	required: false as false,
};

export type Input<Conf extends InputConfig> = Config<InputConfig, typeof inputDefaults, Conf>;

export const makeInput = config<InputConfig>()(inputDefaults);
