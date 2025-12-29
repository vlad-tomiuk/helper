import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Instructions() {
	const { t } = useTranslation();

	return (
		<div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-lg text-sm border border-blue-100 dark:border-blue-800/50">
			<h3 className="font-semibold mb-2">{t('instructions.title')}</h3>
			<ol className="list-decimal pl-4 space-y-1 opacity-90">
				<li>{t('instructions.step1')}</li>
				<li>{t('instructions.step2')}</li>
				<li>{t('instructions.step3')}</li>
				<li>{t('instructions.step4')}</li>
				<li>{t('instructions.step5')}</li>
			</ol>
		</div>
	);
}
