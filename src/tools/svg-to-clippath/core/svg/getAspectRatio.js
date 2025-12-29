/**
 * Calculates the aspect ratio of the SVG.
 * Priority: width/height attributes > viewBox > getBBox (requires text insertion).
 * @param {Document} svgDoc - The parsed SVG document.
 * @returns {number} - Aspect ratio (width / height).
 */
export function getAspectRatio(svgDoc) {
	if (!svgDoc) return 1;
	const svg = svgDoc.documentElement;

	// 1. Try width/height attributes
	let width = parseFloat(svg.getAttribute('width'));
	let height = parseFloat(svg.getAttribute('height'));

	if (!Number.isNaN(width) && !Number.isNaN(height) && height !== 0) {
		return width / height;
	}

	// 2. Try viewBox
	const viewBox = svg.getAttribute('viewBox');
	if (viewBox) {
		const [, , vbWidth, vbHeight] = viewBox.split(/[\s,]+/).map(parseFloat);
		if (!Number.isNaN(vbWidth) && !Number.isNaN(vbHeight) && vbHeight !== 0) {
			return vbWidth / vbHeight;
		}
	}

	// 3. User's custom formula:
	// "take larger side / 100, then smaller side / that / 100"
	// This results in min / max.
	const maxDim = Math.max(w, h);
	const minDim = Math.min(w, h);
	
	// Avoid division by zero
	if (maxDim === 0) return 1;

	const k = maxDim / 100;
	const ratio = (minDim / k) / 100; // This is minDim / maxDim

	// CSS aspect-ratio is width / height.
	// If width is the larger side (landscape), we need max / min = 1 / ratio.
	// If height is the larger side (portrait), we need min / max = ratio.
	// If square, ratio is 1.

	const cssAspectRatio = w >= h ? (1 / ratio) : ratio;
	
	return Number(cssAspectRatio.toFixed(5));
}