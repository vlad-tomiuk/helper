import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '../shared/components/Header/Header';
import HomePage from './HomePage';
import SvgToClipPath from '../tools/svg-to-clippath/SvgToClipPath';
import ShapeGenerator from '../tools/shape-generator/ShapeGenerator';
import ClippyEditor from '../tools/clippy-editor/ClippyEditor';
import AspectRatioCalculator from '../tools/aspect-ratio-calculator/AspectRatioCalculator';

export default function App() {
	return (
		<BrowserRouter>
			<div className="min-h-screen bg-gray-50 dark:bg-[#121212] transition-colors duration-300">
				<Header />
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/svg-to-clippath" element={<SvgToClipPath />} />
					<Route path="/shape-generator" element={<ShapeGenerator />} />
					<Route path="/clippy-editor" element={<ClippyEditor />} />
					<Route path="/aspect-ratio-calculator" element={<AspectRatioCalculator />} />
				</Routes>
			</div>
		</BrowserRouter>
	);
}