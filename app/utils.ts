import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names, resolving Tailwind conflicts (e.g. "p-2 p-4" -> "p-4").
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formats a file size in bytes to a human-readable string (KB, MB, GB)
 * @param bytes - The size in bytes
 * @returns A formatted string with the appropriate unit
 */
export function formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    // Determine the appropriate unit by calculating the log
    const i: number = Math.floor(Math.log(bytes) / Math.log(k));

    // Format with 2 decimal places and round
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const generateUUID = () => crypto.randomUUID();

/**
 * Scans text for every "{" and tries to parse the balanced
 * (matching-brace, string-aware) substring starting there, returning the
 * first one that parses as valid JSON. This survives arbitrary wrapper
 * text around the real JSON object — markdown fences, chain-of-thought
 * reasoning blocks, etc. — even when that wrapper text itself contains
 * brace-delimited but invalid JSON-like fragments (e.g. an LLM's
 * "thinking out loud" pseudo-code). Falls back to the raw trimmed text
 * if nothing balanced parses.
 */
export function extractValidJsonObject(text: string): string {
    for (
        let start = text.indexOf('{');
        start !== -1;
        start = text.indexOf('{', start + 1)
    ) {
        let depth = 0;
        let inString = false;
        let escaped = false;

        for (let i = start; i < text.length; i++) {
            const char = text[i];

            if (inString) {
                if (escaped) {
                    escaped = false;
                } else if (char === '\\') {
                    escaped = true;
                } else if (char === '"') {
                    inString = false;
                }
                continue;
            }

            if (char === '"') {
                inString = true;
            } else if (char === '{') {
                depth++;
            } else if (char === '}') {
                depth--;
                if (depth === 0) {
                    const candidate = text.slice(start, i + 1);
                    try {
                        JSON.parse(candidate);
                        return candidate;
                    } catch {
                        // Not valid JSON starting here (e.g. a pseudo-code
                        // fragment inside a reasoning block) — stop
                        // walking this candidate and try the next "{".
                        break;
                    }
                }
            }
        }
    }

    return text.trim();
}