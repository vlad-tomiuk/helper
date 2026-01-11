import React from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SearchBar({ searchQuery, setSearchQuery }) {
	const { t } = useTranslation();
	return (
		<div className="relative">
			<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
				<Search size={20} />
			</div>
			<input
				type="text"
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				placeholder={t('masterKeyGenerator.searchPlaceholder')}
				className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg transition-all"
			/>
		</div>
	);
}
