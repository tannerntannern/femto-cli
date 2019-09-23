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
			.option('size', { type: 'string', required: true, summary: 'small, medium, or large' })
			.option('include-drink', { summary: 'throw in a drink' })
			.action(orderSpy);

		afterEach(() => orderSpy.resetHistory());

		it('should report meta properly', () => {
			expect(order.getMeta().summary).to.equal('Orders food for you');
		});

		it('should report argument definitions properly', () => {
			expect(order.getArguments()).to.deep.equal([
				{ required: false, type: 'string', summary: 'pizza or cake', description: null },
				{ required: false, type: 'number', summary: 'how many you want', description: null }
			]);
		});

		it('should report option definitions properly', () => {
			expect(order.getOptions()).to.deep.equal({
				'size': { required: false, type: 'string', alias: null, summary: 'small, medium, or large', description: null },
				'include-drink': { required: false, type: 'boolean', alias: null, summary: 'throw in a drink', description: null }
			});
		});

		it('should call the action with the proper arguments', () => {
			order.exec({
				options: { size: 'large', 'include-drink': true },
				args: ['pizza', 3]
			});

			expect(orderSpy.calledOnceWithExactly({
				options: { size: 'large', 'include-drink': true },
				args: ['pizza', 3],
			})).to.be.true;
		});

		it('should error when a required option is missing', () => {
			expect(
				() => order.exec({
					args: ['pizza', 3],
					// @ts-ignore
					options: {}
				})
			).to.throw();
		});

		it('should error when an option has the wrong value type', () => {
			expect(
				() => order.exec({
					args: ['pizza', 3],
					// @ts-ignore
					options: {size: 4}
				})
			).to.throw();
		});
	});
});
