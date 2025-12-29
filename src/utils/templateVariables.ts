import { TFile } from 'obsidian';

export interface TemplateContext {
	date: string;
	time: string;
	datetime: string;
	line: string;
	tag: string;
	filename: string;
	source: string;
}

/**
 * Creates a template context from the current state
 * @param lineContent The original line content without tags
 * @param tagName The tag that triggered the note creation
 * @param filename The generated filename for the new note
 * @param sourceFile The source file where the tag was added
 * @returns A TemplateContext object with all variable values
 */
export function createTemplateContext(
	lineContent: string,
	tagName: string,
	filename: string,
	sourceFile: TFile
): TemplateContext {
	const now = new Date();

	return {
		date: formatDate(now),
		time: formatTime(now),
		datetime: formatDateTime(now),
		line: lineContent,
		tag: tagName,
		filename: filename,
		source: sourceFile.basename
	};
}

/**
 * Substitutes template variables with actual values
 * @param templateContent The template content with variable placeholders
 * @param context The context containing values for substitution
 * @returns The template content with all variables replaced
 */
export function substituteVariables(
	templateContent: string,
	context: TemplateContext
): string {
	let result = templateContent;

	// Replace each variable
	result = result.replace(/\{\{date\}\}/g, context.date);
	result = result.replace(/\{\{time\}\}/g, context.time);
	result = result.replace(/\{\{datetime\}\}/g, context.datetime);
	result = result.replace(/\{\{line\}\}/g, context.line);
	result = result.replace(/\{\{tag\}\}/g, context.tag);
	result = result.replace(/\{\{filename\}\}/g, context.filename);
	result = result.replace(/\{\{source\}\}/g, context.source);

	return result;
}

/**
 * Formats a date as YYYY-MM-DD
 * @param date The date to format
 * @returns Formatted date string
 */
function formatDate(date: Date): string {
	return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Formats a time as HH:MM
 * @param date The date to extract time from
 * @returns Formatted time string
 */
function formatTime(date: Date): string {
	return date.toTimeString().slice(0, 5); // HH:MM
}

/**
 * Formats a date and time as YYYY-MM-DD HH:MM
 * @param date The date to format
 * @returns Formatted datetime string
 */
function formatDateTime(date: Date): string {
	return `${formatDate(date)} ${formatTime(date)}`;
}
