/**
 * Normalizes an array of points to a [0, 1] range based on their bounding box.
 * @param {Array<[number, number]>} points - Array of [x, y] points.
 * @param {number} decimals - Number of decimal places.
 * @returns {string} - String of "x,y x,y" normalized coordinates.
 */
export function normalizePoints(points, decimals = 3) {
	if (!points || points.length === 0) return '';

	// Calculate BBox of the points
	let minX = Infinity,
		maxX = -Infinity,
		minY = Infinity,
		maxY = -Infinity;

	points.forEach(([x, y]) => {
		if (x < minX) minX = x;
		if (x > maxX) maxX = x;
		if (y < minY) minY = y;
		if (y > maxY) maxY = y;
	});

	const width = maxX - minX;
	const height = maxY - minY;

	// Avoid division by zero
	const safeWidth = width === 0 ? 1 : width;
	const safeHeight = height === 0 ? 1 : height;

	const normalized = points.map(([x, y]) => {
		const nx = (x - minX) / safeWidth;
		const ny = (y - minY) / safeHeight;
		// format as string immediately or return numbers?
		// Requirement says "returns normalizedPoints" which implies data,
		// but the generators usually need text.
		// Let's return objects or formatted string?
		// User req 6.6 says: buildClipPathSvg(normalizedPoints)
		// Let's return array of arrays for flexibility.
		return [Number(nx.toFixed(decimals)), Number(ny.toFixed(decimals))];
	});

	return normalized;
}

/**
 * Helper to converting point array to string "x,y x,y"
 */
export function pointsToString(points) {
	return points.map((p) => p.join(',')).join(' ');
}

/**
 * Calculates Bounding Box and Aspect Ratio of points.
 * @param {Array<[number, number]>} points
 */
export function getPointsBBox(points) {
	if (!points || points.length === 0) {
		return { width: 0, height: 0, aspectRatio: 1 };
	}

	let minX = Infinity,
		maxX = -Infinity,
		minY = Infinity,
		maxY = -Infinity;

	points.forEach(([x, y]) => {
		if (x < minX) minX = x;
		if (x > maxX) maxX = x;
		if (y < minY) minY = y;
		if (y > maxY) maxY = y;
	});

	const width = maxX - minX;
	const height = maxY - minY;
	// Avoid division by zero, default to square
	const aspectRatio = height === 0 || width === 0 ? 1 : width / height;

	return { width, height, aspectRatio };
}
