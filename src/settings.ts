import { TagTemplaterSettings } from './types';

export const DEFAULT_SETTINGS: TagTemplaterSettings = {
	tagConfigs: [],
	defaultOutputFolder: '',  // Empty string means root of vault
	enableNotifications: true,
	debounceDelay: 500  // milliseconds
};
