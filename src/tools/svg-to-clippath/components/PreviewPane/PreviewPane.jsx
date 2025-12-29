import React, { useState } from 'react';
import * as Switch from '@radix-ui/react-switch';
import { cn } from '../../../../shared/utils/cn';
import { useTranslation } from 'react-i18next';

export default function PreviewPane({
	svgRaw,
	clipPathUrl,
	aspectRatio,
	className,
}) {
	const [showResult, setShowResult] = useState(true);
	const { t } = useTranslation();

	return (
		<div
			className={cn(
				'flex flex-col bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5',
				className,
			)}
		>
			<div className="flex items-center justify-between min-h-[60px] pb-3 border-b border-gray-100 dark:border-gray-800">
				<h2 className="font-semibold text-gray-900 dark:text-white">{t('preview.title')}</h2>

				{svgRaw && (
					<div className="flex items-center gap-3 select-none">
						<label
							className="text-xs text-gray-500 dark:text-gray-400 font-medium cursor-pointer min-w-[50px] text-right"
							htmlFor="preview-mode-switch"
						>
							{showResult ? t('preview.result') : t('preview.original')}
						</label>
						<Switch.Root
							className="group relative flex h-[26px] w-[48px] items-center shrink-0 cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700 outline-none shadow-inner data-[state=checked]:bg-indigo-500 transition-colors pl-0"
							id="preview-mode-switch"
							checked={showResult}
							onCheckedChange={setShowResult}
						>
							<Switch.Thumb className="pointer-events-none block h-[22px] w-[22px] shrink-0 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 will-change-transform translate-x-[2px] data-[state=checked]:translate-x-[24px]" />
						</Switch.Root>
					</div>
				)}
			</div>
			

			<div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-[#151515] rounded-xl overflow-hidden relative min-h-[300px] p-4 mt-6">
				{!svgRaw ? (
					<div className="text-gray-400 text-sm">{t('main.noSvg')}</div>
				) : (
					<div className="relative w-full h-full flex items-center justify-center">
						{!showResult ? (
							<div
								className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto"
								dangerouslySetInnerHTML={{ __html: svgRaw }}
							/>
						) : (
							<div
								className="bg-indigo-500 relative transition-all duration-300 shadow-2xl"
								style={{
									width: '100%',
									maxWidth: '500px',
									aspectRatio: String(aspectRatio),
									clipPath: clipPathUrl ? `url(#clipPath-preview)` : 'none',
									background:
										'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
								}}
							>
								{/* Optional: Add an image here for better demo */}
								<img
									src="https://picsum.photos/800/600"
									alt="Demo"
									className="w-full h-full object-cover"
								/>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Hidden container for the clipPath execution */}
			{clipPathUrl && (
				<div
					className="sr-only"
					dangerouslySetInnerHTML={{ __html: clipPathUrl }}
				/>
			)}
		</div>
	);
}
