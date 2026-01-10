import { Vault, normalizePath } from 'obsidian';

/**
 * Ensures a folder exists in the vault, creating it if necessary
 * @param vault The Obsidian vault instance
 * @param folderPath The path to the folder (empty string for root)
 */
export async function ensureFolderExists(vault: Vault, folderPath: string): Promise<void> {
	if (folderPath === '') return; // Root always exists

	const normalizedPath = normalizePath(folderPath);
	const exists = vault.getAbstractFileByPath(normalizedPath);

	if (!exists) {
		await vault.createFolder(normalizedPath);
	}
}

/**
 * Gets a unique filename by appending a number if the file already exists
 * @param vault The Obsidian vault instance
 * @param baseFolder The folder where the file will be created
 * @param baseName The base name for the file (without extension)
 * @param extension The file extension (default: 'md')
 * @returns A unique file path
 */
export function getUniqueFilename(
	vault: Vault,
	baseFolder: string,
	baseName: string,
	extension: string = 'md'
): string {
	let filename = `${baseName}.${extension}`;
	let path = normalizePath(`${baseFolder}/${filename}`);

	// Handle root folder case
	if (baseFolder === '') {
		path = normalizePath(filename);
	}

	let counter = 1;

	while (vault.getAbstractFileByPath(path)) {
		filename = `${baseName} ${counter}.${extension}`;
		if (baseFolder === '') {
			path = normalizePath(filename);
		} else {
			path = normalizePath(`${baseFolder}/${filename}`);
		}
		counter++;
	}

	return path;
}

/**
 * Validates that a template file exists
 * @param vault The Obsidian vault instance
 * @param templatePath The path to the template file
 * @returns True if the template exists, false otherwise
 */
export function validateTemplate(vault: Vault, templatePath: string): boolean {
	const normalizedPath = normalizePath(templatePath);
	const file = vault.getAbstractFileByPath(normalizedPath);
	return file !== null;
}
