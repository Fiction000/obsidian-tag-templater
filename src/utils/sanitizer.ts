/**
 * Sanitizes a string to be used as a valid filename across different platforms
 * @param input The raw filename string
 * @param maxLength Maximum length for the filename (default: 255)
 * @returns A sanitized filename safe for use across platforms
 */
export function sanitizeFilename(input: string, maxLength: number = 255): string {
	// Remove leading/trailing whitespace
	let sanitized = input.trim();

	// Remove or replace invalid characters: / \ : * ? " < > |
	sanitized = sanitized.replace(/[\/\\:*?"<>|]/g, '-');

	// Remove leading/trailing dots and dashes
	sanitized = sanitized.replace(/^[.-]+|[.-]+$/g, '');

	// Handle Windows reserved names
	const reservedNames = ['CON', 'PRN', 'AUX', 'NUL',
		'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
		'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];

	if (reservedNames.includes(sanitized.toUpperCase())) {
		sanitized = `_${sanitized}`;
	}

	// Truncate to max length
	if (sanitized.length > maxLength) {
		sanitized = sanitized.substring(0, maxLength);
	}

	// Fallback if empty
	return sanitized || 'Untitled';
}

/**
 * Removes all tags from a line of text
 * @param line The line containing tags
 * @returns The line with all tags removed
 */
export function removeTagsFromLine(line: string): string {
	// Remove tags in the format #tag or #nested/tag
	return line.replace(/#[\w/-]+/g, '').trim();
}
