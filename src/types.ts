// Shared regex pattern for tag matching across all modules
// Matches tags like #todo, #project/urgent, #task_1
export const TAG_REGEX = /#([a-zA-Z0-9_/-]+)/g;

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
	/**
	 * Map of line numbers to sets of processed tags on each line
	 *
	 * IMPORTANT: Line numbers can shift when lines are inserted/deleted above.
	 * This means:
	 * - If a line is processed at line 5, then a new line is inserted at line 3,
	 *   the original line 5 is now at line 6, but the state still tracks it as line 5
	 * - This could cause the tag to trigger again when editing the shifted line
	 * - This is an acceptable limitation as the debouncing mechanism prevents
	 *   rapid duplicate triggers
	 *
	 * Alternative approaches considered:
	 * - Content hashing: Would fail when line content changes (which happens after link insertion)
	 * - Line anchors: Not available in Obsidian API
	 * - Perfect tracking: Would require monitoring all document edits (complex and performance-heavy)
	 */
	processedLines: Map<number, Set<string>>;
	lastModified: number;
}
