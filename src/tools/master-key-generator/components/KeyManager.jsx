import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Key,
	Eye,
	EyeOff,
	FileJson,
	Download,
	Plus,
	Trash2,
	Copy,
	Check,
	ArrowUpDown,
	ChevronDown,
	FileCode,
	Upload,
} from 'lucide-react';

export default function KeyManager({
	masterKey,
	setMasterKey,
	cards,
	onAddCard,
	onClearData,
	onReorder,
	onImportData,
}) {
	const { t, i18n } = useTranslation();
	const [showMasterKey, setShowMasterKey] = useState(false);
	const [copied, setCopied] = useState(false);
	const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
	const menuRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(event) {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setIsDownloadMenuOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleDownloadJson = () => {
		const dataStr = JSON.stringify(cards, null, 2);
		const blob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'master-key-backup.json';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		setIsDownloadMenuOpen(false);
	};

	const handleDownloadHtml = async () => {
		// Fetch CryptoJS for embedding
		let cryptoJsContent = '';
		try {
			const response = await fetch(
				'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
			);
			cryptoJsContent = await response.text();
		} catch (e) {
			console.error('Failed to fetch CryptoJS for embedding:', e);
			alert(
				"Не вдалося завантажити бібліотеку шифрування для вбудовування. Перевірте з'єднання з інтернетом.",
			);
			return;
		}

		// SVG Icons definitions
		const Icons = {
			Eye: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`,
			EyeOff: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="M2 2l20 20"/></svg>`,
			Copy: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
			Check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
			Lock: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
			Search: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
			Print: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>`,
		};

		// Prepare translations for HTML
		const translations = {
			accessProtected: t('masterKeyGenerator.accessProtected'),
			enterKeyToAccess: t('masterKeyGenerator.enterKeyToAccess'),
			enterKeyLabel: t('masterKeyGenerator.enterMasterKey'),
			keyPlaceholder: t('masterKeyGenerator.keyPlaceholder'),
			openVault: t('masterKeyGenerator.openVault'),
			invalidKey: t('masterKeyGenerator.invalidKey'),
			myPasswords: t('masterKeyGenerator.myPasswords'),
			searchPlaceholder: t('masterKeyGenerator.searchPlaceholder'),
			login: t('masterKeyGenerator.login'),
			password: t('masterKeyGenerator.password'),
			link: t('masterKeyGenerator.link'),
			nothingFound: t('masterKeyGenerator.emptyState'),
			copy: t('masterKeyGenerator.copy'),
			hide: t('masterKeyGenerator.hide'),
			show: t('masterKeyGenerator.show'),
		};

		const htmlContent = `
<!DOCTYPE html>
<html lang="${i18n.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${translations.myPasswords}</title>
    <style>
        /* Dark Theme by Default */
        :root {
            --bg-page: #0f1115;
            --bg-card: #181b21;
            --bg-input: #22262e;
            --border: #2f343e;
            --text-primary: #e5e7eb;
            --text-secondary: #9ca3af;
            --primary: #6366f1;
            --primary-hover: #818cf8;
            --text-on-primary: #ffffff;
            --success: #10b981;
            --error: #ef4444;
            --shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.3);
            --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.2);
            --radius-lg: 1rem;
            --radius-md: 0.75rem;
            --radius-sm: 0.5rem;
        }

        /* Print Styles - Ink Saving & Visibility */
        @media print {
            body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; }
            .container { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
            header, .control-bar, .auth-container, .actions, .field-icon, .btn-group { display: none !important; }
            
            .card { 
                border: 1px solid #ddd !important; 
                box-shadow: none !important; 
                break-inside: avoid; 
                page-break-inside: avoid; 
                background: white !important;
                margin-bottom: 15px;
                display: block !important; /* Ensure it's block for printing */
                color: black !important;
            }
            .card-header { 
                background: #f5f5f5 !important; 
                color: black !important; 
                border-bottom: 1px solid #ddd !important;
                padding: 8px 12px !important;
            }
            
            /* Hide the interactive inputs */
            .field-input, .readonly-input, .link-a { display: none !important; }
            
            /* Show the print text */
            .print-value { 
                display: block !important; 
                font-family: 'SF Mono', 'Consolas', monospace;
                font-size: 11pt;
                color: #000;
                padding: 4px 0;
                word-break: break-all;
            }
            
            .field-wrapper, .input-display, .link-box, .search-input { 
                border: none !important; 
                background: transparent !important; 
                padding: 0 !important; 
                box-shadow: none !important;
            }
            
            .label, .field-label { color: #666 !important; font-size: 8pt !important; margin-bottom: 2px !important; }
            .section-header { color: black !important; border-bottom: 1px solid black !important; }
            .grid { display: block !important; } /* Fallback for grid in some print engines, though grid is supported */
            .field-group, .field { margin-bottom: 8px !important; page-break-inside: avoid; }
        }

        /* Screen Styles */
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, system-ui, sans-serif; background: var(--bg-page); color: var(--text-primary); margin: 0; padding: 0; min-height: 100vh; display: flex; flex-direction: column; }
        .container { width: 100%; max-width: 1920px; margin: 0 auto; padding: 2rem; flex: 1; }
        @media (max-width: 640px) { .container { padding: 1rem; } h1 { font-size: 1.5rem !important; } }
        
        header { margin-bottom: 2.5rem; }
        h1 { font-size: 2rem; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 0.75rem; color: var(--primary); }
        h1 svg { width: 32px; height: 32px; }
        .gradient-text { background: linear-gradient(135deg, var(--primary), #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        /* Auth */
        .auth-container { display: flex; align-items: center; justify-content: center; min-height: 80vh; }
        .auth-card { background: var(--bg-card); padding: 2.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); box-shadow: var(--shadow-md); width: 100%; max-width: 440px; text-align: center; }
        .auth-icon { width: 64px; height: 64px; background: rgba(99,102,241,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: var(--primary); }
        .input-base { width: 100%; padding: 0.875rem 1rem; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); font-size: 1rem; outline: none; transition: all 0.2s; }
        .input-base:focus { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(99,102,241,0.2); }
        .btn-primary { width: 100%; padding: 0.875rem; background: var(--primary); color: var(--text-on-primary); border: none; border-radius: var(--radius-md); font-weight: 600; font-size: 1rem; cursor: pointer; transition: background 0.2s; }
        .btn-primary:hover { background: var(--primary-hover); }
        
        /* Control Bar */
        .control-bar { display: flex; gap: 1rem; margin-bottom: 2rem; align-items: center; }
        .search-wrapper { position: relative; flex: 1; }
        .search-icon { position: absolute; left: 1.25rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); pointer-events: none; }
        .search-input { width: 100%; padding: 1rem 1rem 1rem 3.5rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); color: var(--text-primary); font-size: 1.1rem; box-shadow: var(--shadow-sm); outline: none; transition: all 0.2s; }
        .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }
        
        .print-btn {
            display: flex; align-items: center; justify-content: center;
            width: 3.5rem; height: 3.5rem;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            color: var(--text-primary);
            cursor: pointer;
            box-shadow: var(--shadow-sm);
            transition: all 0.2s;
        }
        .print-btn:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-2px); }

        /* Grid */
        .grid { display: grid; gap: 1.5rem; padding-bottom: 2rem; }
        @media (min-width: 0px) { .grid { grid-template-columns: 1fr; } }
        @media (min-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1280px) { .grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1920px) { .grid { grid-template-columns: repeat(4, 1fr); } }

        /* Cards */
        .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; display: flex; flex-direction: column; transition: all 0.2s ease; }
        .card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--border); }
        .card-header { padding: 1.25rem; border-bottom: 1px solid var(--border); font-weight: 700; font-size: 1.1rem; background: rgba(255,255,255,0.03); }
        .card-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem; }
        
        .field { display: flex; flex-direction: column; gap: 0.5rem; width: 100%; }
        .field-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); font-weight: 700; }
        
        .field-wrapper { position: relative; display: flex; align-items: center; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; width: 100%; transition: border-color 0.2s; }
        .field-wrapper:focus-within { border-color: var(--primary); }
        .field-icon { padding-left: 0.75rem; color: var(--text-secondary); display: flex; align-items: center; }
        .field-input { flex: 1; min-width: 0; padding: 0.75rem; background: transparent; border: none; color: var(--text-primary); font-family: monospace; font-size: 0.9rem; outline: none; width: 100%; }
        
        .actions { display: flex; align-items: center; gap: 0.25rem; padding-right: 0.5rem; }
        .icon-btn { padding: 0.4rem; background: transparent; border: none; border-radius: var(--radius-sm); color: var(--text-secondary); cursor: pointer; display: flex; transition: all 0.2s; }
        .icon-btn:hover { background: rgba(255,255,255,0.1); color: var(--text-primary); }
        .icon-btn.success { color: var(--success); }
        
        .link-box { background: var(--bg-input); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border); width: 100%; display: flex; }
        .link { color: var(--primary); text-decoration: none; font-weight: 500; word-break: break-all; flex: 1; }
        .link:hover { text-decoration: underline; }
        
        .section-header { font-size: 0.85rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.1em; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border); margin-top: 0.5rem; }
        .separator { height: 1px; background: var(--border); width: 100%; opacity: 0.5; }
        
        .error-msg { color: var(--error); margin-top: 1rem; font-size: 0.9rem; display: none; background: rgba(239,68,68,0.1); padding: 0.75rem; border-radius: var(--radius-md); }
        .empty-state { grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 4rem 1rem; font-style: italic; }

        /* Helper for print visibility */
        .print-value { display: none; }
    </style>
    <script>${cryptoJsContent}</script>
