import { pointsToString } from '../convert/normalizePoints';

export function buildClipPathSvg(polygons, id = 'bgFigure') {
	let polygonElements = '';
	
	// Check if it's an array of polygons (array of arrays of points)
	// or a single polygon (array of points) - detecting by checking first element
	const isArrayOfPolygons = Array.isArray(polygons) && polygons.length > 0 && Array.isArray(polygons[0][0]);
	
	if (isArrayOfPolygons) {
		polygonElements = polygons.map(points => 
			`<polygon points="${pointsToString(points)}" />`
		).join('\n      ');
	} else {
		// Fallback for single polygon
		polygonElements = `<polygon points="${pointsToString(polygons)}" />`;
	}

	return `<svg width="0" height="0" style="position: absolute; width: 0; height: 0; pointer-events: none;">
  <defs>
    <clipPath id="${id}" clipPathUnits="objectBoundingBox">
      ${polygonElements}
    </clipPath>
  </defs>
</svg>`;
}
