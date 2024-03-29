import { describe, it, afterEach } from 'mocha';
import { expect } from 'chai';
import { spy } from 'sinon';

import { command } from '../../src';

describe('command()', () => {
	describe('typical use case', () => {
		let orderSpy = spy();
		let order = command({ summary: 'Orders food for you' })
			.argument({ type: <const>['pizza', 'cake'], summary: 'which food item' })
			.argument({ required: false, type: 'number', summary: 'how many you want' })
			.option('size', { type: <const>['small', 'medium', 'large'], required: true, summary: 'pizza/cake size' })
			.option('include-drink', { summary: 'throw in a drink' })
			.action(orderSpy);

		afterEach(() => orderSpy.resetHistory());

		it('should report meta properly', () => {
			expect(order.getMeta().summary).to.equal('Orders food for you');
		});

		it('should report argument definitions properly', () => {
			expect(order.getArguments()).to.deep.equal([
				{ required: true, type: ['pizza', 'cake'], summary: 'which food item', description: null },
				{ required: false, type: 'number', summary: 'how many you want', description: null }
			]);
		});

		it('should report option definitions properly', () => {
			expect(order.getOptions()).to.deep.equal({
				'size': { required: true, type: ['small', 'medium', 'large'], alias: null, summary: 'pizza/cake size', description: null },
				'include-drink': { required: false, type: 'boolean', alias: null, summary: 'throw in a drink', description: null }
			});
		});

		it('should call the action with the proper arguments', () => {
			order.exec({
				args: ['pizza', 3],
				options: { size: 'large', 'include-drink': true },
			});

			expect(orderSpy.getCall(0).args[0]).to.deep.equal({
				args: ['pizza', 3],
				options: { size: 'large', 'include-drink': true },
			});
		});

		it('should error when a required arg is missing', () => {
			expect(
				() => order.exec({
					// @ts-ignore
					args: [],
					options: { size: 'medium' }
				})
			).to.throw();
		});

		it('should error when an arg has the wrong type', () => {
			expect(
				() => order.exec({
					// @ts-ignore
					args: ['pizza', 'pizza'],
					options: { size: 'medium' }
				})
			).to.throw();
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
