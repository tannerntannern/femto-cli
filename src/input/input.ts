import { Any } from 'ts-toolbelt';
import { DocumentationConfig, documentationDefaults } from './documentation';
import { Config, config } from './config';

export type TypeMap = {
	'boolean': boolean,
	'string': string,
	'number': number,
};

export type InputType = keyof TypeMap;

export type InputConfig = Any.Compute<
	DocumentationConfig & { required?: boolean }
>;

export const inputDefaults = {
	...documentationDefaults,
	required: false as false,
};

export type Input<Conf extends InputConfig> = Config<InputConfig, typeof inputDefaults, Conf>;

export const makeInput = config<InputConfig>()(inputDefaults);
