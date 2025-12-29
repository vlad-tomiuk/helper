import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Slider from '@radix-ui/react-slider';
import { Settings2 } from 'lucide-react';
import { cn } from '../../../../shared/utils/cn';

export default function SettingsPanel({
	settings,
	onChange,
	paths,
	selectedPathIndex,
	onPathSelect,
	onReset,
	className,
}) {
	const { t } = useTranslation();

	const handleChange = (key, value) => {
		onChange({ ...settings, [key]: value });
	};

	return (
		<div
			className={cn(
				'bg-white dark:bg-[#1e1e1e] rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800',
				className,
			)}
		>
			{/* Header with shape info and reset */}
			<div className="flex items-center justify-between min-h-[60px] pb-3 border-b border-gray-100 dark:border-gray-800">
				<div className="flex items-center gap-2">
					<Settings2 size={18} className="text-indigo-500" />
					<h2 className="font-semibold text-gray-900 dark:text-white">{t('settings.title')}</h2>
				</div>
				{onReset && (
					<button
						onClick={onReset}
						className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors"
					>
						{t('main.reset')}
					</button>
				)}
			</div>

			<div className="space-y-6 mt-6">
				{/* Path Selector */}
				{paths.length > 0 && (
					<div className="space-y-2">
						<label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
							{t('settings.pathSelector')}
						</label>
						<select
							value={selectedPathIndex}
							onChange={(e) => onPathSelect(Number(e.target.value))}
							className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
						>
							              {paths.map((p, i) => (
                <option key={i} value={i}>
                  {t('settings.pathLabel', { index: i + 1 })} ({p.d.slice(0, 30)}...)
                </option>
              ))}
						</select>
					</div>
				)}

				{/* Tolerance Slider */}
				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
							{t('settings.tolerance')}
						</label>
						<span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-gray-700 dark:text-gray-300">
							{settings.tolerance} px
						</span>
					</div>
					<Slider.Root
						className="relative flex items-center select-none touch-none w-full h-5"
						value={[settings.tolerance]}
						max={10}
						min={0.1}
						step={0.1}
						onValueChange={([val]) => handleChange('tolerance', val)}
					>
						<Slider.Track className="bg-gray-200 dark:bg-gray-800 relative grow rounded-full h-[3px]">
							<Slider.Range className="absolute bg-indigo-500 rounded-full h-full" />
						</Slider.Track>
						<Slider.Thumb className="block w-5 h-5 bg-white dark:bg-gray-700 border-2 border-indigo-500 shadow-lg rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-transform hover:scale-110" />
					</Slider.Root>
				</div>

				{/* Decimals Selector */}
				<div className="space-y-2">
					<label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
						{t('settings.decimals')}
					</label>
					<div className="grid grid-cols-4 gap-2">
						{[1, 2, 3, 4].map((num) => (
							<button
								key={num}
								onClick={() => handleChange('decimals', num)}
								className={cn(
									'px-3 py-2 rounded-lg text-sm font-medium transition-all',
									settings.decimals === num
										? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
										: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
								)}
							>
								{num}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
