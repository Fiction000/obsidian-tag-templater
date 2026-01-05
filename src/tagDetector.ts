import { Editor, MarkdownView } from 'obsidian';
import { TagConfig, TagStateEntry, TAG_REGEX } from './types';

// Configuration constants for state cleanup
const MAX_LINES_PER_FILE = 1000; // Maximum lines to track per file
const STATE_CLEANUP_INTERVAL = 5 * 60 * 1000; // Cleanup every 5 minutes
const STATE_EXPIRY_TIME = 30 * 60 * 1000; // Remove state older than 30 minutes

export class TagDetector {
	private fileTagState: Map<string, TagStateEntry> = new Map();
	private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
	private cleanupTimer: NodeJS.Timeout | null = null;

	constructor() {
		// Start periodic cleanup to prevent memory leaks
		this.startPeriodicCleanup();
	}

	/**
	 * Starts periodic cleanup of stale state entries
	 */
	private startPeriodicCleanup(): void {
		this.cleanupTimer = setInterval(() => {
			this.cleanupStaleState();
		}, STATE_CLEANUP_INTERVAL);
	}

	/**
	 * Removes stale state entries that haven't been modified recently
	 */
	private cleanupStaleState(): void {
		const now = Date.now();
		const filesToRemove: string[] = [];

		for (const [filePath, stateEntry] of this.fileTagState.entries()) {
			// Remove files that haven't been modified in a while
			if (now - stateEntry.lastModified > STATE_EXPIRY_TIME) {
				filesToRemove.push(filePath);
			}
		}

		// Remove stale entries
		for (const filePath of filesToRemove) {
			this.fileTagState.delete(filePath);
		}
	}

	/**
	 * Enforces maximum line limit per file by removing oldest entries
	 */
	private enforceLineLimitForFile(stateEntry: TagStateEntry): void {
		if (stateEntry.processedLines.size > MAX_LINES_PER_FILE) {
			// Convert to array, sort by line number, and keep only recent entries
			const sortedLines = Array.from(stateEntry.processedLines.keys()).sort((a, b) => b - a);
			const linesToKeep = new Set(sortedLines.slice(0, MAX_LINES_PER_FILE));

			// Remove old entries
			for (const lineNum of stateEntry.processedLines.keys()) {
				if (!linesToKeep.has(lineNum)) {
					stateEntry.processedLines.delete(lineNum);
				}
			}
		}
	}

	/**
	 * Checks if a line is within frontmatter (YAML)
	 * @param editor The editor instance
	 * @param lineNumber The line number to check
	 * @returns True if the line is within frontmatter
	 */
	private isInFrontmatter(editor: Editor, lineNumber: number): boolean {
		// Check if we're in YAML frontmatter
		if (lineNumber === 0 && editor.getLine(0) === '---') {
			return true;
		}

		// Find frontmatter boundaries
		let inFrontmatter = false;
		let frontmatterEnd = -1;

		for (let i = 0; i <= lineNumber && i < editor.lineCount(); i++) {
			const line = editor.getLine(i);
			if (line === '---') {
				if (i === 0) {
					inFrontmatter = true;
				} else if (inFrontmatter) {
					frontmatterEnd = i;
					break;
				}
			}
		}

		return inFrontmatter && (frontmatterEnd === -1 || lineNumber <= frontmatterEnd);
	}

	/**
	 * Extracts tags from a line
	 * @param line The line to parse
	 * @returns Array of tag names (without the # prefix)
	 */
	private extractTagsFromLine(line: string): string[] {
		// Use shared regex pattern to match #tag or #nested/tag
		const tagRegex = new RegExp(TAG_REGEX.source, TAG_REGEX.flags);
		const tags: string[] = [];
		let match;

		while ((match = tagRegex.exec(line)) !== null) {
			const tagStartPos = match.index;

			// Check if tag is in inline code (backticks)
			if (!this.shouldIgnoreTag(line, tagStartPos)) {
				tags.push(match[1]);
			}
		}

		return tags;
	}

