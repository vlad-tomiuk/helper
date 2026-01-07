// src/tools/custom-shapes/core/generateBlob.js

/**
 * Generates an organic blob SVG path.
 * @param {Object} options
 * @param {number} [options.points=5] - Number of vertices of the blob (minimum 3).
 * @param {number} [options.variance=0.3] - Random displacement factor (0‑1). Higher = more irregular.
 * @param {number} [options.size=200] - Width/height of the bounding box.
 * @returns {string} SVG path data for the blob.
 */
export function generateBlob({ points = 5, variance = 0.3, size = 200 } = {}) {
  // Ensure the blob fits within 'size' even at max variance.
  // Max radius factor = 1 + variance/2
  // We need radius * (1 + variance/2) <= size/2
  // So radius = (size/2) / (1 + variance/2)
  // We also account for spline tension overshoot (approx 10-15% buffer)
  // User requested strict bounds, so we use 0.8 to be absolutely safe
  const safeRadius = ((size / 2) / (1 + variance / 2)) * 0.8;
  const angleStep = (Math.PI * 2) / points;
  const pointsArr = [];

  // Center point
  const center = size / 2;

  // Generate random radius for each vertex
  for (let i = 0; i < points; i++) {
    const randomFactor = 1 - variance / 2 + Math.random() * variance; 
    const r = safeRadius * randomFactor;
    const x = r * Math.cos(i * angleStep);
    const y = r * Math.sin(i * angleStep);
    pointsArr.push({ x: x + center, y: y + center });
  }

  // Helper to get point at index with wrap-around
  const getPoint = (i) => pointsArr[(i + points) % points];

  // Build path using Catmull-Rom to Cubic Bezier conversion for smoothness
  // We need to calculate control points for each segment based on neighbors
  let path = `M ${pointsArr[0].x} ${pointsArr[0].y}`;
  const tension = 0.4; // 0.4-0.5 is standard for smooth Catmull-Rom.

  for (let i = 0; i < points; i++) {
    const p0 = getPoint(i - 1);
    const p1 = getPoint(i);
    const p2 = getPoint(i + 1);
    const p3 = getPoint(i + 2);

    // Calculate control points for segment p1 -> p2
    // CP1 = p1 + (p2 - p0) * tension
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;

    // CP2 = p2 - (p3 - p1) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  path += ' Z';
  return path;
}
