import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Image as ImageIcon, Copy, Check, Info } from 'lucide-react';
import { cn } from '../../shared/utils/cn';

export default function AspectRatioCalculator() {
    const { t } = useTranslation();
    const [image, setImage] = useState(null);
    const [dimensions, setDimensions] = useState({ width: '', height: '' });
    const [aspectRatio, setAspectRatio] = useState(null);
    const [cssOutput, setCssOutput] = useState('');
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                const width = img.width;
                const height = img.height;
                setDimensions({ width, height });
                setImage(url);
                calculateRatio(width, height);
            };
            img.src = url;
        }
    };

    const handleManualChange = (field, value) => {
        const newValue = parseInt(value, 10);
        const newDimensions = { ...dimensions, [field]: isNaN(newValue) ? '' : newValue };
        setDimensions(newDimensions);
        
        // Remove uploaded image if manual input changes, or keep it? 
        // User might want to tweak uploaded image values. Let's keep the logic simple:
        // Input acts as source of truth.
        
        if (newDimensions.width && newDimensions.height) {
            calculateRatio(newDimensions.width, newDimensions.height);
        } else {
            setAspectRatio(null);
            setCssOutput('');
        }
    };

    const calculateRatio = (width, height) => {
        // User's formula: (min / (max / 100)) / 100
        const min = Math.min(width, height);
        const max = Math.max(width, height);
        
        // (min / (max / 100)) / 100  === min * 100 / max / 100 === min / max
        const formulaVal = (min / (max / 100)) / 100;
        
        // Keep precise for CSS
        const valRounded = parseFloat(formulaVal.toFixed(5));

        let resultString = '';
        
        if (width === height) {
            resultString = '1';
        } else if (width < height) {
            // "якщо ширина менша за фото тоді виводим значення із формули / 1"
            resultString = `${valRounded} / 1`;
        } else {
            // "а якщо більше тоді 1 / значення формули"
            resultString = `1 / ${valRounded}`;
        }

        setAspectRatio(resultString);
        setCssOutput(`aspect-ratio: ${resultString};`);
    };

    const handleCopy = () => {
        if (cssOutput) {
            navigator.clipboard.writeText(cssOutput);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <main className="max-w-[1920px] mx-auto px-6 py-6 font-sans">
            <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">{t('layout.common.backToHome')}</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Left Column: Controls (Upload + Manual Input) */}
                <div className="flex flex-col gap-6">
                     <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('aspectRatioCalculator.title')}</h2>
                        </div>

                         {/* Upload Area */}
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all mb-6 group"
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageUpload} 
                                accept="image/*" 
                                className="hidden" 
                            />
                            {image ? (
                                <div className="relative w-full flex justify-center">
                                    <img src={image} alt="Preview" className="max-h-[200px] object-contain rounded-lg shadow-sm" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                        <div className="bg-white/90 dark:bg-black/80 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                                            {t('aspectRatioCalculator.upload')}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-3 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('aspectRatioCalculator.upload')}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('aspectRatioCalculator.drop')}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="relative flex items-center justify-center mb-6">
                             <div className="h-px bg-gray-200 dark:bg-gray-800 w-full absolute"></div>
                             <span className="bg-white dark:bg-[#1e1e1e] px-3 text-xs font-medium text-gray-400 relative uppercase">
                                {t('aspectRatioCalculator.or')}
                             </span>
                        </div>

                        {/* Manual Input */}
                        <div>
                             <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                {t('aspectRatioCalculator.manualInput')}
                             </h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {t('aspectRatioCalculator.width')}
                                    </label>
                                    <input 
                                        type="number" 
                                        value={dimensions.width}
                                        onChange={(e) => handleManualChange('width', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                        placeholder="1920"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {t('aspectRatioCalculator.height')}
                                    </label>
                                   <input 
                                        type="number" 
                                        value={dimensions.height}
                                        onChange={(e) => handleManualChange('height', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                        placeholder="1080"
                                    />
                                </div>
                             </div>
                        </div>
                     </div>
                </div>

                {/* Right Column: Results */}
                <div className="flex flex-col gap-6">
                     <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 h-full">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                 <ImageIcon size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('aspectRatioCalculator.result')}</h2>
                        </div>

                        {aspectRatio ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                            {t('aspectRatioCalculator.dimensions')}
                                        </div>
                                        <div className="text-base font-mono font-semibold text-gray-900 dark:text-white">
                                            {dimensions.width} x {dimensions.height}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                                        <div className="text-xs font-medium text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-wider mb-1">
                                            {t('aspectRatioCalculator.ratio')}
                                        </div>
                                        <div className="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                            {aspectRatio}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Visual Ratio Preview Box */}
                                <div className="w-full flex justify-center py-4 bg-gray-50 dark:bg-gray-800/20 rounded-xl border border-gray-100 dark:border-gray-800 border-dashed">
                                    <div 
                                        className="bg-indigo-500/20 border-2 border-indigo-500 rounded-lg flex items-center justify-center text-xs font-medium text-indigo-600 dark:text-indigo-400 transition-all duration-500"
                                        style={{
                                            aspectRatio: aspectRatio.replace(' / ', '/').replace('1 / ', '1/'),
                                            width: dimensions.width >= dimensions.height ? '120px' : 'auto',
                                            height: dimensions.width < dimensions.height ? '120px' : 'auto',
                                            maxHeight: '160px',
                                            maxWidth: '100%'
                                        }}
                                    >
                                        Preview
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                         <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            {t('aspectRatioCalculator.cssOutput')}
                                            <Info size={14} className="text-gray-400" />
                                        </span>
                                    </div>
                                    <div className="relative group">
                                        <div className="bg-[#1e1e1e] text-gray-300 font-mono p-4 rounded-xl text-sm break-all border border-gray-800 shadow-inner">
                                            <span className="text-purple-400">aspect-ratio</span>: <span className="text-orange-300">{aspectRatio ? aspectRatio.split(' / ').join(' / ') : ''}</span>;
                                        </div>
                                        <button
                                            onClick={handleCopy}
                                            className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 backdrop-blur-sm"
                                            title={t('layout.copy.copy')}
                                        >
                                            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] text-center text-gray-400 dark:text-gray-600">
                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                                     <ImageIcon size={32} className="opacity-50" />
                                </div>
                                <p className="text-sm max-w-[200px]">
                                    {t('aspectRatioCalculator.drop')} {t('aspectRatioCalculator.or')} {t('aspectRatioCalculator.manualInput')}
                                </p>
                            </div>
                        )}
                     </div>
                </div>
            </div>
        </main>
    );
}
