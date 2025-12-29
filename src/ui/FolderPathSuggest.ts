import { AbstractInputSuggest, App, TFolder } from 'obsidian';

/**
 * Provides autocomplete suggestions for folder paths
 * Shows all folders in the vault and filters based on user input
 */
export class FolderPathSuggest extends AbstractInputSuggest<TFolder> {
	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);
	}

	/**
	 * Get suggestions based on the current query
	 * @param query The current input value
	 * @returns Array of TFolder objects that match the query
	 */
	protected getSuggestions(query: string): TFolder[] {
		// Get all folders in the vault
		const allFolders = this.getAllFolders();

		if (!query) {
			// Show all folders when no query
			return allFolders;
		}

		const lowerQuery = query.toLowerCase();

		// Filter folders that match the query (case-insensitive)
		return allFolders.filter(folder =>
			folder.path.toLowerCase().includes(lowerQuery)
		);
	}

	/**
	 * Gets all folders in the vault
	 * @returns Array of TFolder objects
	 */
	private getAllFolders(): TFolder[] {
		const folders: TFolder[] = [];
		const allFiles = this.app.vault.getAllLoadedFiles();

		for (const file of allFiles) {
			if (file instanceof TFolder) {
				folders.push(file);
			}
		}

		return folders;
	}

	/**
	 * Render a suggestion item in the dropdown
	 * @param folder The folder to render
	 * @param el The HTML element to render into
	 */
	renderSuggestion(folder: TFolder, el: HTMLElement): void {
		el.createEl('div', { text: folder.path, cls: 'folder-path-suggestion' });
	}

	/**
	 * Handle selection of a suggestion
	 * @param folder The selected folder
	 * @param evt The mouse or keyboard event that triggered the selection
	 */
	selectSuggestion(folder: TFolder, evt: MouseEvent | KeyboardEvent): void {
		this.setValue(folder.path);
		this.close();
	}
}
