export const POINT_COLORS = [
    '#ef4444', // red-500
    '#22c55e', // green-500
    '#3b82f6', // blue-500
    '#f59e0b', // amber-500
    '#a855f7', // purple-500
    '#06b6d4', // cyan-500
    '#ec4899', // pink-500
    '#84cc16', // lime-500
    '#f97316', // orange-500
    '#6366f1', // indigo-500
];

export const getPointColor = (index) => POINT_COLORS[index % POINT_COLORS.length];
