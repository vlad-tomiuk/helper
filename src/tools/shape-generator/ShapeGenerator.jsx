import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ControlsPanel from './components/ControlsPanel';
import ShapeCanvas from './components/ShapeCanvas';
import CodeOutput from './components/CodeOutput';
import { SHAPES, getShape } from './core/shapes';
import { pointsToCss } from './core/utils';

import { getPointColor } from './core/colors';

export default function ShapeGenerator() {
    const { t } = useTranslation();
    const [currentShape, setCurrentShape] = useState(getShape('triangle'));
    // Model holds the current state of the shape (points array OR params object)
    const [model, setModel] = useState([]);

    // Initialize model based on shape type
    const initModel = (shape) => {
        if (shape.type === 'polygon' || !shape.type) {
            return (shape.points || []).map((p, i) => ({
                ...p
            }));
        }
        // For other types, just clone the params
        return { ...shape.params };
    };

    useEffect(() => {
        if (currentShape) {
            setModel(initModel(currentShape));
        }
    }, []);

    const handleShapeSelect = (id) => {
        const shape = getShape(id);
        if (shape) {
            setCurrentShape(shape);
            setModel(initModel(shape));
        }
    };

    const handleReset = () => {
        const shape = getShape('triangle');
        setCurrentShape(shape);
        setModel(initModel(shape));
    };

    return (
        <main className="max-w-[1920px] mx-auto px-6 py-6 font-sans">
             {/* Back Button */}
             <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">{t('layout.common.backToHome')}</span>
            </Link>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:h-[calc(100vh-140px)] xl:min-h-[600px] h-auto">
                {/* Left: Controls */}
                <div className="flex flex-col gap-6 order-2 xl:order-1">
                    <ControlsPanel 
                        currentShape={currentShape} 
                        onShapeSelect={handleShapeSelect}
                        onReset={handleReset}
                    />
                    <CodeOutput 
                        model={model} 
                        type={currentShape?.type || 'polygon'} 
                        onUpdate={(path, value) => {
                            const newModel = Array.isArray(model) ? [...model] : { ...model };
                            
                            if (path.startsWith('points[')) {
                                // Handle polygon points: points[0].x
                                const match = path.match(/points\[(\d+)\]\.(\w)/);
                                if (match) {
                                    const index = parseInt(match[1]);
                                    const prop = match[2];
                                    newModel[index] = { ...newModel[index], [prop]: value };
                                }
                            } else {
                                // Handle direct properties: cx, cy, r, etc.
                                newModel[path] = value;
                            }
                            setModel(newModel);
                        }}
                    />
                </div>

                {/* Center/Right: Canvas (Takes 2 cols) */}
                <div className="xl:col-span-2 flex flex-col order-1 xl:order-2">
                    <ShapeCanvas 
                        model={model} 
                        type={currentShape?.type || 'polygon'}
                        isCustom={currentShape?.id === 'custom'}
                        onChange={setModel}
                        onReset={handleReset}
                        className="flex-1 shadow-sm border border-gray-200 dark:border-gray-800"
                    />
                </div>
            </div>
        </main>
    );
}
