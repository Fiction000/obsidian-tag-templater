export interface TagTemplaterSettings {
	tagConfigs: TagConfig[];
	defaultOutputFolder: string;
	enableNotifications: boolean;
	debounceDelay: number;
}

export interface TagConfig {
	tagName: string;           // e.g., "todo" or "todo/urgent"
	templatePath: string;      // e.g., "Templates/Todo.md"
	filenameSuffix: string;    // e.g., " - Todo"
	outputFolder: string;      // e.g., "Todos" (falls back to defaultOutputFolder if empty)
	enabled: boolean;
}

export interface TagStateEntry {
	processedLines: Map<number, Set<string>>;
	lastModified: number;
}
