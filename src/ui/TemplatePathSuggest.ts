import { AbstractInputSuggest, App, TFile, normalizePath } from 'obsidian';

/**
 * Provides autocomplete suggestions for template file paths
 * Shows all markdown files in the vault and filters based on user input
 */
export class TemplatePathSuggest extends AbstractInputSuggest<TFile> {
	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);
	}

	/**
	 * Get suggestions based on the current query
	 * @param query The current input value
	 * @returns Array of TFile objects that match the query
	 */
	protected getSuggestions(query: string): TFile[] {
		const allFiles = this.app.vault.getMarkdownFiles();

		if (!query) {
			// Show all markdown files when no query
			return allFiles;
		}

		const lowerQuery = query.toLowerCase();

		// Filter files that match the query (case-insensitive)
		return allFiles.filter(file =>
			file.path.toLowerCase().includes(lowerQuery)
		);
	}

	/**
	 * Render a suggestion item in the dropdown
	 * @param file The file to render
	 * @param el The HTML element to render into
	 */
	renderSuggestion(file: TFile, el: HTMLElement): void {
		el.createEl('div', { text: file.path, cls: 'template-path-suggestion' });
	}

	/**
	 * Handle selection of a suggestion
	 * @param file The selected file
	 * @param evt The mouse or keyboard event that triggered the selection
	 */
	selectSuggestion(file: TFile, evt: MouseEvent | KeyboardEvent): void {
		this.setValue(file.path);
		this.close();
	}
}

/**
 * Adds real-time validation indicator to a template path input field
 * Shows green border for valid paths, red border for invalid paths
 * @param app The Obsidian app instance
 * @param inputEl The input element to validate
 */
export function addValidationIndicator(
	app: App,
	inputEl: HTMLInputElement
): void {
	const validatePath = () => {
		const path = inputEl.value.trim();

		if (!path) {
			inputEl.removeClass('is-valid', 'is-invalid');
			return;
		}

		const file = app.vault.getAbstractFileByPath(normalizePath(path));
		const isValid = file !== null && file instanceof TFile;

		if (isValid) {
			inputEl.addClass('is-valid');
			inputEl.removeClass('is-invalid');
		} else {
			inputEl.addClass('is-invalid');
			inputEl.removeClass('is-valid');
		}
	};

	// Validate on input change
	inputEl.addEventListener('input', validatePath);

	// Initial validation
	validatePath();
}
