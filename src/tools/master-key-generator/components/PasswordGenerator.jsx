import React, { useState, useEffect } from 'react';
import { Settings, Copy, Check, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PasswordGenerator({
	settings,
	onSettingsChange,
	onGenerate,
	generateFn,
}) {
	const { t } = useTranslation();
	// Local state for the displayed password
	const [generatedPassword, setGeneratedPassword] = useState('');

	// Generate initial password on mount if needed, or when settings change?
	// The user might not want it auto-generated on every change, standard behavior is manual generate.

	// If we want the local state to match the parent's current generated password,
	// we might need to sync it, but for now let's keep it simple:
	// This component displays what IT generated or what was passed.
	// Actually, MasterKeyGenerator passed `currentGeneratedPassword` to the modal,
	// but here we just need to display what we just generated.

	const handleGenerate = () => {
		if (generateFn) {
			const pwd = generateFn();
			setGeneratedPassword(pwd);
			if (onGenerate) onGenerate(pwd);
		}
	};

	// Helper to update a single setting
	const updateSetting = (key, value) => {
		if (onSettingsChange) {
			onSettingsChange({ ...settings, [key]: value });
		}
	};

	const copyToClipboard = () => {
		if (generatedPassword) {
			navigator.clipboard.writeText(generatedPassword);
		}
	};

	return (
		<div className="flex flex-col gap-6 bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
			<div className="flex items-center gap-2 mb-2">
				<Settings className="text-indigo-600 dark:text-indigo-400" size={24} />
				<h2 className="text-xl font-bold">
					{t('masterKeyGenerator.passwordGenerator')}
				</h2>
			</div>

			<div className="space-y-4">
				{/* Password Output Field */}
				<div className="relative group">
					<input
						type="text"
						readOnly
						value={generatedPassword}
						placeholder={t('masterKeyGenerator.generatedPassword')}
						className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-center"
					/>
					<button
						onClick={copyToClipboard}
						className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all"
						title={t('masterKeyGenerator.copy')}
					>
						<Copy size={20} />
					</button>
				</div>

				{/* Length Slider (Compact) */}
				<div className="bg-gray-50 dark:bg-[#252525] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
					<div className="flex justify-between items-center mb-2">
						<label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
							{t('masterKeyGenerator.length')}
						</label>
						<span className="bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-xs font-bold font-mono border border-gray-100 dark:border-gray-600">
							{settings?.length || 16}
						</span>
					</div>
					<input
						type="range"
						min="8"
						max="64"
						value={settings?.length || 16}
						onChange={(e) => updateSetting('length', parseInt(e.target.value))}
						className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
					/>
				</div>

				{/* Toggles (Compact Grid) */}
				<div className="grid grid-cols-2 gap-2">
					<label
						className={`flex items-center justify-between cursor-pointer p-2.5 rounded-xl border transition-all ${settings?.includeNumbers ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50' : 'bg-gray-50 dark:bg-[#252525] border-transparent'}`}
					>
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
							0-9
						</span>
						<div
							className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${settings?.includeNumbers ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600'}`}
						>
							{settings?.includeNumbers && (
								<Check size={12} className="text-white" />
							)}
						</div>
						<input
							type="checkbox"
							checked={settings?.includeNumbers || false}
							onChange={(e) =>
								updateSetting('includeNumbers', e.target.checked)
							}
							className="hidden"
						/>
					</label>

					<label
						className={`flex items-center justify-between cursor-pointer p-2.5 rounded-xl border transition-all ${settings?.includeUppercase ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50' : 'bg-gray-50 dark:bg-[#252525] border-transparent'}`}
					>
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
							A-Z
						</span>
						<div
							className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${settings?.includeUppercase ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600'}`}
						>
							{settings?.includeUppercase && (
								<Check size={12} className="text-white" />
							)}
						</div>
						<input
							type="checkbox"
							checked={settings?.includeUppercase || false}
							onChange={(e) =>
								updateSetting('includeUppercase', e.target.checked)
							}
							className="hidden"
						/>
					</label>

					<label
						className={`flex items-center justify-between cursor-pointer p-2.5 rounded-xl border transition-all ${settings?.includeLowercase ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50' : 'bg-gray-50 dark:bg-[#252525] border-transparent'}`}
					>
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
							a-z
						</span>
						<div
							className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${settings?.includeLowercase ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600'}`}
						>
							{settings?.includeLowercase && (
								<Check size={12} className="text-white" />
							)}
						</div>
						<input
							type="checkbox"
							checked={settings?.includeLowercase || false}
							onChange={(e) =>
								updateSetting('includeLowercase', e.target.checked)
							}
							className="hidden"
						/>
					</label>

					<label
						className={`flex items-center justify-between cursor-pointer p-2.5 rounded-xl border transition-all ${settings?.includeSymbols ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50' : 'bg-gray-50 dark:bg-[#252525] border-transparent'}`}
					>
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
							#@!
						</span>
						<div
							className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${settings?.includeSymbols ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600'}`}
						>
							{settings?.includeSymbols && (
								<Check size={12} className="text-white" />
							)}
						</div>
						<input
							type="checkbox"
							checked={settings?.includeSymbols || false}
							onChange={(e) =>
								updateSetting('includeSymbols', e.target.checked)
							}
							className="hidden"
						/>
					</label>
				</div>

				{/* Generate Button */}
				<button
					onClick={handleGenerate}
					className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
				>
					<RefreshCw size={20} />
					<span>{t('masterKeyGenerator.generate')}</span>
				</button>
			</div>
		</div>
	);
}
