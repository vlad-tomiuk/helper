import React, { useState, useEffect } from 'react';
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
import { X, GripVertical, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ReorderCardsModal({ isOpen, onClose, cards, onSave }) {
	const { t } = useTranslation();
	const [items, setItems] = useState([]);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	useEffect(() => {
		if (isOpen) {
			setItems(cards);
		}
	}, [isOpen, cards]);

	const handleDragEnd = (event) => {
		const { active, over } = event;

		if (active.id !== over.id) {
			setItems((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over.id);
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	const handleSave = () => {
		onSave(items);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
			<div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-800 overflow-hidden">
				{/* Header */}
				<div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1e1e]">
					<h2 className="text-xl font-bold text-gray-900 dark:text-white">
						{t('masterKeyGenerator.reorderCards')}
					</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
					>
						<X size={24} />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50 dark:bg-[#151515]">
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={items.map((c) => c.id)}
							strategy={verticalListSortingStrategy}
						>
							<div className="space-y-3">
								{items.map((card) => (
									<SortableCardItem key={card.id} card={card} />
								))}
							</div>
						</SortableContext>
					</DndContext>

					{items.length === 0 && (
						<div className="text-center text-gray-400 py-10">
							{t('masterKeyGenerator.nothingFound')}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-white dark:bg-[#1e1e1e]">
					<button
						onClick={onClose}
						className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
					>
						{t('masterKeyGenerator.cancel')}
					</button>
					<button
						onClick={handleSave}
						className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all"
					>
						<Save size={18} />
						{t('masterKeyGenerator.saveOrder')}
					</button>
				</div>
			</div>
		</div>
	);
}

function SortableCardItem({ card }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: card.id });

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
			className="group flex items-center gap-3 bg-white dark:bg-[#1e1e1e] p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-indigo-500"
		>
			<div
				{...attributes}
				{...listeners}
				className="cursor-move text-gray-400 hover:text-indigo-500 p-1"
			>
				<GripVertical size={20} />
			</div>
			<div className="font-medium text-gray-700 dark:text-gray-200 truncate select-none">
				{card.title}
			</div>
		</div>
	);
}
