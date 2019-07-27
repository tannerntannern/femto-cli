import { Argument, Option, Command } from './command';

type Commands = {
	[command: string]: Commands | Command<Argument[], {[key: string]: Option}, boolean>
};

export const program = (commands: Commands) => ({
	// TODO
});
