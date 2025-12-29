/**
 * Extracts all path elements from an SVG document.
 * @param {Document} svgDoc - The parsed SVG document.
 * @returns {Array<{d: string, index: number, original: SVGPathElement}>}
 */
export function extractPaths(svgDoc) {
	if (!svgDoc) return [];
	const paths = Array.from(svgDoc.querySelectorAll('path'));
	return paths
		.map((path, index) => ({
			d: path.getAttribute('d') || '',
			index,
			id: path.getAttribute('id') || `path-${index}`,
			original: path,
		}))
		.filter((p) => p.d.trim().length > 0);
}
