import { Editor, MarkdownView, Plugin, TFile } from 'obsidian';
import { TagTemplaterSettings } from './src/types';
import { DEFAULT_SETTINGS } from './src/settings';
import { TagTemplaterSettingTab } from './src/settingsTab';
import { TagDetector } from './src/tagDetector';
import { NoteCreator } from './src/noteCreator';
import { removeTagsFromLine } from './src/utils/sanitizer';

export default class TagTemplaterPlugin extends Plugin {
	settings: TagTemplaterSettings;
	private tagDetector: TagDetector;
	private noteCreator: NoteCreator;

	async onload() {
		await this.loadSettings();

		// Initialize services
		this.tagDetector = new TagDetector();
		this.noteCreator = new NoteCreator(this.app, this.settings);

		// Register editor-change event
		this.registerEvent(
			this.app.workspace.on('editor-change', (editor: Editor, view: MarkdownView) => {
				this.handleEditorChange(editor, view);
			})
		);

		// Register file deletion event to clean up state
		this.registerEvent(
			this.app.vault.on('delete', (file) => {
				if (file instanceof TFile) {
					this.tagDetector.clearFileState(file.path);
				}
			})
		);

		// Add settings tab
		this.addSettingTab(new TagTemplaterSettingTab(this.app, this));

		console.log('Tag Templater plugin loaded');
	}

	onunload() {
		// Clean up tag detector state and timers
		this.tagDetector.cleanup();
		console.log('Tag Templater plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// Update note creator with new settings
		this.noteCreator = new NoteCreator(this.app, this.settings);
	}

	/**
	 * Handles editor change events
	 * @param editor The editor instance
	 * @param view The markdown view
	 */
	private handleEditorChange(editor: Editor, view: MarkdownView): void {
		this.tagDetector.onEditorChange(
			editor,
			view,
			this.settings.debounceDelay,
			async (newTags: string[], lineContent: string, filePath: string) => {
				// Find the first matching tag configuration
				const matchingConfig = this.noteCreator.findMatchingConfig(newTags);

				if (matchingConfig && view.file) {
					// Store the current cursor position
					const cursor = editor.getCursor();
					const lineNumber = cursor.line;

					// Create note from the matching tag
					const createdFile = await this.noteCreator.createNoteFromTag(
						matchingConfig,
						lineContent,
						view.file
					);

					// If note was created successfully, replace the line with a link
					if (createdFile) {
						// Extract all tags from the line
						const tagMatches = lineContent.match(/#[\w/-]+/g) || [];
						const tags = tagMatches.join(' ');

						// Create link to the new note
						const link = `[[${createdFile.basename}]]`;

						// Construct new line: link followed by tags (if any)
						const newLine = tags ? `${link} ${tags}` : link;

						// Replace the line
						editor.setLine(lineNumber, newLine);

						// Move cursor to end of line
						editor.setCursor({
							line: lineNumber,
							ch: newLine.length
						});
					}
				}
			}
		);
	}
}
