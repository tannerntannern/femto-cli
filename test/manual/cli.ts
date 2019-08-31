import { program, command } from '../../src';

const foo = command({ summary: 'does foo stuff' });

const prog = program({
	foo
});

prog.parse(process.argv.slice(2));
