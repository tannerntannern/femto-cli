import { describe, it } from 'mocha';
import { expect } from 'chai';

import { command } from '../../src';
import { resolveCommand } from '../../src/commands';

describe('resolveCommand()', () => {
	const commands = {
		_: command({ summary: 'a' }),
		sub1: {
			comm1: command({ summary: 'b' }),
			subSub1: {
				comm1: command({ summary: 'c' }),
				comm2: command({ summary: 'd' }),
			},
			subSub2: {
				_: command({ summary: 'e' }),
				comm1: command({ summary: 'f' }),
				comm2: command({ summary: 'g' }),
			}
		},
	};

	it('should resolve known commands', () => {
		expect(
			resolveCommand(commands, ['sub1', 'comm1'], '_').command
		).to.equal(commands.sub1.comm1);

		expect(
			resolveCommand(commands, ['sub1', 'subSub2', 'comm2'], '_').command
		).to.equal(commands.sub1.subSub2.comm2);
	});

	it('should resolve to root commands when no command is at end of path', () => {
		expect(
			resolveCommand(commands, [], '_').command
		).to.equal(commands._);

		expect(
			resolveCommand(commands, ['sub1', 'subSub2'], '_').command
		).to.equal(commands.sub1.subSub2._);
	});

	it('should throw an error when the path is invalid', () => {
		expect(() => resolveCommand(commands, ['apple', 'juice'], '_')).to.throw;
	});
	
	it('should resolve to a group when path doesn\'t end on a command and no root is available', () => {
		let resolution = resolveCommand(commands, ['sub1', 'subSub1'], '_');

		expect(resolution.command).to.equal(null);
		expect(resolution.context).to.equal(commands.sub1.subSub1);
	});
});
