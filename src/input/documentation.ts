import { Config, config } from './config';

export type DocumentationConfig = { summary: string, description?: string };

export const documentationDefaults = { description: null as null };

export type Documentation<Conf extends DocumentationConfig> =
	Config<DocumentationConfig, typeof documentationDefaults, Conf>;

export const makeDocumentation = config<DocumentationConfig>()(documentationDefaults);
