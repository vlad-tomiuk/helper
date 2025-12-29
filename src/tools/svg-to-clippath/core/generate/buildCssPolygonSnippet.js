export function buildCssPolygonSnippet(normalizedPoints) {
	// polygon(10% 20%, 30% 40%, ...)
	// points are 0..1, so multiply by 100 for %
	const pointsStr = normalizedPoints
		.map(([x, y]) => {
			return `${(x * 100).toFixed(0)}% ${(y * 100).toFixed(0)}%`;
		})
		.join(', ');

	return `selector {
  clip-path: polygon(${pointsStr});
}`;
}
