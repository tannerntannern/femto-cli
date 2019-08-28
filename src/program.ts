import { Command } from './command';
import { Commands, resolveCommand } from './commands';

type ProgramConfig = {
	rootCommandKey?: string,
	autoInsertHelpOption?: boolean,
};

const makeProgramConfig = (conf?: ProgramConfig): Required<ProgramConfig> => Object.assign({
	rootCommandKey: '_',
	autoInsertHelpOption: true,
}, conf);

const printCommandHelp = (path: string[], command: Command) => {
	// TODO: ...
};

const process = (args: string[], command: Command, config: Required<ProgramConfig>) => {
	// TODO: ...
};

const parse = (argv: string[], commands: Commands, config: Required<ProgramConfig>) => {
	// TODO: ...
};

export const program = (commands: Commands, conf?: ProgramConfig) => {
	const config = makeProgramConfig(conf);

	return {
		parse: (argv: string[]) => parse(argv, commands, config),
	};
};
