import { O, T } from 'ts-toolbelt';
import { Command, IsCommand, isCommand } from './command';

export type Commands = {[command: string]: Commands | Command};

type GetCommand<
	Cmds extends object,
	Path extends string[],
	Root extends string,
	AtPath = O.Path<Cmds, Path>
> =
	AtPath extends never
		? null
		: IsCommand<AtPath> extends true
			? AtPath
			: Root extends keyof AtPath
				? AtPath[Root]
				: AtPath;


type CommandContext<Cmds extends object, Path extends string[], Root extends string> = {
	command: GetCommand<Cmds, Path, Root>,
	context: GetCommand<Cmds, T.Pop<Path>, Root>
};

export const resolveCommand = <
	Cmds extends object,
	Args extends string[],
	Root extends string
>(commands: Cmds, argv: Args, root: Root): CommandContext<Cmds, Args, Root> => {
	let prev: any = null;
	let curr: any = commands;
	let index = 0;
	while (index < argv.length) {
		let key = argv[index];
		if (!(key in curr)) throw new Error(`Command ${key} not found`);

		prev = curr;
		curr = curr[argv[index]];
		index ++;
	}

	if (isCommand(curr))
		return {
			command: curr as any,
			context: prev,
		};
	else if (root in curr && isCommand(curr[root]))
		return {
			command: curr[root],
			context: curr,
		};
	else
		return {
			command: null,
			context: curr,
		};
};

