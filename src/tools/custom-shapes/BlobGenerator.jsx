import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
	ArrowLeft,
	Shuffle,
	Download,
	Copy,
	Code,
	Maximize2,
	Minimize2,
	Activity,
	Zap,
	Circle,
	Square,
	Droplet,
	RefreshCw,
} from 'lucide-react';
import { generateBlob } from './core/generateBlob';
import ShapeCanvas from './components/ShapeCanvas';

// Custom Icons as Components
const ComplexityLowIcon = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="12" cy="5" r="3" />
		<circle cx="5" cy="19" r="3" />
		<circle cx="19" cy="19" r="3" />
		<line x1="12" y1="8" x2="5" y2="16" />
		<line x1="12" y1="8" x2="19" y2="16" />
		<line x1="7.5" y1="19" x2="16.5" y2="19" />
	</svg>
);

const ComplexityHighIcon = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="12" cy="4" r="2.5" />
		<circle cx="20" cy="10" r="2.5" />
		<circle cx="17" cy="20" r="2.5" />
		<circle cx="7" cy="20" r="2.5" />
		<circle cx="4" cy="10" r="2.5" />
		<path d="M12 6.5 L20 10 L17 17.5 L7 17.5 L4 10 Z" stroke="none" />
		{/* Connecting lines for pentagon look */}
		<line x1="12" y1="6.5" x2="20" y2="10" strokeWidth="1.5" />
		<line x1="20" y1="10" x2="17" y2="20" strokeWidth="1.5" />
		<line x1="17" y1="20" x2="7" y2="20" strokeWidth="1.5" />
		<line x1="7" y1="20" x2="4" y2="10" strokeWidth="1.5" />
		<line x1="4" y1="10" x2="12" y2="6.5" strokeWidth="1.5" />
	</svg>
);

const UniquenessLowIcon = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="12" cy="12" r="9" />
	</svg>
);

const UniquenessHighIcon = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path
			d="M12 2L14.5 9L22 9L16 14L18.5 21L12 17L5.5 21L8 14L2 9L9.5 9L12 2Z"
			strokeLinejoin="round"
		/>
	</svg>
);

