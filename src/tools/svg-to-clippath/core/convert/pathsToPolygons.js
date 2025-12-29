/**
 * Converts an SVG path string 'd' into a polygon (array of points).
 * Uses the browser's native SVGPathElement API for sampling.
 * @param {string} d - The path data string.
 * @param {object} options - Configuration options.
 * @param {number} [options.tolerance=1] - Sampling distance (pixels). Smaller = more points.
 * @param {number} [options.decimals=2] - Number of decimals to round to.
 * @returns {Array<[number, number]>} - Array of [x, y] coordinates.
 */
export function paths2polys(d, options = {}) {
	const { tolerance = 1, decimals = 2 } = options;

	// Create an in-memory path element to use the browser's geometry engine
	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path.setAttribute('d', d);

	const length = path.getTotalLength();
	const points = [];

	// Sample along the path
	const step = Math.max(0.1, tolerance);

	for (let i = 0; i <= length; i += step) {
		const point = path.getPointAtLength(i);
		points.push([
			Number(point.x.toFixed(decimals)),
			Number(point.y.toFixed(decimals)),
		]);
	}

	// Close loop
	if (length > 0) {
		const endPoint = path.getPointAtLength(length);
		points.push([
			Number(endPoint.x.toFixed(decimals)),
			Number(endPoint.y.toFixed(decimals)),
		]);
	}

	return points;
}

/**
 * Wrapper function that converts path data to polygons
 * @param {object} pathData - Path data object with 'd' property
 * @param {number} decimals - Number of decimal places
 * @returns {Array<Array<[number, number]>>} - Array of polygons
 */
export function pathsToPolygons(pathData, decimals = 2, tolerance = 1) {
	if (!pathData || !pathData.d) return [];
	const polygon = paths2polys(pathData.d, { decimals, tolerance });
	return [polygon];
}