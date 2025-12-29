/**
 * Converts points array to CSS clip-path polygon string
 * @param {Array<{x:number, y:number}>} points 
 * @param {boolean} normalize - If true, converts 0-100 to 0%-100%
 */
export const pointsToCss = (points) => {
    const pointsStr = points
        .map(p => `${Math.round(p.x)}% ${Math.round(p.y)}%`)
        .join(', ');
    return `clip-path: polygon(${pointsStr});`;
};

/**
 * Converts points to SVG polygon points string
 */
export const pointsToSvg = (points, width = 100, height = 100) => {
    return points
        .map(p => `${(p.x / 100 * width).toFixed(1)},${(p.y / 100 * height).toFixed(1)}`)
        .join(' ');
};