export default function BlobGenerator() {
	const { t } = useTranslation();
	const [points, setPoints] = useState(5);
	const [variance, setVariance] = useState(0.3);
	const [path, setPath] = useState('');
	const canvasRef = useRef(null);

	// Visual Styles
	const [isOutline, setIsOutline] = useState(false);
	// Gradient state
	const [useGradient, setUseGradient] = useState(true);
	const [gradientStart, setGradientStart] = useState('#F7B733'); // Orange-Yellow
	const [gradientEnd, setGradientEnd] = useState('#FC4A1A'); // Red-Orange

	const [fillColor, setFillColor] = useState('#FF0066');
	const [strokeColor, setStrokeColor] = useState('#333333');
	const [strokeWidth, setStrokeWidth] = useState(2);

	useEffect(() => {
		// Generate initial blob
		regenerate();
	}, []);

	useEffect(() => {
		regenerate();
	}, [points, variance]);

	const regenerate = () => {
		// size=400 to match the ShapeCanvas dimensions for perfect centering
		const d = generateBlob({ points, variance, size: 400 });
		setPath(d);
	};

	const roll = () => {
		const randomPoints = Math.floor(Math.random() * 5) + 3; // 3-7
		const randomVariance = 0.2 + Math.random() * 0.4; // 0.2-0.6

		setPoints(randomPoints);
		setVariance(randomVariance);

		// Optional: randomize gradient colors if gradient is active
		if (useGradient) {
			const colors = [
				'#FF0066',
				'#00CC99',
				'#6600FF',
				'#FF9900',
				'#33CCFF',
				'#F7B733',
				'#FC4A1A',
			];
			setGradientStart(colors[Math.floor(Math.random() * colors.length)]);
			setGradientEnd(colors[Math.floor(Math.random() * colors.length)]);
		} else {
			const colors = ['#FF0066', '#00CC99', '#6600FF', '#FF9900', '#33CCFF'];
			setFillColor(colors[Math.floor(Math.random() * colors.length)]);
		}
	};

	const resetColor = () => {
		setUseGradient(false);
		// Reset to black (or white if user prefers, but standard reset is usually black/dark)
		if (isOutline) {
			setStrokeColor('#000000');
		} else {
			setFillColor('#000000');
		}
	};

	// Construct gradient object or null
	const gradientObj =
		useGradient && !isOutline
			? {
					id: 'blobGradient',
					start: gradientStart,
					end: gradientEnd,
				}
			: null;

	return (
		<main className="max-w-[1920px] mx-auto px-6 py-6 font-sans text-gray-900 dark:text-gray-100">
			{/* Back Button */}
			<Link
				to="/"
				className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6"
			>
				<ArrowLeft size={20} />
				<span className="font-medium">{t('layout.common.backToHome')}</span>
			</Link>

			<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				{/* Controls Sidebar */}
				<div className="flex flex-col gap-6 order-2 xl:order-1 bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
					<div className="flex justify-between items-center mb-2">
						<h2 className="text-xl font-bold">{t('shapeGenerator.title')}</h2>
					</div>

					{/* Complexity */}
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
								<span>{t('shapeGenerator.complexity')}</span>
							</label>
							<span className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
								{points}
							</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="text-gray-400 dark:text-gray-500">
								<ComplexityLowIcon />
							</div>
							<input
								type="range"
								min="3"
								max="12"
								value={points}
								onChange={(e) => setPoints(parseInt(e.target.value, 10))}
								className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
							/>
							<div className="text-gray-600 dark:text-gray-300">
								<ComplexityHighIcon />
							</div>
						</div>
					</div>

					{/* Uniqueness */}
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
								<span>{t('shapeGenerator.uniqueness')}</span>
							</label>
							<span className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
								{variance.toFixed(2)}
							</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="text-gray-400 dark:text-gray-500">
								<UniquenessLowIcon />
							</div>
							<input
								type="range"
								min="0"
								max="0.8"
								step="0.01"
								value={variance}
								onChange={(e) => setVariance(parseFloat(e.target.value))}
								className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
							/>
							<div className="text-gray-600 dark:text-gray-300">
								<UniquenessHighIcon />
							</div>
						</div>
					</div>

					<div className="h-px bg-gray-200 dark:bg-gray-800 my-2"></div>

					{/* Style */}
					<div className="space-y-3">
						<label className="font-semibold text-gray-700 dark:text-gray-300">
							{t('shapeGenerator.style')}
						</label>
						<div className="grid grid-cols-2 gap-3">
							<button
								onClick={() => setIsOutline(false)}
								className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${!isOutline ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 dark:border-indigo-400' : 'bg-white dark:bg-[#252525] border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
							>
								<Square
									size={18}
									className={
										!isOutline
											? 'fill-indigo-600 dark:fill-indigo-400 stroke-none'
											: 'fill-current text-gray-500'
									}
								/>
								<span
									className={
										!isOutline
											? 'font-medium text-indigo-700 dark:text-indigo-300'
											: 'text-gray-600 dark:text-gray-400'
									}
								>
									{t('shapeGenerator.solid')}
								</span>
							</button>
							<button
								onClick={() => setIsOutline(true)}
								className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${isOutline ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 dark:border-indigo-400' : 'bg-white dark:bg-[#252525] border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
							>
								<Circle
									size={18}
									className={
										isOutline
											? 'stroke-indigo-600 dark:stroke-indigo-400'
											: 'stroke-current text-gray-500'
									}
								/>
								<span
									className={
										isOutline
											? 'font-medium text-indigo-700 dark:text-indigo-300'
											: 'text-gray-600 dark:text-gray-400'
									}
								>
									{t('shapeGenerator.outline')}
								</span>
							</button>
						</div>
					</div>

					{/* Color / Gradient */}
					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<label className="font-semibold text-gray-700 dark:text-gray-300">
								{t('shapeGenerator.appearance')}
							</label>
							<div className="flex items-center gap-3">
								<button
									onClick={resetColor}
									title={t('shapeGenerator.resetColor')}
									className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
								>
									<Droplet size={16} />
								</button>
								{!isOutline && (
									<button
										onClick={() => setUseGradient(!useGradient)}
										className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
									>
										{useGradient
											? t('shapeGenerator.switchToSolid')
											: t('shapeGenerator.switchToGradient')}
									</button>
								)}
							</div>
						</div>

						{!isOutline && useGradient ? (
							<div className="flex gap-2 p-1 bg-gray-100 dark:bg-[#252525] rounded-xl">
								<div className="flex-1 relative h-10 overflow-hidden rounded-lg group">
									<input
										type="color"
										value={gradientStart}
										onChange={(e) => setGradientStart(e.target.value)}
										className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
									/>
									<div
										className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs font-mono font-medium text-gray-700 dark:text-gray-200"
										style={{ backgroundColor: gradientStart }}
									>
										{gradientStart.toUpperCase()}
									</div>
								</div>
								<div className="flex items-center justify-center text-gray-400">
									<ArrowLeft size={14} className="rotate-180" />
								</div>
								<div className="flex-1 relative h-10 overflow-hidden rounded-lg group">
									<input
										type="color"
										value={gradientEnd}
										onChange={(e) => setGradientEnd(e.target.value)}
										className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
									/>
									<div
										className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs font-mono font-medium text-gray-700 dark:text-gray-200"
										style={{ backgroundColor: gradientEnd }}
									>
										{gradientEnd.toUpperCase()}
									</div>
								</div>
							</div>
						) : (
							<div className="relative h-12 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 group">
								<input
									type="color"
									value={isOutline ? strokeColor : fillColor}
									onChange={(e) =>
										isOutline
											? setStrokeColor(e.target.value)
											: setFillColor(e.target.value)
									}
									className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
								/>
								<div
									className="absolute inset-0 flex items-center justify-center font-mono font-medium text-white mix-blend-difference pointer-events-none"
									style={{
										backgroundColor: isOutline ? strokeColor : fillColor,
									}}
								>
									{isOutline ? strokeColor : fillColor}
								</div>
							</div>
						)}
					</div>

					<div className="mt-auto grid grid-cols-2 gap-3">
						<button
							onClick={() => canvasRef.current?.exportSvg()}
							className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252525] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-200 transition-colors font-medium text-sm"
						>
							<Download size={16} /> {t('shapeGenerator.svg')}
						</button>
						<button
							onClick={() => canvasRef.current?.exportPng()}
							className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252525] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-200 transition-colors font-medium text-sm"
						>
							<Download size={16} /> {t('shapeGenerator.png')}
						</button>
						<button
							onClick={() => canvasRef.current?.copyCode()}
							className="col-span-2 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252525] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-200 transition-colors font-medium text-sm"
						>
							<Code size={16} /> {t('shapeGenerator.copyCode')}
						</button>
						<button
							onClick={regenerate}
							className="col-span-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-xl py-3 font-semibold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
						>
							<RefreshCw size={20} /> {t('shapeGenerator.regenerate')}
						</button>
						<button
							onClick={roll}
							className="col-span-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl py-3 font-semibold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
						>
							<Shuffle size={20} /> {t('shapeGenerator.randomize')}
						</button>
					</div>
				</div>

				{/* Preview Area */}
				<div className="xl:col-span-2 order-1 xl:order-2 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 flex items-center justify-center min-h-[300px] relative overflow-hidden">
					{/* Dot Pattern Background */}
					<div
						className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
						style={{
							backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
							backgroundSize: '20px 20px',
						}}
					/>

					<div className="flex items-center justify-center relative w-full h-full max-w-[600px] aspect-square">
						<ShapeCanvas
							ref={canvasRef}
							path={path}
							width={400}
							height={400}
							fill={isOutline ? 'none' : fillColor}
							stroke={isOutline ? strokeColor : 'none'}
							strokeWidth={isOutline ? strokeWidth : 0}
							gradient={gradientObj}
						/>
					</div>
				</div>
			</div>
		</main>
	);
}
