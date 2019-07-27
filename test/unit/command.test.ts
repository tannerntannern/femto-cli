import { describe, it, afterEach } from 'mocha';
import { expect } from 'chai';
import { spy } from 'sinon';

import { command } from '../../src';

describe('command()', () => {
	describe('typical use case', () => {
		let orderSpy = spy();
		let order = command({ summary: 'Orders food for you' })
			.argument({ type: 'string', summary: 'pizza or cake' })
			.argument({ type: 'number', summary: 'how many you want' })
			.option('size', { type: 'string', summary: 'small, medium, or large' })
			.option('include-drink', { summary: 'throw in a drink' })
			.action(orderSpy);

		afterEach(() => orderSpy.resetHistory());

		it('should report meta properly', () => {
			expect(order.getMeta().summary).to.equal('Orders food for you');
		});

		it('should report argument definitions properly', () => {
			expect(order.getArguments()).to.deep.equal([
				{ type: 'string', summary: 'pizza or cake' },
				{ type: 'number', summary: 'how many you want' }
			]);
		});

		it('should report option definitions properly', () => {
			expect(order.getOptions()).to.deep.equal({
				'size': { type: 'string', summary: 'small, medium, or large' },
				'include-drink': { summary: 'throw in a drink' }
			});
		});

		it('should call the action with the proper arguments', () => {
			order.exec({ size: 'large', 'include-drink': true }, 'pizza', 3);

			expect(orderSpy.calledOnceWithExactly({ size: 'large', 'include-drink': true }, 'pizza', 3)).to.be.true;
		});
	});
});
