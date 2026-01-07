import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function CopyButton({ text, className }) {
	const { t } = useTranslation();
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy!', err);
		}
	};

	return (
		<button
			onClick={handleCopy}
			className={cn(
				'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
				'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600',
				'hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500',
				'text-gray-700 dark:text-gray-200',
				copied
					? 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
					: '',
				className,
			)}
		>
			{copied ? <Check size={14} /> : <Copy size={14} />}
			{copied ? t('layout.copy.copied') : t('layout.copy.copy')}
		</button>
	);
}
