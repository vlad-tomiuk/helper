import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SvgUploader from './components/SvgUploader/SvgUploader';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import PreviewPane from './components/PreviewPane/PreviewPane';
import OutputTabs from './components/OutputTabs/OutputTabs';
import { parseSvgString } from './core/svg/parseSvgString';
import { extractPaths } from './core/svg/extractPaths';
import { pathsToPolygons } from './core/convert/pathsToPolygons';
import { normalizePoints, getPointsBBox } from './core/convert/normalizePoints';
import { buildClipPathSvg, buildCssSnippet } from './core/generate/generators';

export default function SvgToClipPath() {
	const { t } = useTranslation();
	const [svgRaw, setSvgRaw] = useState(null);
	const [paths, setPaths] = useState([]);
	const [selectedPathIndex, setSelectedPathIndex] = useState(0);
	const [aspectRatio, setAspectRatio] = useState(1);
	const [settings, setSettings] = useState({
		decimals: 3,
		tolerance: 1,
		normalize: true,
	});

	// Process SVG when uploaded
	useEffect(() => {
		if (!svgRaw) {
			setPaths([]);
			return;
		}

		try {
			const svgDoc = parseSvgString(svgRaw);
			const extractedPaths = extractPaths(svgDoc);
			setPaths(extractedPaths);
			setSelectedPathIndex(0);
		} catch (error) {
			console.error('Error processing SVG:', error);
			setPaths([]);
		}
	}, [svgRaw]);

	// Generate output
	const result = React.useMemo(() => {
		if (paths.length === 0 || !paths[selectedPathIndex]) {
			return { cssCode: '', svgCode: '' };
		}

		try {
			const pathData = paths[selectedPathIndex];
			const polygons = pathsToPolygons(pathData, settings.decimals, settings.tolerance);

			let normalizedPolygons = polygons;
			let calculatedAspectRatio = 1;

			if (settings.normalize && polygons.length > 0) {
				const allPoints = polygons.flat();
				const bbox = getPointsBBox(allPoints);
				calculatedAspectRatio = parseFloat((bbox.width / bbox.height).toFixed(4));
				normalizedPolygons = polygons.map((polygon) =>
					normalizePoints(polygon, settings.decimals),
				);
			}

			setAspectRatio(calculatedAspectRatio);

			// Generate two SVGs: one for preview (fixed ID) and one for output (custom ID)
			const previewSvg = buildClipPathSvg(normalizedPolygons, 'clipPath-preview');
			const outputSvg = buildClipPathSvg(normalizedPolygons, 'myClipPath');
			const cssCode = buildCssSnippet({ id: 'myClipPath', aspectRatio: calculatedAspectRatio });

			return { cssCode, svgCode: outputSvg, previewSvg };
		} catch (error) {
			console.error('Error generating output:', error);
			return { cssCode: '', svgCode: '' };
		}
	}, [paths, selectedPathIndex, settings]);

	return (
		<main className="max-w-[1920px] mx-auto px-6 py-6">
			{/* Back Button */}
			<Link
				to="/"
				className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6"
			>
				<ArrowLeft size={20} />
				<span className="font-medium">{t('layout.common.backToHome')}</span>
			</Link>

			{!svgRaw ? (
				<div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
					<SvgUploader onUpload={setSvgRaw} />
				</div>
			) : (
				<div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:h-[calc(100vh-140px)] xl:min-h-[600px]">
					{/* Left Col: Settings */}
					<div className="flex flex-col gap-6 xl:overflow-y-auto xl:pr-2 custom-scrollbar">
						<SettingsPanel
							settings={settings}
							onChange={setSettings}
							paths={paths}
							selectedPathIndex={selectedPathIndex}
							onPathSelect={setSelectedPathIndex}
							onReset={() => {
								setSvgRaw(null);
								setPaths([]);
							}}
							className="flex-1"
						/>
					</div>

					{/* Middle Col: Preview */}
					<div className="flex flex-col xl:overflow-y-auto xl:pr-2 custom-scrollbar">
						<PreviewPane
							svgRaw={svgRaw}
							clipPathUrl={result?.previewSvg}
							aspectRatio={aspectRatio}
							className="flex-1"
						/>
					</div>

					{/* Right Col: Output */}
					<div className="flex flex-col xl:overflow-y-auto xl:pr-2 custom-scrollbar">
						<OutputTabs
							cssCode={result?.cssCode || ''}
							svgCode={result?.svgCode || ''}
							className="flex-1"
						/>
					</div>
				</div>
			)}
		</main>
	);
}