</head>
<body>
    <div class="container">
        <div id="authScreen" class="auth-container">
            <div class="auth-card">
                <div class="auth-icon">${Icons.Lock}</div>
                <h2 class="auth-title">${translations.accessProtected}</h2>
                <div style="margin-bottom: 1.5rem; color: var(--text-secondary);">${translations.enterKeyToAccess}</div>
                <div style="margin-bottom: 1.5rem;"><input type="password" id="masterKey" class="input-base" placeholder="${translations.keyPlaceholder}" onkeyup="if(event.key==='Enter') unlock()"></div>
                <button class="btn-primary" onclick="unlock()">${translations.openVault}</button>
                <div id="authError" class="error-msg">${translations.invalidKey}</div>
            </div>
        </div>
        <div id="appScreen" style="display:none">
            <header><h1>${Icons.Lock} <span class="gradient-text">${translations.myPasswords}</span></h1></header>
            
            <div class="control-bar">
                <div class="search-wrapper">
                    <div class="search-icon">${Icons.Search}</div>
                    <input type="text" id="searchInput" class="search-input" placeholder="${translations.searchPlaceholder}" oninput="render()">
                </div>
                <button class="print-btn" onclick="window.print()" title="Друк">${Icons.Print}</button>
            </div>

            <div id="grid" class="grid"></div>
        </div>
    </div>
    <script>
        const cards = ${JSON.stringify(cards)};
        const T = ${JSON.stringify(translations)};
        let decryptedCards = [];
        const Icons = { Eye: '${Icons.Eye}', EyeOff: '${Icons.EyeOff}', Copy: '${Icons.Copy}', Check: '${Icons.Check}', Lock: '${Icons.Lock}' };
        function decrypt(encrypted, key) {
            try { if(!encrypted || !key) return null; return CryptoJS.AES.decrypt(atob(encrypted), key).toString(CryptoJS.enc.Utf8) || null; } catch(e) { return null; }
        }
        function unlock() {
            const key = document.getElementById('masterKey').value;
            if(!key.trim()) return;
            const processed = [];
            let successCount = 0;
            cards.forEach(card => {
                const decryptedStr = decrypt(card.encryptedData, key);
                if(decryptedStr) {
                    try {
                        const parsed = JSON.parse(decryptedStr);
                        if(Array.isArray(parsed)) processed.push({ ...card, title: card.title, fields: parsed, isDecrypted: true });
                        else processed.push({ ...card, title: parsed.title, fields: parsed.fields, isDecrypted: true });
                        successCount++;
                    } catch(e) {}
                }
            });
            if(successCount > 0) {
                decryptedCards = processed;
                document.getElementById('authScreen').style.display = 'none';
                document.getElementById('appScreen').style.display = 'block';
                render();
            } else {
                document.getElementById('authError').style.display = 'block';
            }
        }
        function copyToClipboard(text, btnId) {
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.getElementById(btnId);
                if(btn) {
                    btn.innerHTML = Icons.Check; btn.classList.add('success');
                    setTimeout(() => { btn.innerHTML = Icons.Copy; btn.classList.remove('success'); }, 1500);
                }
            });
        }
        function togglePassword(inputId, btnId) {
            const input = document.getElementById(inputId);
            const btn = document.getElementById(btnId);
            if(input.type === 'password') { input.type = 'text'; btn.innerHTML = Icons.EyeOff; } 
            else { input.type = 'password'; btn.innerHTML = Icons.Eye; }
        }
        function render() {
            const query = document.getElementById('searchInput').value.toLowerCase();
            const container = document.getElementById('grid');
            container.innerHTML = '';
            decryptedCards.forEach((card, i) => {
                const title = card.title || 'Untitled';
                if(!title.toLowerCase().includes(query) && 
                   !(card.fields && card.fields.some(f => (f.data.value && f.data.value.toLowerCase().includes(query))))) return;
                
                let fieldsHtml = '';
                if(card.fields) card.fields.forEach((f, j) => {
                    const uid = \`c\${i}_f\${j}\`;
                    if(f.type === 'text') { // Text
                        fieldsHtml += \`
                        <div class="field">
                            <div class="field-label">\${f.data.label||T.login}</div>
                            <div class="field-wrapper">
                                <input type="text" readonly class="field-input" value="\${f.data.value}" onclick="this.select()">
                                <div class="print-value">\${f.data.value}</div>
                                <div class="actions">
                                    <button id="btn_copy_\${uid}" class="icon-btn" onclick="copyToClipboard('\${f.data.value.replace(/'/g, "\\\\'")}', 'btn_copy_\${uid}')">\${Icons.Copy}</button>
                                </div>
                            </div>
                        </div>\`;
                    } else if(f.type === 'password') { // Password
                         fieldsHtml += \`
                        <div class="field">
                            <div class="field-label">\${f.data.label||T.password}</div>
                            <div class="field-wrapper">
                                <div class="field-icon">\${Icons.Lock}</div>
                                <input type="password" id="inp_\${uid}" readonly class="field-input" value="\${f.data.value}" onclick="this.select()">
                                <div class="print-value">\${f.data.value}</div>
                                <div class="actions">
                                    <button id="btn_fmt_\${uid}" class="icon-btn" onclick="togglePassword('inp_\${uid}', 'btn_fmt_\${uid}')">\${Icons.Eye}</button>
                                    <button id="btn_copy_\${uid}" class="icon-btn" onclick="copyToClipboard('\${f.data.value.replace(/'/g, "\\\\'")}', 'btn_copy_\${uid}')">\${Icons.Copy}</button>
                                </div>
                            </div>
                        </div>\`;
                    } else if(f.type === 'link') { // Link
                        fieldsHtml += \`
                        <div class="field">
                            <div class="link-box">
                                <a href="\${f.data.url}" target="_blank" class="link">\${f.data.title||f.data.url}</a>
                                <div class="print-value">\${f.data.url}</div>
                            </div>
                        </div>\`;
                    } else if(f.type === 'header') {
                        fieldsHtml += \`<div class="section-header">\${f.data.text}</div>\`;
                    } else if(f.type === 'separator') {
                         fieldsHtml += \`<div class="separator"></div>\`;
                    }
                });
                if(fieldsHtml) container.innerHTML += \`<div class="card"><div class="card-header">\${title}</div><div class="card-body">\${fieldsHtml}</div></div>\`;
            });
            if(!container.innerHTML) container.innerHTML = '<div class="empty-state">\${T.nothingFound}</div>';
        }
    </script>
</body>
</html>
        `;

		const blob = new Blob([htmlContent], { type: 'text/html' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'passwords-secure.html';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		setIsDownloadMenuOpen(false);
	};

	const handleImportClick = () => {
		document.getElementById('import-json-input').click();
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (ev) => {
			try {
				const json = JSON.parse(ev.target.result);
				if (onImportData) {
					onImportData(json);
				}
			} catch (err) {
				alert(t('masterKeyGenerator.invalidFormatAlert'));
			}
		};
		reader.readAsText(file);
		e.target.value = ''; // Reset input to allow re-selection
	};

	return (
		<div className="flex flex-col bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
			<h2 className="text-xl font-bold mb-6 flex items-center gap-2">
				<Key className="text-indigo-600 dark:text-indigo-400" size={24} />
				{t('masterKeyGenerator.keyManagement')}
			</h2>

			{/* Responsive Inputs */}
			<div className="flex flex-col gap-6 mb-8 flex-grow">
				{/* Master Key Input */}
				<div className="space-y-2">
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						{t('masterKeyGenerator.masterKey')}
					</label>
					<div className="relative">
						<input
							type={showMasterKey ? 'text' : 'password'}
							value={masterKey}
							onChange={(e) => setMasterKey(e.target.value)}
							placeholder={t('masterKeyGenerator.enterMasterKeyPlaceholder')}
							className="w-full pl-4 pr-24 py-3 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
						/>
						<button
							type="button"
							onClick={() => setShowMasterKey(!showMasterKey)}
							className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
							title={
								showMasterKey
									? t('masterKeyGenerator.hide')
									: t('masterKeyGenerator.show')
							}
						>
							{showMasterKey ? <EyeOff size={16} /> : <Eye size={16} />}
						</button>
						<button
							type="button"
							onClick={() => {
								navigator.clipboard.writeText(masterKey);
								setCopied(true);
								setTimeout(() => setCopied(false), 2000);
							}}
							className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded transition-all ${
								copied
									? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
									: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400'
							}`}
							title={t('masterKeyGenerator.copyKey')}
						>
							{copied ? <Check size={16} /> : <Copy size={16} />}
						</button>
					</div>
				</div>

				{/* Hidden File Input for Import */}
				<input
					type="file"
					id="import-json-input"
					className="hidden"
					accept=".json"
					onChange={handleFileChange}
				/>
			</div>

			{/* Action Buttons */}
			<div className="grid grid-cols-2 gap-3 mt-auto">
				{/* Download Menu Button */}
				<div className="relative" ref={menuRef}>
					<button
						onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
						className="w-full h-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors"
					>
						<Download size={18} />
						<span className="hidden xl:inline">
							{t('masterKeyGenerator.download')}
						</span>
						<ChevronDown
							size={14}
							className={`transition-transform ${isDownloadMenuOpen ? 'rotate-180' : ''}`}
						/>
					</button>

					{/* Dropdown Menu */}
					{isDownloadMenuOpen && (
						<div className="absolute left-0 bottom-full mb-2 w-full bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-20">
							<button
								onClick={handleDownloadHtml}
								className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-left transition-colors text-sm"
							>
								<FileCode size={16} className="text-blue-500" />
								<div>
									<div className="font-medium text-gray-800 dark:text-gray-200">
										{t('masterKeyGenerator.htmlFile')}
									</div>
									<div className="text-xs text-gray-400">
										{t('masterKeyGenerator.htmlFileDesc')}
									</div>
								</div>
							</button>
							<div className="h-px bg-gray-100 dark:bg-gray-800"></div>
							<button
								onClick={handleDownloadJson}
								className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-left transition-colors text-sm"
							>
								<FileJson size={16} className="text-yellow-500" />
								<div>
									<div className="font-medium text-gray-800 dark:text-gray-200">
										{t('masterKeyGenerator.jsonBackup')}
									</div>
									<div className="text-xs text-gray-400">
										{t('masterKeyGenerator.jsonBackupDesc')}
									</div>
								</div>
							</button>
						</div>
					)}
				</div>

				{/* Import Button */}
				<button
					onClick={handleImportClick}
					className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors"
					title={t('masterKeyGenerator.import')}
				>
					<Upload size={18} />
					<span className="hidden xl:inline">
						{t('masterKeyGenerator.import')}
					</span>
				</button>

				<button
					onClick={onReorder}
					className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors"
				>
					<ArrowUpDown size={18} />
					<span className="hidden xl:inline">
						{t('masterKeyGenerator.reorder')}
					</span>
				</button>

				<button
					onClick={onClearData}
					className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl font-medium transition-colors"
					title={t('masterKeyGenerator.clear')}
				>
					<Trash2 size={18} />
					<span>{t('masterKeyGenerator.clear')}</span>
				</button>

				<button
					onClick={onAddCard}
					className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 rounded-xl font-medium transition-colors shadow-lg"
				>
					<Plus size={18} />
					<span>{t('masterKeyGenerator.add')}</span>
				</button>
			</div>
		</div>
	);
}
