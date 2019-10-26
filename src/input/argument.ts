import { Any, O as Obj, S as Str, T as Tup } from 'ts-toolbelt';
import { Config, config } from './config';
import { InputType, TypeOf, InputConfig, inputDefaults } from './input';

export type ArgumentConfig = Obj.Merge<InputConfig, {}>;

export const argumentDefaults = {
	...inputDefaults,
	required: true as true,
	type: 'string' as 'string',
};

export type Argument<Conf extends ArgumentConfig> = Config<ArgumentConfig, typeof argumentDefaults, Conf>;

export const makeArgument = config<ArgumentConfig>()(argumentDefaults);

export type ArgumentConfigs = readonly ArgumentConfig[];

export type Arguments<Confs extends ArgumentConfigs> = {
	[I in keyof Confs]: Argument<Any.Cast<Confs[I], ArgumentConfig>>
};

type RequiredArgIndices<
	Confs extends ArgumentConfigs,
	R extends boolean,
	A extends Arguments<Confs> = Arguments<Confs>
> = {
	[K in keyof A]-?: R extends Any.Cast<A[K], {required: boolean}>['required'] ? K : never
}[number];

type _ArgumentTypes<
	Confs extends ArgumentConfigs,
	A extends Arguments<Confs> = Arguments<Confs>,
	Req extends string = Any.Cast<RequiredArgIndices<A, true>, string>,
	NonReq extends string = Any.Cast<RequiredArgIndices<A, false>, string>,
> = Any.Compute<
	{ [I in Req]-?: TypeOf<Any.Cast<A[Str.Format<I, 'n'>], {type: InputType}>['type']> }
	& { [I in NonReq]+?: TypeOf<Any.Cast<A[Str.Format<I, 'n'>], {type: InputType}>['type']> }
>;

// TODO: convert to tuple with optional values?
export type ArgumentTypes<Confs extends ArgumentConfigs> = _ArgumentTypes<Confs>;
