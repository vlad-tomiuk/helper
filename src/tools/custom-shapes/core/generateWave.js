// src/tools/custom-shapes/core/generateWave.js

/**
 * Generates a sinusoidal wave SVG path.
 * @param {Object} options
 * @param {number} [options.amplitude=30] - Height of the wave peaks.
 * @param {number} [options.frequency=2] - Number of full sine cycles across the width.
 * @param {number} [options.length=200] - Width of the bounding box.
 * @param {number} [options.offset=0] - Vertical offset from the top.
 * @returns {string} SVG path data for the wave.
 */
export function generateWave({
	amplitude = 30,
	frequency = 2,
	length = 200,
	offset = 0,
} = {}) {
	const points = [];
	const step = length / (frequency * 20); // 20 points per cycle for smoothness
	for (let x = 0; x <= length; x += step) {
		const y =
			amplitude * Math.sin((x / length) * frequency * Math.PI * 2) +
			offset +
			amplitude;
		points.push({ x, y });
	}
	// Build path
	let path = `M ${points[0].x} ${points[0].y}`;
	for (let i = 1; i < points.length; i++) {
		path += ` L ${points[i].x} ${points[i].y}`;
	}
	// Close the shape to create a filled area under the wave
	path += ` L ${length} ${offset + amplitude * 2}`;
	path += ` L 0 ${offset + amplitude * 2} Z`;
	return path;
}
