import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';

export default function EditCardJsonModal({
	isOpen,
	onClose,
	onSave,
	card,
	initialData,
}) {
	const [jsonContent, setJsonContent] = useState('');
	const [title, setTitle] = useState('');
	const [error, setError] = useState(null);

	useEffect(() => {
		if (isOpen && card && initialData) {
			setTitle(card.title);
			// Format JSON with indentation for easier editing
			setJsonContent(JSON.stringify(initialData, null, 2));
			setError(null);
		}
	}, [isOpen, card, initialData]);

	if (!isOpen) return null;

	const handleSave = () => {
		if (!title.trim()) {
			setError('Заголовок не може бути порожнім');
			return;
		}

		try {
			const parsed = JSON.parse(jsonContent);
			if (!Array.isArray(parsed)) {
				setError("JSON повинен бути масивом об'єктів (полів)");
				return;
			}
			// Basic validation of structure if needed, but flexibility is requested
			onSave(card.id, title, parsed);
			onClose();
		} catch (e) {
			setError('Невалідний JSON: ' + e.message);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
			<div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
					<h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
						Редагування JSON
					</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
					>
						<X size={24} />
					</button>
				</div>

				{/* Body */}
				<div className="flex-1 overflow-y-auto p-6 space-y-4">
					{/* Title Input */}
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Назва картки
						</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-gray-100"
						/>
					</div>

					{/* JSON Editor */}
					<div className="space-y-2 flex-1 flex flex-col">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Конфігурація (JSON)
						</label>
						<div className="relative flex-1">
							<textarea
								value={jsonContent}
								onChange={(e) => setJsonContent(e.target.value)}
								className="w-full h-96 font-mono text-sm bg-gray-900 text-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
								spellCheck="false"
							/>
						</div>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							Ви можете змінювати порядок, редагувати заголовки та додавати нові
							поля структури.
						</p>
					</div>

					{/* Error Message */}
					{error && (
						<div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
							<AlertTriangle size={16} />
							<span>{error}</span>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
					<button
						onClick={onClose}
						className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
					>
						Скасувати
					</button>
					<button
						onClick={handleSave}
						className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-indigo-500/20"
					>
						<Save size={18} />
						Зберегти зміни
					</button>
				</div>
			</div>
		</div>
	);
}
