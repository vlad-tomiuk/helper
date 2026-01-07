import React from 'react';
import { useTranslation } from 'react-i18next';
import { Square, Triangle, Hexagon, Star } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { SHAPES } from '../core/shapes';

export default function ControlsPanel({
    currentShape,
    onShapeSelect,
    className
}) {
    const { t } = useTranslation();

    // Custom SVG icons for specific shapes
    const ShapeIcons = {
        triangle: Triangle,
        square: Square,
        pentagon: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                <path d="M12 2L2 9l4 13h12l4-13-10-7z" />
            </svg>
        ),
        hexagon: Hexagon,
        star: Star,
        rhombus: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                <path d="M12 2L2 12l10 10 10-10L12 2z" />
            </svg>
        ),
        trapezoid: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                 <path d="M4 20h16L18 4H6L4 20z" />
            </svg>
        ),
        parallelogram: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                <path d="M6 3L2 21h16l4-18H6z" />
            </svg>
        ),
        arrowRight: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                 <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
        ),
        arrowLeft: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
        ),
        chevron: ({ className, size = 24, ...props }) => ( // Keep for backward compat, mapped to Right
             <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                <path d="M6 4l12 8-12 8 4-8z" />
            </svg>
        ),
        rightChevron: ({ className, size = 24, ...props }) => (
             <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                <path d="M6 4l12 8-12 8 4-8z" />
            </svg>
        ),
        leftChevron: ({ className, size = 24, ...props }) => (
             <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                <path d="M18 4l-12 8 12 8-4-8z" /> 
            </svg>
        ),
        cross: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                 <path d="M12 5v14M5 12h14" />
            </svg>
        ),
        close: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                 <path d="M18 6L6 18M6 6l12 12" />
            </svg>
        ),
        octagon: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                 <path d="M7.8 2h8.4l5.8 5.8v8.4l-5.8 5.8H7.8L2 16.2V7.8z" />
            </svg>
        ),
        decagon: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                 <path d="M12 2l5.9 1.9L22 9.5v5l-4.1 5.6L12 22l-5.9-1.9L2 14.5v-5l4.1-5.6z" />
            </svg>
        ),
        bevel: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                 <path d="M6 2h12l4 4v12l-4 4H6l-4-4V6z" />
            </svg>
        ),
        rabbet: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                 <path d="M6 2h12v4h4v16H2V6h4z" />
            </svg>
        ),
        leftPoint: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                 <path d="M2 12l6-10h14v20H8z" />
            </svg>
        ),
        rightPoint: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                 <path d="M22 12l-6-10H2v20h14z" />
            </svg>
        ),
        message: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        cloud: ({ className, size = 24, ...props }) => (
             <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
            </svg>
        ),
        circle: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                 <circle cx="12" cy="12" r="10" />
            </svg>
        ),
        ellipse: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                 <ellipse cx="12" cy="12" rx="6" ry="10" />
            </svg>
        ),
        inset: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                 <rect x="5" y="5" width="14" height="14" />
            </svg>
        ),
        custom: ({ className, size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                 <path d="M7 19V5l10 14V5" />
            </svg>
        )
    };

    return (
        <div className={cn(
            "bg-white dark:bg-[#1e1e1e] rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800",
            className
        )}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                    {t('clipPathGenerator.shapes')}
                </h2>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {Object.values(SHAPES).map((shape) => {
                    // Fallback icon if specific one not found
                    const Icon = ShapeIcons[shape.id] || Square; 
                    const isSelected = currentShape.id === shape.id;

                    return (
                        <button
                            key={shape.id}
                            onClick={() => onShapeSelect(shape.id)}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-lg transition-all",
                                "hover:bg-gray-100 dark:hover:bg-gray-700",
                                isSelected ? "bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500" : "bg-gray-50 dark:bg-gray-800"
                            )}
                            title={shape.name}
                        >
                            <Icon 
                                size={24} 
                                className={cn(
                                    "mb-1",
                                    isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"
                                )}
                            />
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                <p>
                    {currentShape.id === 'custom' 
                        ? t('clipPathGenerator.instructions.custom')
                        : currentShape.type === 'polygon'
                            ? t('clipPathGenerator.instructions.polygon')
                            : t('clipPathGenerator.instructions.default')}
                </p>
            </div>
        </div>
    );
}