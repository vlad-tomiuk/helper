import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { encryptPassword, decryptPassword } from './core/encryption';
import { useTranslation } from 'react-i18next';

// Components
import PasswordGenerator from './components/PasswordGenerator';
import KeyManager from './components/KeyManager';
import SearchBar from './components/SearchBar';
import PasswordCardGrid from './components/PasswordCardGrid';
import AddCardModal from './components/AddCardModal';
import ReorderCardsModal from './components/ReorderCardsModal';

export default function MasterKeyGenerator() {
	const { t } = useTranslation();
	const [masterKey, setMasterKey] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	// Load initial cards from LocalStorage
	const [cards, setCards] = useState(() => {
		try {
			const saved = localStorage.getItem('masterKeyGen_cards');
			return saved ? JSON.parse(saved) : [];
		} catch (e) {
			console.error('Failed to load cards', e);
			return [];
		}
	});

	// Password Generator State (Lifted)
	const [passwordSettings, setPasswordSettings] = useState({
		length: 16,
		includeNumbers: true,
		includeUppercase: true,
		includeLowercase: true,
		includeSymbols: true,
	});
	const [currentGeneratedPassword, setCurrentGeneratedPassword] = useState('');

	const [isModalOpen, setIsModalOpen] = useState(false);

	// Edit State
	const [editingCard, setEditingCard] = useState(null);
	const [editingData, setEditingData] = useState(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

	// Decrypt cards for display and search
	const processedCards = useMemo(() => {
		return cards.map((card) => {
			if (!masterKey) return card;

			try {
				const decrypted = decryptPassword(card.encryptedData, masterKey);
				if (!decrypted) return card;

				const parsed = JSON.parse(decrypted);

				// Handle new format { title, fields } vs old format [fields]
				if (Array.isArray(parsed)) {
					// Old format: title is public, parsed is fields
					return { ...card, decryptedFields: parsed };
				} else if (parsed && parsed.fields) {
					// New format: title is encrypted inside
					return {
						...card,
						title: parsed.title, // Override public title with real one
						decryptedFields: parsed.fields,
					};
				}
				return card;
			} catch (e) {
				return card;
			}
		});
	}, [cards, masterKey]);

	const generatePassword = () => {
		let charset = '';
		if (passwordSettings.includeLowercase)
			charset += 'abcdefghijklmnopqrstuvwxyz';
		if (passwordSettings.includeUppercase)
			charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		if (passwordSettings.includeNumbers) charset += '0123456789';
		if (passwordSettings.includeSymbols)
			charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

		if (charset === '') return '';

		let retVal = '';
		for (let i = 0, n = charset.length; i < passwordSettings.length; ++i) {
			retVal += charset.charAt(Math.floor(Math.random() * n));
		}
		return retVal;
	};

	const handleEditCard = (card, decryptedData) => {
		// If we already have decryptedFields in card, we can use it, or passed decryptedData
		setEditingCard(card);
		// For editing, we need the raw fields array
		setEditingData(card.decryptedFields || decryptedData);
		setIsEditModalOpen(true);
	};

	const handleSaveEditedCard = (updatedCard) => {
		setCards((prev) =>
			prev.map((c) => {
				if (c.id === updatedCard.id) {
					return updatedCard;
				}
				return c;
			}),
		);
		setIsEditModalOpen(false);
		setEditingCard(null);
		setEditingData(null);
	};

	// Persistence effect
	React.useEffect(() => {
		localStorage.setItem('masterKeyGen_cards', JSON.stringify(cards));
	}, [cards]);

	const handleOpenAddModal = () => {
		if (!masterKey.trim()) {
			alert(t('masterKeyGenerator.enterMasterKeyAlert'));
			return;
		}
		setIsModalOpen(true);
	};

	const handleOpenReorderModal = () => {
		if (!masterKey.trim()) {
			alert(t('masterKeyGenerator.enterMasterKeyAlert'));
			// We allow opening but warn
		}
		setIsReorderModalOpen(true);
	};

	const handleSaveReorderedCards = (newOrder) => {
		// newOrder contains 'processedCards' which might have decrypted data and overridden titles.
		// We must NOT save the decrypted versions. We need to reconstruct the order of the ORIGINAL 'cards' state.

		const reorderedOriginals = newOrder
			.map((orderedItem) =>
				cards.find((original) => original.id === orderedItem.id),
			)
			.filter(Boolean); // Filter out any undefineds just in case

		setCards(reorderedOriginals);
		setIsReorderModalOpen(false);
	};

	const handleSaveCard = (newCard) => {
		setCards((prev) => [newCard, ...prev]);
	};

	const handleClearData = () => {
		if (window.confirm(t('masterKeyGenerator.clearDataConfirm'))) {
			setCards([]);
			localStorage.removeItem('masterKeyGen_cards');
		}
	};

	const handleImportCards = (importedCards) => {
		if (!Array.isArray(importedCards)) {
			alert(t('masterKeyGenerator.invalidFormatAlert'));
			return;
		}
		if (window.confirm(t('masterKeyGenerator.importConfirm'))) {
			setCards(importedCards);
		}
	};

	const handleDeleteCard = (cardId) => {
		setCards((prev) => prev.filter((c) => c.id !== cardId));
		// Reset edit state
		setIsEditModalOpen(false);
		setEditingCard(null);
		setEditingData(null);
	};

	const filteredCards = processedCards.filter((card) =>
		card.title.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<main className="max-w-[1920px] mx-auto px-6 py-6 font-sans text-gray-900 dark:text-gray-100">
			{/* Back Button */}
			<Link
				to="/"
				className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6"
			>
				<ArrowLeft size={20} />
				<span className="font-medium">{t('masterKeyGenerator.backHome')}</span>
			</Link>

			<div className="flex flex-col gap-6">
				{/* Top Section: Split Generator and Master Key Controls */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Password Generator Settings (50% width) */}
					<PasswordGenerator
						settings={passwordSettings}
						onSettingsChange={setPasswordSettings}
						onGenerate={(pwd) => setCurrentGeneratedPassword(pwd)}
						generateFn={generatePassword}
					/>

					{/* Master Key Controls (50% width) */}
					<KeyManager
						masterKey={masterKey}
						setMasterKey={setMasterKey}
						cards={cards}
						onAddCard={handleOpenAddModal}
						onClearData={handleClearData}
						onReorder={handleOpenReorderModal}
						onImportData={handleImportCards}
					/>
				</div>

				{/* Middle Section: Search Bar (Full Width) */}
				<SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

				{/* Bottom Section: Password Cards Grid (Full Width) */}
				<PasswordCardGrid
					cards={filteredCards}
					masterKey={masterKey}
					searchQuery={searchQuery}
					onEdit={handleEditCard}
				/>
			</div>

			{/* Modal for Adding and Editing Cards */}
			<AddCardModal
				isOpen={isModalOpen || isEditModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setIsEditModalOpen(false);
					setEditingCard(null);
					setEditingData(null);
				}}
				onSave={editingCard ? handleSaveEditedCard : handleSaveCard}
				onDelete={handleDeleteCard}
				masterKey={masterKey}
				generatePassword={generatePassword}
				generatedPassword={currentGeneratedPassword}
				initialData={
					editingCard && editingData
						? { card: editingCard, fields: editingData }
						: null
				}
			/>

			{/* Reorder Modal */}
			<ReorderCardsModal
				isOpen={isReorderModalOpen}
				onClose={() => setIsReorderModalOpen(false)}
				cards={processedCards} // Pass processed so titles are visible if unlocked
				onSave={handleSaveReorderedCards}
			/>
		</main>
	);
}
