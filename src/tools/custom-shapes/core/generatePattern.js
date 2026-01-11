// src/tools/custom-shapes/core/generatePattern.js

/**
 * Generates a simple tiled pattern SVG path.
 * Currently supports "triangles" and "circles".
 * @param {Object} options
 * @param {string} [options.type='triangles'] - Pattern type.
 * @param {number} [options.size=20] - Size of a single tile.
 * @param {number} [options.repeat=10] - Number of tiles per row/column.
 * @returns {string} SVG path data for the pattern (combined shapes).
 */
export function generatePattern({
	type = 'triangles',
	size = 20,
	repeat = 10,
} = {}) {
	const paths = [];
	const total = repeat * repeat;
	for (let i = 0; i < repeat; i++) {
		for (let j = 0; j < repeat; j++) {
			const x = j * size;
			const y = i * size;
			if (type === 'triangles') {
				// upward pointing triangle
				const p = `M ${x} ${y + size} L ${x + size / 2} ${y} L ${x + size} ${y + size} Z`;
				paths.push(p);
			} else if (type === 'circles') {
				const r = size / 2;
				const cx = x + r;
				const cy = y + r;
				const p = `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0`;
				paths.push(p);
			}
		}
	}
	return paths.join(' ');
}
