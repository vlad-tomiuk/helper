import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Settings } from 'lucide-react';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { cn } from '../../utils/cn';

export default function Header() {
	const { t } = useTranslation();
	const [theme, setTheme] = useState(
		localStorage.getItem('theme') ||
			(window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light'),
	);

	useEffect(() => {
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
		localStorage.setItem('theme', theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
	};

	return (
		<header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
			<div className="flex items-center gap-3">
				<div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30">
					<Settings className="w-6 h-6 text-white" />
				</div>
				<div>
					<h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
						Helper
					</h1>
				</div>
			</div>

			<div className="flex items-center gap-4">
				<LanguageSwitcher />
				<button
					onClick={toggleTheme}
					className={cn(
						'p-2 rounded-full transition-all duration-300',
						'bg-gray-100 dark:bg-gray-800',
						'text-gray-600 dark:text-yellow-400',
						'hover:bg-gray-200 dark:hover:bg-gray-700',
						'focus:outline-none focus:ring-2 focus:ring-indigo-500',
					)}
					aria-label={t('header.theme')}
				>
					{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
				</button>
			</div>
		</header>
	);
}
