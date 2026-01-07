import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '../shared/components/Header/Header';
import HomePage from './HomePage';
import SvgToClipPath from '../tools/svg-to-clippath/SvgToClipPath';
import ShapeGenerator from '../tools/shape-generator/ShapeGenerator';
import AspectRatioCalculator from '../tools/aspect-ratio-calculator/AspectRatioCalculator';
import BlobGenerator from '../tools/custom-shapes/BlobGenerator';
import MasterKeyGenerator from '../tools/master-key-generator/MasterKeyGenerator';

export default function App() {
	return (
		<BrowserRouter basename={import.meta.env.BASE_URL}>
			<div className="min-h-screen bg-gray-50 dark:bg-[#121212] transition-colors duration-300">
				<Header />
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/svg-to-clippath" element={<SvgToClipPath />} />
					<Route path="/clip-path-generator" element={<ShapeGenerator />} />
					<Route path="/shape-generator" element={<BlobGenerator />} />
					<Route path="/aspect-ratio-calculator" element={<AspectRatioCalculator />} />
					<Route path="/master-key-generator" element={<MasterKeyGenerator />} />
				</Routes>
			</div>
		</BrowserRouter>
	);
}