import { red } from 'kleur';

export const inputErrorHandler = (error: Error) => {
	console.log(red(error.message));
};
