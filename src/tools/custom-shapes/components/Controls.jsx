// src/tools/custom-shapes/components/Controls.jsx

import React from 'react';

/**
 * Generic control panel used by the shape generator pages.
 * Props should contain the specific controls for the page.
 * This component only provides styling consistent with the rest of the app.
 */
export default function Controls({ children }) {
	return (
		<div
			className="controls"
			style={{
				marginBottom: '1rem',
				display: 'flex',
				flexWrap: 'wrap',
				gap: '1rem',
			}}
		>
			{children}
		</div>
	);
}
