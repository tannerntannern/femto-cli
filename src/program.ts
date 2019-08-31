import { green, yellow, cyan } from 'kleur';
import { Command } from './command';
import { resolveCommand } from './commands';
import { inputErrorHandler } from './handlers';

type ProgramConfig = {
	rootCommandKey?: string,
	autoInsertHelpOption?: boolean,
	inputErrorHandler?: (err: Error) => void,
};

const makeProgramConfig = (conf?: ProgramConfig): Required<ProgramConfig> => Object.assign({
	rootCommandKey: '_',
	autoInsertHelpOption: true,
	inputErrorHandler
}, conf);

const printCommandHelp = (path: string[]) => {
	// TODO: ...
};

const process = (args: string[], command: Command, config: Required<ProgramConfig>) => {
	// TODO: ...
};

const parse = (argv: string[], commands: object, config: Required<ProgramConfig>) => {
	try {
		const cmdContext = resolveCommand(commands, argv, config.rootCommandKey);
		// TODO: ...
	} catch (e) {
		config.inputErrorHandler(e);
	}
};

export const program = (commands: object, conf?: ProgramConfig) => {
	const config = makeProgramConfig(conf);

	return {
		parse: (argv: string[]) => parse(argv, commands, config),
	};
};
