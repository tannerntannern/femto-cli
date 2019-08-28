import { O } from 'ts-toolbelt';
import { Command, IsCommand, isCommand } from './command';

export type Commands = {[command: string]: Commands | Command};

// TODO: make `Cmds extends Commands` possible without causing recursive depth problems
type _GetCommand<
	Cmds extends object,
	Path extends string[],
	Root extends string,
	AtPath = O.Path<Cmds, Path>
> =
	AtPath extends never
		? never
		: Root extends keyof AtPath
			? AtPath[Root]
			: IsCommand<AtPath> extends true
				? AtPath
				: never;

type GetCommand<Cmds extends object, Path extends string[], Root extends string> = _GetCommand<Cmds, Path, Root>;

export const resolveCommand = <
	Cmds extends object,
	Args extends string[],
	Root extends string
>(
	commands: Cmds,
	argv: Args,
	root: Root
): GetCommand<Cmds, Args, Root> => {
	let curr: any = commands;
	let index = 0;
	while (index < argv.length) {
		let key = argv[index];
		if (!(key in curr)) throw new Error(`Command ${key} not found`);

		curr = curr[argv[index]];
		index ++;
	}

	if (isCommand(curr))
		return curr as any;
	else if (root in curr && isCommand(curr[root]))
		return curr[root];
	else
		throw new Error(`Command ${argv[index]} not found`);
};

