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

export interface ProcessedLineInfo {
	content: string;           // The line content when tags were processed
	processedTags: Set<string>; // Tags that have been processed on this line
}

export interface TagStateEntry {
	/**
	 * Map of line numbers to processed line information
	 *
	 * Each entry stores:
	 * - The line content when tags were processed
	 * - The set of tags that have been processed
	 *
	 * When line content changes, the processed tags are cleared to allow reprocessing.
	 * This handles cases where:
	 * - A line is deleted and new content is added on the same line number
	 * - A line is edited to contain completely different content
	 *
	 * IMPORTANT: Line numbers can shift when lines are inserted/deleted above.
	 * This means:
	 * - If a line is processed at line 5, then a new line is inserted at line 3,
	 *   the original line 5 is now at line 6, but the state still tracks it as line 5
	 * - This could cause the tag to trigger again when editing the shifted line
	 * - This is an acceptable limitation as the debouncing mechanism prevents
	 *   rapid duplicate triggers
	 */
	processedLines: Map<number, ProcessedLineInfo>;
	lastModified: number;
}
