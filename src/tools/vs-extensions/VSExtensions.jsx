import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileCode, Download, Search, AlertCircle, Loader2, Package } from 'lucide-react';

export default function VSExtensions() {
    const { t } = useTranslation();
    
    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // View State
    const [view, setView] = useState('initial'); // 'initial', 'list', 'details'
    const [searchResults, setSearchResults] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    // Selected Extension State (Details View)
    const [selectedExtension, setSelectedExtension] = useState(null);
    const [versions, setVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState('latest');
    const [iconUrl, setIconUrl] = useState('');

    const PAGE_SIZE = 15;
    
    // Proxy handling logic
    const PROXY_LIST = [
        // 1. Direct/Local Proxy (Works in Dev, fails in Prod usually)
        (url) => url,
        // 2. Corsproxy.io (Very reliable)
        (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
        // 3. AllOrigins (Fallback)
        (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    ];

    const fetchWithFallback = async (targetUrl, options) => {
        let lastError;

        for (const proxyFn of PROXY_LIST) {
            try {
                const finalUrl = proxyFn(targetUrl);
                // If using local proxy (starts with /), don't change it.
                // If actual URL, ensure it's absolute for proxies.
                // Our targetUrl here is relative '/vs-api/...' for dev, but for prod we need absolute for proxies.
                
                // ADJUSTMENT: We need to handle the URL construction carefully.
                // Dev: /vs-api/... -> Local Vite Proxy -> VS Marketplace
                // Prod: https://marketplace... -> CORS Proxy
                
                let fetchUrl = finalUrl;
                
                // If we are in PROD mode (implied by failing first attempt or just standard check), 
                // we should be targeting the real URL via a proxy, not the local /vs-api path.
                
                // Let's redefine the strategy:
                // Attempt 1: Standard Configured Path (Local Proxy or Direct)
                // If that fails, switch to Full URL + CORS Proxy.
                
                const response = await fetch(fetchUrl, options);
                if (!response.ok) throw new Error(`Status: ${response.status}`);
                return await response.json();
            } catch (err) {
                console.warn(`Proxy attempt failed: ${proxyFn(targetUrl)}`, err);
                lastError = err;
                // Continue to next proxy
            }
        }
        throw lastError;
    };

    const parseInput = (input) => {
        // 1. Check if URL
        if (input.startsWith('http')) {
            try {
                const urlObj = new URL(input);
                const params = new URLSearchParams(urlObj.search);
                const itemName = params.get('itemName');
                if (itemName && itemName.includes('.')) {
                    const [pub, ext] = itemName.split('.');
                    return { type: 'explicit_url', publisher: pub, extensionName: ext };
                }
            } catch (e) {
                // ignore
            }
        }
        
        // 2. Check if "Potential ID" (No spaces, contains dot)
        if (input.includes('.') && !input.includes(' ')) {
             const parts = input.split('.');
             if (parts.length >= 2 && parts[0] && parts[1]) {
                 return { type: 'potential_id', publisher: parts[0], extensionName: parts.slice(1).join('.'), term: input };
             }
        }

        // 3. Default to keyword search
        return { type: 'search', term: input };
    };

    const fetchExtensions = async (criteria, page = 1) => {
        // We define the REAL target endpoint for proxies
        const realTarget = 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery';
        // The local path for dev
        const localPath = '/vs-api/extensionquery';

        const body = {
            filters: [
                {
                    criteria: criteria,
                    pageNumber: page,
                    pageSize: PAGE_SIZE
                }
            ],
            flags: 271
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json;api-version=3.0-preview.1'
            },
            body: JSON.stringify(body)
        };

        // Try Local/Primary first
        try {
            const response = await fetch(localPath, options);
            if (!response.ok) throw new Error(`Local Proxy Failed: ${response.status}`);
            return await response.json();
        } catch (err) {
            console.warn('Primary fetch failed, trying CORS proxies...', err);
            
            // Fallback Chain
            const proxies = [
                // Proxy 1: Corsproxy.io
                `https://corsproxy.io/?${encodeURIComponent(realTarget)}`,
                // Proxy 2: AllOrigins (Less reliable for POST, but worth a try if supported)
                // Note: straightforward POSTs might not work with all free proxies due to body handling. 
                // Let's rely on corsproxy.io primarily as it handles POST well.
            ];

            for (const proxyUrl of proxies) {
               try {
                   const res = await fetch(proxyUrl, options);
                   if (!res.ok) throw new Error(`Proxy ${proxyUrl} failed`);
                   return await res.json();
               } catch (e) {
                   console.error(e);
               }
            }
            throw new Error(t('vsExtensions.errorFetchFailed'));
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setError('');
        setSearchResults([]);
        setTotalResults(0);
        setCurrentPage(1);
        setView('initial');

        try {
            let parsed = parseInput(searchTerm.trim());
            let data = null;
            let usedMethod = parsed.type;

            // Strategy 1: Try Exact Match (for URL or Potential ID)
            if (parsed.type === 'explicit_url' || parsed.type === 'potential_id') {
                const criteria = [{ filterType: 7, value: `${parsed.publisher}.${parsed.extensionName}` }];
                try {
                    data = await fetchExtensions(criteria, 1);
                    
                    // Check if we actually found something
                    const results = data?.results?.[0]?.extensions || [];
                    if (results.length > 0) {
                        // FOUND! Treat as exact match.
                        usedMethod = 'match_found'; 
                    } else if (parsed.type === 'potential_id') {
                        // Not found, but it was just a "potential" ID (like Node.js). 
                        // Fallback to keyword search.
                        data = null; // Reset data to force search
                        usedMethod = 'search_fallback';
                    }
                } catch (err) {
                    if (parsed.type === 'potential_id') {
                        // Error fetching ID? Fallback to search.
                         usedMethod = 'search_fallback';
                    } else {
                        throw err;
                    }
                }
            }

            // Strategy 2: Keyword Search (if Search type OR Fallback triggered)
            if (usedMethod === 'search' || usedMethod === 'search_fallback') {
                const term = parsed.term || searchTerm.trim();
                const criteria = [{ filterType: 10, value: term }];
                data = await fetchExtensions(criteria, 1);
            }

            // Process Final Data
            if (data && data.results && data.results[0] && data.results[0].extensions) {
                const results = data.results[0].extensions;
                const total = data.results[0].resultMetadata?.find(m => m.metadataType === 'ResultCount')?.metadataItems[0]?.count || results.length;

                if (results.length === 0) {
                     setError(t('vsExtensions.noResults'));
                } else if (results.length === 1 && (usedMethod === 'match_found' || parsed.type === 'explicit_url')) {
                    // Exact match found via ID/URL logic -> Details
                    selectExtension(results[0]);
                } else {
                    // List view (Search results)
                    setSearchResults(results);
                    setTotalResults(total);
                    setView('list');
                }
            } else {
                 setError(t('vsExtensions.noResults'));
            }

        } catch (err) {
            console.error(err);
            setError(t('vsExtensions.errorFetchFailed'));
        } finally {
            setLoading(false);
        }
    };

    const loadMore = async () => {
        const nextPage = currentPage + 1;
        setLoading(true);
        try {
            const parsed = parseInput(searchTerm.trim());
            let criteria = [];
            if (parsed.type === 'exact') {
                 criteria = [{ filterType: 7, value: `${parsed.publisher}.${parsed.extensionName}` }];
            } else {
                criteria = [{ filterType: 10, value: parsed.term }];
            }

            const data = await fetchExtensions(criteria, nextPage);
            if (data && data.results && data.results[0] && data.results[0].extensions) {
                 setSearchResults(prev => [...prev, ...data.results[0].extensions]);
                 setCurrentPage(nextPage);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const selectExtension = (extData) => {
        const pub = extData.publisher.publisherName;
        const name = extData.extensionName;
        // Deduplicate versions using Set
        const vs = [...new Set(extData.versions.map(v => v.version))];
        
        let icon = '';
        if (extData.versions.length > 0) {
            const latest = extData.versions[0];
            const iconFile = latest.files?.find(f => f.assetType === 'Microsoft.VisualStudio.Services.Icons.Default' || f.assetType === 'Microsoft.VisualStudio.Services.Icons.Small');
            if (iconFile) icon = iconFile.source;
        }

        setSelectedExtension({
            publisher: pub,
            extensionName: name,
            displayName: extData.displayName,
            description: extData.shortDescription,
            icon: icon
        });
        setVersions(vs);
        setSelectedVersion(vs[0] || 'latest');
        setIconUrl(icon);
        setView('details');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getDownloadUrl = () => {
        if (!selectedExtension) return '#';
        const { publisher, extensionName } = selectedExtension;
        const ver = selectedVersion === 'latest' ? 'latest' : selectedVersion;
        return `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${publisher}/vsextensions/${extensionName}/${ver}/vspackage`;
    };

    return (
        <main className="max-w-[1920px] mx-auto px-4 md:px-6 py-4 md:py-6 font-sans text-gray-900 dark:text-gray-100">
             <div className="flex items-center gap-4 mb-4 md:mb-6">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">{t('vsExtensions.backToHome')}</span>
                </Link>
             </div>

            <div className="max-w-4xl mx-auto">
                 <div className="bg-white dark:bg-[#1e1e1e] p-4 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 transition-all">
                    
                    {/* Header/Search Area */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <FileCode size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <h1 className="text-xl font-bold">{t('vsExtensions.title')}</h1>
                        </div>

                        <form onSubmit={handleSearch} className="relative flex flex-col md:block">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t('vsExtensions.placeholder')}
                                    className="w-full pl-10 md:pl-12 pr-12 md:pr-32 py-3 md:py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252525] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white text-base md:text-lg shadow-sm"
                                />
                                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                
                                {/* Mobile Search Icon Button (inside input) */}
                                <button
                                    type="submit"
                                    disabled={loading || !searchTerm}
                                    className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                                </button>
                            </div>

                            {/* Desktop Button (Absolute right) */}
                            <button
                                type="submit"
                                disabled={loading || !searchTerm}
                                className="hidden md:flex absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors items-center justify-center"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : t('vsExtensions.fetchButton')}
                            </button>
                        </form>
                        
                        {error && (
                            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* View: List */}
                    {view === 'list' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                    {t('vsExtensions.resultsCount', { count: totalResults })}
                                </h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {searchResults.map((ext) => {
                                    const icon = ext.versions[0]?.files?.find(f => f.assetType?.includes('Icons.Default'))?.source;
                                    return (
                                        <div 
                                            key={ext.extensionId}
                                            onClick={() => selectExtension(ext)}
                                            className="group p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 bg-gray-50 dark:bg-[#252525] cursor-pointer transition-all hover:shadow-md flex gap-4 items-start"
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-white dark:bg-[#333] border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0 overflow-hidden">
                                                {icon ? <img src={icon} alt="" className="w-full h-full object-contain" /> : <Package size={24} className="text-gray-400" />}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 transition-colors">
                                                    {ext.displayName || ext.extensionName}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                    {ext.publisher.publisherName} • {ext.versions[0]?.version}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                                    {ext.shortDescription}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {searchResults.length < totalResults && (
                                <div className="mt-8 text-center">
                                    <button
                                        onClick={loadMore}
                                        disabled={loading}
                                        className="px-8 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                                        {t('vsExtensions.loadMore')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* View: Details */}
                    {view === 'details' && selectedExtension && (
                        <div className="animate-in fade-in slide-in-from-right-8">
                             <button
                                onClick={() => setView(searchResults.length > 0 ? 'list' : 'initial')}
                                className="mb-8 text-sm flex items-center gap-2 px-3 py-2 -ml-3 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-gray-50 dark:hover:text-blue-400 dark:hover:bg-white/5 transition-all bg-transparent border-none cursor-pointer"
                             >
                                <ArrowLeft size={18} />
                                <span className="font-medium">{searchResults.length > 0 ? t('vsExtensions.searchResults') : t('vsExtensions.backToHome')}</span>
                             </button>

                             <div className="flex flex-col md:flex-row gap-8">
                                {/* Icon */}
                                <div className="shrink-0">
                                    <div className="w-32 h-32 bg-gray-50 dark:bg-[#252525] rounded-3xl flex items-center justify-center border border-gray-100 dark:border-gray-800">
                                        {iconUrl ? (
                                            <img src={iconUrl} alt="Icon" className="w-20 h-20 object-contain drop-shadow-sm" />
                                        ) : (
                                            <Package size={48} className="text-gray-300" />
                                        )}
                                    </div>
                                </div>
                                
                                {/* Info & Actions */}
                                <div className="flex-1 min-w-0">
                                    <div className="mb-6">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
                                            {selectedExtension.displayName}
                                        </h2>
                                        
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 dark:text-gray-200">
                                                    {selectedExtension.publisher}
                                                </span>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                            <span className="font-mono opacity-70">
                                                {selectedExtension.publisher}.{selectedExtension.extensionName}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 max-w-2xl text-lg">
                                        {selectedExtension.description}
                                    </p>

                                    {/* Action Row - Minimalist */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                         <div className="relative min-w-[140px]">
                                            <select
                                                value={selectedVersion}
                                                onChange={(e) => setSelectedVersion(e.target.value)}
                                                className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-gray-50 dark:bg-[#252525] border-0 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-all appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                                            >
                                                <option value="latest">Latest</option>
                                                {versions.map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                         </div>

                                         <a
                                            href={getDownloadUrl()}
                                            className="flex-1 sm:flex-none px-8 py-3.5 bg-blue-600 text-white hover:text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-blue-500/20"
                                        >
                                            <Download size={18} strokeWidth={2.5} />
                                            <span>{t('vsExtensions.downloadButton')}</span>
                                        </a>

                                        {versions.length === 0 && (
                                            <span className="text-xs text-orange-500 flex items-center gap-1">
                                                <AlertCircle size={14} />
                                                Fallback
                                            </span>
                                        )}
                                    </div>
                                    
                                    <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">
                                        {t('vsExtensions.directDownloadNote')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'initial' && !loading && !error && (
                         <div className="text-center py-12 text-gray-400">
                            <Search size={48} className="mx-auto mb-4 opacity-20" />
                            <p>{t('vsExtensions.placeholder')}</p>
                         </div>
                    )}

                 </div>
            </div>
        </main>
    );
}