	/**
	 * Determines if a tag should be ignored based on context
	 * @param line The line containing the tag
	 * @param tagStartPos The position where the tag starts
	 * @returns True if the tag should be ignored
	 */
	private shouldIgnoreTag(line: string, tagStartPos: number): boolean {
		// Check if tag is within inline code
		const beforeTag = line.substring(0, tagStartPos);
		const afterTag = line.substring(tagStartPos);
		const backticksBefore = (beforeTag.match(/`/g) || []).length;
		const backticksAfter = (afterTag.match(/`/g) || []).length;

		// Odd number of backticks on each side means we're inside inline code
		if (backticksBefore % 2 === 1 && backticksAfter % 2 === 1) {
			return true;
		}

		// Check if in Obsidian comment
		const commentPattern = /%%.*?%%/g;
		let commentMatch;
		while ((commentMatch = commentPattern.exec(line)) !== null) {
			if (tagStartPos >= commentMatch.index &&
				tagStartPos < commentMatch.index + commentMatch[0].length) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Handles editor changes with debouncing
	 * @param editor The editor instance
	 * @param view The markdown view
	 * @param debounceDelay Delay in milliseconds
	 * @param callback Function to call when new tags are detected
	 */
	public async onEditorChange(
		editor: Editor,
		view: MarkdownView,
		debounceDelay: number,
		callback: (tags: string[], line: string, filePath: string) => Promise<string | null>
	): Promise<void> {
		const filePath = view.file?.path;
		if (!filePath) return;

		// Clear existing debounce timer
		if (this.debounceTimers.has(filePath)) {
			clearTimeout(this.debounceTimers.get(filePath)!);
		}

		// Set new debounce timer
		const timer = setTimeout(async () => {
			await this.processEditorChange(editor, view, callback);
		}, debounceDelay);

		this.debounceTimers.set(filePath, timer);
	}

	/**
	 * Processes an editor change to detect new tags
	 * @param editor The editor instance
	 * @param view The markdown view
	 * @param callback Function to call when new tags are detected
	 */
	private async processEditorChange(
		editor: Editor,
		view: MarkdownView,
		callback: (tags: string[], line: string, filePath: string) => Promise<string | null>
	): Promise<void> {
		const filePath = view.file?.path;
		if (!filePath) return;

		const cursor = editor.getCursor();
		const currentLine = editor.getLine(cursor.line);

		// Check if we're in frontmatter
		if (this.isInFrontmatter(editor, cursor.line)) {
			return;
		}

		// Extract tags from current line
		const currentTags = this.extractTagsFromLine(currentLine);

		if (currentTags.length === 0) {
			return;  // No tags to process
		}

		// Get or initialize state for this file
		let stateEntry = this.fileTagState.get(filePath);
		if (!stateEntry) {
			stateEntry = {
				processedLines: new Map(),
				lastModified: Date.now()
			};
			this.fileTagState.set(filePath, stateEntry);
		}

		// Get tags already processed on this specific line
		// NOTE: Line numbers can shift when lines are inserted/deleted above, which may
		// cause tags to trigger again. This is an acceptable limitation mitigated by debouncing.
		const lineNumber = cursor.line;
		const processedTagsOnLine = stateEntry.processedLines.get(lineNumber) || new Set<string>();

		// Find new tags (tags not yet processed on this line)
		const newTags = currentTags.filter(tag => !processedTagsOnLine.has(tag));

		if (newTags.length > 0) {
			// Call the callback and wait for the processed tag
			const processedTag = await callback(newTags, currentLine, filePath);

			// Only mark the tag that was actually processed
			if (processedTag) {
				const updatedTagsForLine = new Set([...processedTagsOnLine, processedTag]);
				stateEntry.processedLines.set(lineNumber, updatedTagsForLine);
				stateEntry.lastModified = Date.now();

				// Enforce line limit to prevent memory bloat
				this.enforceLineLimitForFile(stateEntry);
			}
		}
	}

	/**
	 * Clears all state and timers
	 */
	public cleanup(): void {
		// Clear periodic cleanup timer
		if (this.cleanupTimer) {
			clearInterval(this.cleanupTimer);
			this.cleanupTimer = null;
		}

		// Clear all debounce timers
		for (const timer of this.debounceTimers.values()) {
			clearTimeout(timer);
		}
		this.debounceTimers.clear();

		// Clear tag state
		this.fileTagState.clear();
	}

	/**
	 * Clears state for a specific file
	 * @param filePath The path of the file to clear
	 */
	public clearFileState(filePath: string): void {
		this.fileTagState.delete(filePath);
		if (this.debounceTimers.has(filePath)) {
			clearTimeout(this.debounceTimers.get(filePath)!);
			this.debounceTimers.delete(filePath);
		}
	}
}
