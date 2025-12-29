import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Ratio } from 'lucide-react';

export default function AspectRatioCalculator() {
	const { t } = useTranslation();

	return (
		<main className="max-w-[1920px] mx-auto px-6 py-6">
			<Link
				to="/"
				className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6"
			>
				<ArrowLeft size={20} />
				<span className="font-medium">{t('common.backToHome')}</span>
			</Link>

			<div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
				<div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-6">
					<Ratio size={48} className="text-emerald-600 dark:text-emerald-400" />
				</div>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
					{t('tools.aspectRatioCalc.name')}
				</h1>
				<p className="text-xl text-gray-600 dark:text-gray-400 max-w-lg mb-8">
					{t('tools.aspectRatioCalc.desc')}
				</p>
				<div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg font-medium">
					{t('home.comingSoon')}
				</div>
			</div>
		</main>
	);
}
