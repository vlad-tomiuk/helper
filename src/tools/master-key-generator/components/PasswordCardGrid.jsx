import React, { useState } from 'react';
import {
	Lock,
	FileText,
	Check,
	Copy,
	Eye,
	EyeOff,
	Link as LinkIcon,
	ExternalLink,
	Settings,
} from 'lucide-react';
import { decryptPassword } from '../core/encryption';
import { useTranslation } from 'react-i18next';

export default function PasswordCardGrid({
	cards = [],
	masterKey,
	searchQuery,
	onEdit,
}) {
	const { t } = useTranslation();
	if (cards.length === 0) {
		if (searchQuery) {
			return (
				<div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 w-full">
					<p className="text-lg">{t('masterKeyGenerator.emptyState')}</p>
				</div>
			);
		}
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-50 pointer-events-none filter grayscale">
				<div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center h-32 text-gray-400">
					Тут будуть картки...
				</div>
				<div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center h-32 text-gray-400">
					Тут будуть картки...
				</div>
				<div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center h-32 text-gray-400">
					Тут будуть картки...
				</div>
				<div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center h-32 text-gray-400">
					Тут будуть картки...
				</div>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 align-top">
			{cards.map((card) => (
				<CardItem
					key={card.id}
					card={card}
					masterKey={masterKey}
					onEdit={onEdit}
				/>
			))}
		</div>
	);
}

function CardItem({ card, masterKey, onEdit }) {
	const { t } = useTranslation();
	const [decryptedFields, setDecryptedFields] = useState(null);
	const [error, setError] = useState(false);

	React.useEffect(() => {
		// If data is already processed by parent, use it directly
		if (card.decryptedFields) {
			setDecryptedFields(card.decryptedFields);
			setError(false);
			return;
		}

		if (!masterKey || !card.encryptedData) {
			setDecryptedFields(null);
			setError(false);
			return;
		}

		try {
			const jsonStr = decryptPassword(card.encryptedData, masterKey);
			if (jsonStr) {
				const parsed = JSON.parse(jsonStr);
				// Handle both new { title, fields } and old [fields] formats
				if (Array.isArray(parsed)) {
					setDecryptedFields(parsed);
				} else if (parsed && parsed.fields) {
					setDecryptedFields(parsed.fields);
				} else {
					setDecryptedFields([]);
				}
				setError(false);
			} else {
				setDecryptedFields(null);
				setError(true);
			}
		} catch (e) {
			console.error('Card decryption error', e);
			setError(true);
			setDecryptedFields(null);
		}
	}, [masterKey, card.encryptedData, card.decryptedFields]);

	if (!masterKey) {
		return (
			<div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
				<h3 className="font-bold text-lg text-gray-400 dark:text-gray-500 blur-sm select-none">
					Protected Card
				</h3>
				<div className="text-sm text-gray-500 bg-gray-100 dark:bg-[#252525] p-3 rounded-lg flex items-center gap-2">
					<Lock size={16} />
					<span>{t('masterKeyGenerator.enterKeyToAccess')}</span>
				</div>
			</div>
		);
	}

	if (error || !decryptedFields) {
		return (
			<div className="bg-white dark:bg-[#1e1e1e] border border-red-200 dark:border-red-900/30 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
				<h3 className="font-bold text-lg">{card.title}</h3>
				<div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg flex items-center gap-2">
					<Lock size={16} />
					<span>{t('masterKeyGenerator.invalidKey')}</span>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
			<div className="flex justify-between items-start">
				<h3 className="font-bold text-lg leading-tight text-gray-900 dark:text-gray-100">
					{card.title}
				</h3>
				{decryptedFields && onEdit && (
					<button
						onClick={() => onEdit(card, decryptedFields)}
						className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
						title="Налаштування"
					>
						<Settings size={18} />
					</button>
				)}
			</div>

			<div className="space-y-3">
				{decryptedFields.map((field) => (
					<div key={field.id} className="text-sm">
						{field.type === 'text' && (
							<div className="group">
								<div className="text-xs text-gray-500 mb-1 font-medium">
									{field.data.label}
								</div>
								<div className="flex justify-between items-center bg-gray-50 dark:bg-[#262626] px-3 py-2 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
									<span className="font-medium text-gray-700 dark:text-gray-200 truncate pr-2 select-all">
										{field.data.value}
									</span>
									<CopyBtn text={field.data.value} />
								</div>
							</div>
						)}

						{field.type === 'password' && (
							<div className="group">
								<div className="text-xs text-gray-500 mb-1 font-medium">
									{field.data.label}
								</div>
								<PasswordDisplay value={field.data.value} />
							</div>
						)}

						{field.type === 'header' && (
							<h4 className="font-bold text-gray-800 dark:text-gray-200 mt-3 pb-1 border-b border-gray-100 dark:border-gray-700 text-sm">
								{field.data.text}
							</h4>
						)}

						{field.type === 'separator' && (
							<hr className="border-gray-100 dark:border-gray-700 my-2" />
						)}

						{field.type === 'link' && (
							<div className="mt-1">
								<a
									href={field.data.url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-between w-full bg-indigo-50 dark:bg-indigo-900/20 px-3 py-3 rounded-xl text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-transparent group"
								>
									<div className="flex items-center gap-2 overflow-hidden">
										<LinkIcon size={16} className="shrink-0" />
										<span className="font-medium truncate">
											{field.data.title || field.data.url}
										</span>
									</div>
									<ExternalLink
										size={14}
										className="opacity-70 group-hover:opacity-100 transition-opacity shrink-0"
									/>
								</a>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

// Helpers
function CopyBtn({ text }) {
	const { t } = useTranslation();
	const [copied, setCopied] = useState(false);
	const handleCopy = () => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};
	if (!text) return null;
	return (
		<button
			type="button"
			onClick={handleCopy}
			className={`p-1.5 rounded transition-all shrink-0 ${
				copied
					? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
					: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400'
			}`}
			title={t('masterKeyGenerator.copy')}
		>
			{copied ? <Check size={16} /> : <Copy size={16} />}
		</button>
	);
}

function PasswordDisplay({ value }) {
	const { t } = useTranslation();
	const [visible, setVisible] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="flex items-center justify-between bg-gray-50 dark:bg-[#262626] px-3 py-2 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
			<span
				className={`font-mono text-gray-700 dark:text-gray-200 truncate pr-2 ${visible ? 'select-all' : 'select-none'}`}
			>
				{visible ? value : '•'.repeat(Math.min(value?.length || 8, 12))}
			</span>
			<div className="flex items-center gap-2 shrink-0">
				<button
					type="button"
					onClick={() => setVisible(!visible)}
					className="p-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-200 transition-all"
					title={
						visible
							? t('masterKeyGenerator.hide')
							: t('masterKeyGenerator.show')
					}
				>
					{visible ? <EyeOff size={16} /> : <Eye size={16} />}
				</button>
				<button
					type="button"
					onClick={handleCopy}
					className={`p-1.5 rounded transition-all ${
						copied
							? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
							: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400'
					}`}
					title={t('masterKeyGenerator.copy')}
				>
					{copied ? <Check size={16} /> : <Copy size={16} />}
				</button>
			</div>
		</div>
	);
}
