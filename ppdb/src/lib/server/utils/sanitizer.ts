import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

const { window } = new JSDOM('');
const DOMPurify = createDOMPurify(window as any);

/**
 * Sanitizes HTML strings to prevent XSS attacks.
 * @param html The dirty HTML string
 * @returns The clean HTML string
 */
export function sanitize(html: string): string {
	if (typeof html !== 'string') {
		return '';
	}
	return DOMPurify.sanitize(html);
}
