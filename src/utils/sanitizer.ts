import { TAG_REGEX } from '../types';

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
	sanitized = sanitized.replace(/[/\\:*?"<>|]/g, '-');

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
	// Remove tags using shared regex pattern
	const tagRegex = new RegExp(TAG_REGEX.source, TAG_REGEX.flags);
	return line.replace(tagRegex, '').trim();
}

/**
 * Checks if a tag at a specific position should be ignored based on context
 * @param line The line containing the tag
 * @param tagStartPos The position where the tag starts
 * @returns True if the tag should be ignored (in code or comments)
 */
export function shouldIgnoreTag(line: string, tagStartPos: number): boolean {
	// Check if tag is within inline code (backticks)
	const beforeTag = line.substring(0, tagStartPos);
	const afterTag = line.substring(tagStartPos);
	const backticksBefore = (beforeTag.match(/`/g) || []).length;
	const backticksAfter = (afterTag.match(/`/g) || []).length;

	// Odd number of backticks on each side means we're inside inline code
	if (backticksBefore % 2 === 1 && backticksAfter % 2 === 1) {
		return true;
	}

	// Check if in Obsidian comment (%% ... %%)
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
 * Extracts valid tags from a line (excluding tags in code or comments)
 * @param line The line to extract tags from
 * @returns Array of valid tag strings (including the # prefix)
 */
export function extractValidTags(line: string): string[] {
	const tagRegex = new RegExp(TAG_REGEX.source, TAG_REGEX.flags);
	const validTags: string[] = [];
	let match;

	while ((match = tagRegex.exec(line)) !== null) {
		const tagStartPos = match.index;

		// Only include tags that are not in code blocks or comments
		if (!shouldIgnoreTag(line, tagStartPos)) {
			validTags.push(match[0]); // match[0] includes the # prefix
		}
	}

	return validTags;
}
