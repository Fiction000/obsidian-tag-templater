import { App, Notice, TFile, normalizePath } from 'obsidian';
import { TagConfig, TagTemplaterSettings } from './types';
import { sanitizeFilename, removeTagsFromLine } from './utils/sanitizer';
import { ensureFolderExists, getUniqueFilename, validateTemplate } from './utils/fileUtils';
import { createTemplateContext, substituteVariables } from './utils/templateVariables';

export class NoteCreator {
	constructor(private app: App, private settings: TagTemplaterSettings) {}

	/**
	 * Gets the target folder for a tag configuration
	 * @param tagConfig The tag configuration
	 * @returns The folder path to use
	 */
	private getTargetFolder(tagConfig: TagConfig): string {
		if (tagConfig.outputFolder && tagConfig.outputFolder.trim() !== '') {
			return tagConfig.outputFolder;
		}

		if (this.settings.defaultOutputFolder &&
			this.settings.defaultOutputFolder.trim() !== '') {
			return this.settings.defaultOutputFolder;
		}

		return ''; // Root of vault
	}

	/**
	 * Creates a note from a template based on a tag configuration
	 * @param tagConfig The tag configuration to use
	 * @param lineContent The line content that triggered the creation
	 * @param sourceFile The file where the tag was added
	 * @returns The created file, or null if creation failed
	 */
	public async createNoteFromTag(
		tagConfig: TagConfig,
		lineContent: string,
		sourceFile: TFile
	): Promise<TFile | null> {
		// Validate template exists
		if (!validateTemplate(this.app.vault, tagConfig.templatePath)) {
			if (this.settings.enableNotifications) {
				new Notice(`template not found: ${tagConfig.templatePath}`);
			}
			return null;
		}

		// Extract filename from line content
		const lineWithoutTags = removeTagsFromLine(lineContent);
		const sanitizedName = sanitizeFilename(lineWithoutTags);
		const finalName = sanitizedName + tagConfig.filenameSuffix;

		// Get target folder
		const targetFolder = this.getTargetFolder(tagConfig);

		// Ensure folder exists
		try {
			await ensureFolderExists(this.app.vault, targetFolder);
		} catch (error) {
			if (this.settings.enableNotifications) {
				new Notice(`Failed to create folder: ${targetFolder}`);
			}
			console.error('Failed to create folder:', error);
			return null;
		}

		// Get unique filename
		const uniquePath = getUniqueFilename(
			this.app.vault,
			targetFolder,
			finalName,
			'md'
		);

		// Read template content
		const abstractFile = this.app.vault.getAbstractFileByPath(
			normalizePath(tagConfig.templatePath)
		);

		if (!(abstractFile instanceof TFile)) {
			if (this.settings.enableNotifications) {
				new Notice(`template is not a file: ${tagConfig.templatePath}`);
			}
			return null;
		}

		const templateFile = abstractFile;

		const templateContent = await this.app.vault.read(templateFile);

		// Create template context
		const context = createTemplateContext(
			lineWithoutTags,
			tagConfig.tagName,
			finalName,
			sourceFile
		);

		// Substitute variables
		const processedContent = substituteVariables(templateContent, context);

		// Create the new file
		try {
			const newFile = await this.app.vault.create(uniquePath, processedContent);

			// Show notification on success if enabled
			if (this.settings.enableNotifications) {
				new Notice(`created note: ${newFile.basename}`);
			}

			return newFile;
		} catch (error) {
			if (this.settings.enableNotifications) {
				new Notice(`Failed to create note: ${finalName}`);
			}
			console.error('Failed to create note:', error);
			return null;
		}
	}

	/**
	 * Finds the first matching tag configuration for a list of tags
	 * @param tags Array of tag names to check
	 * @returns The first matching enabled tag configuration, or null
	 */
	public findMatchingConfig(tags: string[]): TagConfig | null {
		for (const tag of tags) {
			const config = this.settings.tagConfigs.find(
				c => c.enabled && c.tagName === tag
			);
			if (config) {
				return config;
			}
		}
		return null;
	}
}
