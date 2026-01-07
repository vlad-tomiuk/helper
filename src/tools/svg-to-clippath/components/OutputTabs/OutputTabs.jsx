import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import CopyButton from '../../../../shared/components/CopyButton/CopyButton';

export default function OutputTabs({ cssCode, svgCode, className }) {
	const { t } = useTranslation();

	return (
		<Tabs.Root
			defaultValue="css"
			className={cn(
				'flex flex-col h-full bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800',
				className,
			)}
		>
			<div className="border-b border-gray-200 dark:border-gray-800 px-5 pt-5">
				<Tabs.List className="flex gap-2 items-center h-[60px] pb-3">
					<TabTrigger value="css">{t('svgToClippath.output.cssTab')}</TabTrigger>
					<TabTrigger value="svg">{t('svgToClippath.output.svgTab')}</TabTrigger>
				</Tabs.List>
			</div>

			<div className="relative flex-1 bg-[#1e1e1e] rounded-b-xl overflow-hidden group">
				<Tabs.Content value="css" className="h-full outline-none">
					<CodeBlock code={cssCode} language="css" />
				</Tabs.Content>
				<Tabs.Content value="svg" className="h-full outline-none">
					<CodeBlock code={svgCode} language="xml" />
				</Tabs.Content>
			</div>
		</Tabs.Root>
	);
}

function TabTrigger({ value, children }) {
	return (
		<Tabs.Trigger
			value={value}
			className={cn(
				'px-4 py-2 text-sm font-medium rounded-lg transition-all',
				'text-gray-600 dark:text-gray-400',
				'hover:text-gray-900 dark:hover:text-gray-100',
				'hover:bg-gray-100 dark:hover:bg-gray-800',
				'data-[state=active]:text-white data-[state=active]:bg-indigo-600',
				'data-[state=active]:shadow-md data-[state=active]:shadow-indigo-500/20',
				'outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
			)}
		>
			{children}
		</Tabs.Trigger>
	);
}

function CodeBlock({ code, language }) {
	return (
		<div className="relative h-full group">
			<div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
				<CopyButton text={code} />
			</div>
			<div className="h-full overflow-x-auto overflow-y-auto">
				<SyntaxHighlighter
					language={language}
					style={vscDarkPlus}
					customStyle={{
						margin: 0,
						padding: '1.5rem',
						background: '#1e1e1e',
						fontSize: '0.875rem',
						lineHeight: '1.5',
						minHeight: '100%',
						minWidth: 'max-content',
					}}
					showLineNumbers={false}
					wrapLines={false}
					wrapLongLines={false}
				>
					{code}
				</SyntaxHighlighter>
			</div>
		</div>
	);
}
