/**
 * Parses an SVG string into an SVG Document or Element.
 * @param {string} svgText - The raw SVG string.
 * @returns {Document|null} - The parsed document, or null on failure.
 */
export function parseSvgString(svgText) {
	if (!svgText) return null;
	try {
		const parser = new DOMParser();
		const doc = parser.parseFromString(svgText, 'image/svg+xml');
		const errorNode = doc.querySelector('parsererror');
		if (errorNode) {
			console.error('SVG Parsing Error:', errorNode.textContent);
			return null;
		}
		return doc;
	} catch (err) {
		console.error('Error parsing SVG:', err);
		return null;
	}
}
