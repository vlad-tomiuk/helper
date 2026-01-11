import React, { useState, useEffect } from 'react';
import {
	X,
	Trash2,
	Plus,
	Type,
	Lock,
	Heading,
	Minus,
	Link as LinkIcon,
	Save,
	RefreshCw,
	GripVertical,
} from 'lucide-react';
import { encryptPassword } from '../core/encryption';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';

export default function AddCardModal({
	isOpen,
	onClose,
	onSave,
	onDelete,
	masterKey,
	generatePassword,
	initialData,
}) {
	const { t } = useTranslation();
	const [cardTitle, setCardTitle] = useState('');
	const [fields, setFields] = useState([]);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	useEffect(() => {
		if (isOpen) {
			if (initialData) {
				setCardTitle(initialData.card.title);
				// Safety check for fields array
				const safeFields = Array.isArray(initialData.fields)
					? initialData.fields
					: [];
				setFields(
					safeFields.map((f) => ({
						...f,
						id: f.id || Date.now().toString() + Math.random().toString(),
					})),
				);
			} else {
				setCardTitle('');
				setFields([]);
			}
		}
	}, [isOpen, initialData]);

	if (!isOpen) return null;

	const addField = (type) => {
		const newField = {
			id: Date.now().toString() + Math.random().toString(),
			type,
			data: getRandomDefaultData(type),
		};
		setFields([...fields, newField]);
	};

	const getRandomDefaultData = (type) => {
		switch (type) {
			case 'text':
				return { label: '', value: '' };
			case 'password':
				return { label: '', value: '' };
			case 'header':
				return { text: '' };
			case 'separator':
				return {};
			case 'link':
				return { title: '', url: '' };
			default:
				return {};
		}
	};

	const updateFieldData = (id, newData) => {
		setFields(
			fields.map((f) =>
				f.id === id ? { ...f, data: { ...f.data, ...newData } } : f,
			),
		);
	};

	const removeField = (id) => {
		setFields(fields.filter((f) => f.id !== id));
	};

	const handleDragEnd = (event) => {
		const { active, over } = event;
		if (active.id !== over.id) {
			setFields((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over.id);
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	const handleSave = () => {
		if (!cardTitle.trim()) {
			alert('Будь ласка, введіть заголовок картки.');
			return;
		}
		if (fields.length === 0) {
			alert('Додайте хоча б одне поле до картки.');
			return;
		}
		if (!masterKey) {
			alert('Введіть мастер-ключ для шифрування даних!');
			return;
		}

		// Apply default labels if empty
		const processedFields = fields.map((f) => {
			if (f.type === 'text' && !f.data.label.trim()) {
				return { ...f, data: { ...f.data, label: 'Логін' } };
			}
			if (f.type === 'password' && !f.data.label.trim()) {
				return { ...f, data: { ...f.data, label: 'Пароль' } };
			}
			return f;
		});

		// Encrypt both title and fields
		const payload = {
			title: cardTitle,
			fields: processedFields,
		};

		const payloadJson = JSON.stringify(payload);
		const encryptedData = encryptPassword(payloadJson, masterKey);

		// Use a placeholder title for the public metadata to hide it
		// We preserve the last 4 digits of ID for basic differentiation if needed, or just random
		const cardId = initialData ? initialData.card.id : Date.now();
		const publicTitle = `Protected Card #${cardId.toString().slice(-4)}`;

		const result = {
			title: publicTitle, // This will be shown when locked
			encryptedData: encryptedData,
			id: cardId,
			timestamp: initialData ? initialData.card.timestamp : Date.now(),
		};

		onSave(result);
		onClose();
	};

	// Delete Confirmation Logic
	return (
		<ModalContent
			isOpen={isOpen}
			onClose={onClose}
			onSave={handleSave}
			onDelete={onDelete}
			title={
				initialData
					? t('masterKeyGenerator.editCard')
					: t('masterKeyGenerator.addCard')
			}
			cardTitle={cardTitle}
			setCardTitle={setCardTitle}
			fields={fields}
			addField={addField}
			updateFieldData={updateFieldData}
			removeField={removeField}
			generatePassword={generatePassword}
			sensors={sensors}
			handleDragEnd={handleDragEnd}
			initialData={initialData}
		/>
	);
}

function ModalContent({
	isOpen,
	onClose,
	onSave,
	onDelete,
	title,
	cardTitle,
	setCardTitle,
	fields,
	addField,
	updateFieldData,
	removeField,
	generatePassword,
	sensors,
	handleDragEnd,
	initialData,
}) {
	const { t } = useTranslation();
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [deleteConfirmationTitle, setDeleteConfirmationTitle] = useState('');

	const handleDeleteClick = () => {
		setIsDeleteConfirmOpen(true);
		setDeleteConfirmationTitle('');
	};

	const handleConfirmDelete = () => {
		if (deleteConfirmationTitle !== initialData?.card?.title) {
			alert('Назва картки не співпадає. Видалення скасовано.');
			return;
		}
		onDelete(initialData.card.id);
		onClose();
	};

	const isTitleMatch =
		initialData && deleteConfirmationTitle === initialData.card.title;

	if (isDeleteConfirmOpen) {
		return (
			<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
				<div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-800">
					<div className="flex flex-col gap-4">
						<div className="flex items-center gap-3 text-red-600 dark:text-red-500">
							<div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
								<Trash2 size={24} />
							</div>
							<h3 className="text-lg font-bold">
								{t('masterKeyGenerator.confirmDelete')}
							</h3>
						</div>

						<p className="text-gray-600 dark:text-gray-300 text-sm">
							{t('masterKeyGenerator.clearDataConfirm')}
							<span className="font-bold select-all ml-1 text-gray-900 dark:text-white">
								{initialData?.card?.title}
							</span>
						</p>

						<input
							type="text"
							value={deleteConfirmationTitle}
							onChange={(e) => setDeleteConfirmationTitle(e.target.value)}
							placeholder={t('masterKeyGenerator.serviceName')}
							className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252525] border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900 dark:text-gray-100 transition-all"
							autoFocus
						/>

						<div className="flex justify-end gap-2 mt-2">
							<button
								onClick={() => setIsDeleteConfirmOpen(false)}
								className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
							>
								{t('masterKeyGenerator.cancel')}
							</button>
							<button
								onClick={handleConfirmDelete}
								disabled={!isTitleMatch}
								className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm transition-all"
							>
								{t('masterKeyGenerator.delete')}
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
			<div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-800 overflow-hidden">
				{/* Header - Compact */}
				<div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1e1e] z-10">
					<h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
						{title}
					</h2>
					<button
						onClick={onClose}
						className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
					>
						<X size={20} />
					</button>
				</div>

				{/* Sticky Toolbar (Menu) */}
				<div className="px-4 py-3 bg-gray-50/80 dark:bg-[#252525]/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-10">
					<div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center sm:text-left">
						{t('masterKeyGenerator.customFields')}:
					</div>
					<div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
						<ToolButton
							icon={Type}
							label={t('masterKeyGenerator.text')}
							onClick={() => addField('text')}
						/>
						<ToolButton
							icon={Lock}
							label={t('masterKeyGenerator.password')}
							onClick={() => addField('password')}
						/>
						<ToolButton
							icon={Heading}
							label={t('masterKeyGenerator.header')}
							onClick={() => addField('header')}
						/>
						<ToolButton
							icon={Minus}
							label={t('masterKeyGenerator.separator')}
							onClick={() => addField('separator')}
						/>
						<ToolButton
							icon={LinkIcon}
							label={t('masterKeyGenerator.link')}
							onClick={() => addField('link')}
						/>
					</div>
				</div>

				{/* Content Scrollable */}
				<div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50 dark:bg-[#151515]">
					{/* Card Title */}
					<div className="mb-4">
						<input
							type="text"
							value={cardTitle}
							onChange={(e) => setCardTitle(e.target.value)}
							placeholder={t('masterKeyGenerator.serviceName')}
							className="w-full px-4 py-3 bg-white dark:bg-[#1e1e1e] border-2 border-transparent focus:border-indigo-500 rounded-xl shadow-sm outline-none transition-all text-lg sm:text-xl font-bold placeholder-gray-300 dark:placeholder-gray-700"
							autoFocus
						/>
					</div>

					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={fields.map((f) => f.id)}
							strategy={verticalListSortingStrategy}
						>
							<div className="space-y-3">
								{fields.map((field) => (
									<SortableFieldItem
										key={field.id}
										field={field}
										updateFieldData={updateFieldData}
										removeField={removeField}
										generatePassword={generatePassword}
									/>
								))}
							</div>
						</SortableContext>
					</DndContext>

					{fields.length === 0 && (
						<div className="text-center py-8 text-gray-400 text-xs">
							{t('masterKeyGenerator.dragToReorder')}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="p-3 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#1e1e1e] text-sm">
					<div>
						{initialData && (
							<button
								onClick={handleDeleteClick}
								className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
								title={t('masterKeyGenerator.delete')}
							>
								<Trash2 size={16} />
								<span className="hidden sm:inline">
									{t('masterKeyGenerator.delete')}
								</span>
							</button>
						)}
					</div>
					<div className="flex gap-2">
						<button
							onClick={onClose}
							className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
						>
							{t('masterKeyGenerator.cancel')}
						</button>
						<button
							onClick={onSave}
							className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={fields.length === 0}
						>
							<Save size={16} />
							{t('masterKeyGenerator.save')}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

function ToolButton({ icon: Icon, label, onClick }) {
	return (
		<button
			onClick={onClick}
			className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#303030] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-lg transition-all group shadow-sm flex-shrink-0"
		>
			<Icon
				size={14}
				className="text-gray-500 group-hover:text-indigo-600 dark:text-gray-400 dark:group-hover:text-indigo-400"
			/>
			<span className="text-xs font-medium text-gray-600 group-hover:text-indigo-600 dark:text-gray-300 dark:group-hover:text-indigo-400">
				{label}
			</span>
		</button>
	);
}

function SortableFieldItem({
	field,
	updateFieldData,
	removeField,
	generatePassword,
}) {
	const { t } = useTranslation();
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: field.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 100 : 'auto',
		opacity: isDragging ? 0.8 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="group flex items-start gap-2 bg-white dark:bg-[#1e1e1e] p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm transition-all"
		>
			{/* Drag Handle */}
			<div
				{...attributes}
				{...listeners}
				className="cursor-move text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 py-1.5"
			>
				<GripVertical size={16} />
			</div>

			{/* Field Content - Responsive Layout */}
			<div className="flex-1 min-w-0 grid gap-2">
				{field.type === 'text' && (
					<div className="flex flex-col sm:flex-row gap-2 w-full">
						<div className="flex items-center gap-2 w-full sm:w-1/3">
							<Type
								size={16}
								className="text-indigo-500 flex-shrink-0 hidden sm:block"
							/>
							<span className="sm:hidden text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
								<Type size={12} /> {t('masterKeyGenerator.text')}
							</span>
							<input
								type="text"
								value={field.data.label}
								onChange={(e) =>
									updateFieldData(field.id, { label: e.target.value })
								}
								placeholder={t('masterKeyGenerator.login')}
								className="flex-1 w-full px-2 py-1.5 bg-gray-50 dark:bg-[#252525] rounded border border-gray-200 dark:border-gray-700 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
							/>
						</div>
						<input
							type="text"
							value={field.data.value}
							onChange={(e) =>
								updateFieldData(field.id, { value: e.target.value })
							}
							placeholder="Значення..."
							className="w-full sm:flex-1 px-2 py-1.5 bg-gray-50 dark:bg-[#252525] rounded border border-gray-200 dark:border-gray-700 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
						/>
					</div>
				)}

				{field.type === 'password' && (
					<div className="flex flex-col sm:flex-row gap-2 w-full">
						<div className="flex items-center gap-2 w-full sm:w-1/3">
							<Lock
								size={16}
								className="text-indigo-500 flex-shrink-0 hidden sm:block"
							/>
							<span className="sm:hidden text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
								<Lock size={12} /> {t('masterKeyGenerator.password')}
							</span>
							<input
								type="text"
								value={field.data.label}
								onChange={(e) =>
									updateFieldData(field.id, { label: e.target.value })
								}
								placeholder={t('masterKeyGenerator.password')}
								className="flex-1 w-full px-2 py-1.5 bg-gray-50 dark:bg-[#252525] rounded border border-gray-200 dark:border-gray-700 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
							/>
						</div>
						<div className="flex-1 flex gap-1 items-center w-full">
							<input
								type="text"
								value={field.data.value}
								onChange={(e) =>
									updateFieldData(field.id, { value: e.target.value })
								}
								placeholder="******"
								className="flex-1 w-full px-2 py-1.5 bg-gray-50 dark:bg-[#252525] rounded border border-gray-200 dark:border-gray-700 text-xs font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
							/>
							<button
								onClick={() =>
									updateFieldData(field.id, { value: generatePassword() })
								}
								className="p-1.5 bg-gray-100 dark:bg-[#303030] text-gray-500 hover:text-indigo-600 rounded transition-colors"
								title={t('masterKeyGenerator.generate')}
							>
								<RefreshCw size={14} />
							</button>
						</div>
					</div>
				)}

				{field.type === 'header' && (
					<div className="flex items-center gap-2 w-full">
						<Heading size={16} className="text-indigo-500 flex-shrink-0" />
						<input
							type="text"
							value={field.data.text}
							onChange={(e) =>
								updateFieldData(field.id, { text: e.target.value })
							}
							placeholder={t('masterKeyGenerator.header')}
							className="flex-1 px-2 py-1.5 bg-transparent border-b border-indigo-200 dark:border-indigo-800 text-sm font-bold focus:border-indigo-500 outline-none"
						/>
					</div>
				)}

				{field.type === 'separator' && (
					<div className="flex items-center gap-2 w-full">
						<div className="h-px bg-gray-300 dark:bg-gray-700 flex-1"></div>
						<span className="text-[10px] text-gray-400 uppercase">
							{t('masterKeyGenerator.separator')}
						</span>
						<div className="h-px bg-gray-300 dark:bg-gray-700 flex-1"></div>
					</div>
				)}

				{field.type === 'link' && (
					<div className="flex flex-col sm:flex-row gap-2 w-full">
						<div className="flex items-center gap-2 w-full sm:w-1/3">
							<LinkIcon
								size={16}
								className="text-indigo-500 flex-shrink-0 hidden sm:block"
							/>
							<span className="sm:hidden text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
								<LinkIcon size={12} /> {t('masterKeyGenerator.link')}
							</span>
							<input
								type="text"
								value={field.data.title}
								onChange={(e) =>
									updateFieldData(field.id, { title: e.target.value })
								}
								placeholder={t('masterKeyGenerator.fieldTitle')}
								className="flex-1 w-full px-2 py-1.5 bg-gray-50 dark:bg-[#252525] rounded border border-gray-200 dark:border-gray-700 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
							/>
						</div>
						<input
							type="text"
							value={field.data.url}
							onChange={(e) =>
								updateFieldData(field.id, { url: e.target.value })
							}
							placeholder="URL..."
							className="w-full sm:flex-1 px-2 py-1.5 bg-gray-50 dark:bg-[#252525] rounded border border-gray-200 dark:border-gray-700 text-xs text-blue-500 focus:ring-1 focus:ring-indigo-500 outline-none"
						/>
					</div>
				)}
			</div>

			{/* Delete Button */}
			<button
				onClick={() => removeField(field.id)}
				className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
				title="Видалити"
			>
				<Trash2 size={16} />
			</button>
		</div>
	);
}
