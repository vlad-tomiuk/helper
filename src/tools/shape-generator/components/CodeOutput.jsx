import React from 'react';
import { Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../shared/utils/cn';
import CopyButton from '../../../shared/components/CopyButton/CopyButton';

import { getPointColor } from '../core/colors';

const EditableValue = ({ value, color, onUpdate }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [tempValue, setTempValue] = React.useState(value);
    const inputRef = React.useRef(null);

    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (tempValue !== value) {
            onUpdate(tempValue);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleBlur();
        } else if (e.key === 'Escape') {
            setTempValue(value);
            setIsEditing(false);
        }
    };

    const displayValue = typeof value === 'number' ? `${value}%` : (value.includes('%') || value.includes('px') || value.includes('calc') || value.includes('rem') ? value : `${value}%`);

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                className="inline-block bg-gray-800 border-none outline-none p-0 m-0 w-[4ch] min-w-fit font-mono text-sm align-baseline focus:ring-1 focus:ring-indigo-500 rounded px-0.5"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                style={{ 
                    width: `${(tempValue?.toString().length || 1) + 1}ch`,
                    color: color 
                }}
            />
        );
    }

    return (
        <span 
            className="cursor-edit border-b border-dashed border-gray-600 hover:border-indigo-400 transition-colors px-0.5"
            style={{ color: color }}
            onClick={() => {
                setTempValue(value);
                setIsEditing(true);
            }}
        >
            {displayValue}
        </span>
    );
};

export default function CodeOutput({ model, type, onUpdate, className }) {
    const { t } = useTranslation();

    const generateCss = () => {
        if (!model) return '';
        
        const formatValue = (v) => typeof v === 'number' ? `${Math.round(v)}%` : (v.includes('%') || v.includes('px') || v.includes('calc') || v.includes('rem') ? v : `${v}%`);

        switch (type) {
            case 'circle':
                return `clip-path: circle(${formatValue(model.r)} at ${formatValue(model.cx)} ${formatValue(model.cy)});`;
            case 'ellipse':
                return `clip-path: ellipse(${formatValue(model.rx)} ${formatValue(model.ry)} at ${formatValue(model.cx)} ${formatValue(model.cy)});`;
            case 'inset':
                return `clip-path: inset(${formatValue(model.t)} ${formatValue(model.r)} ${formatValue(model.b)} ${formatValue(model.l)});`;
            case 'polygon':
            default:
                if (!Array.isArray(model)) return '';
                return `clip-path: polygon(${model.map(p => `${formatValue(p.x)} ${formatValue(p.y)}`).join(', ')});`;
        }
    };

    const handleUpdate = (path, newValue) => {
        if (!onUpdate) return;
        
        // Convert to number if valid numeric string, else keep as string
        const processedValue = (typeof newValue === 'string' && !isNaN(newValue) && newValue.trim() !== '') 
            ? parseFloat(newValue) 
            : newValue;

        onUpdate(path, processedValue);
    };

    const cssCodeText = generateCss();

    const renderPolygonValues = () => (
        <>
            <span className="text-[#8be9fd]">polygon</span>(
            {Array.isArray(model) && model.map((p, i) => {
                const color = getPointColor(i);
                const isLast = i === model.length - 1;
                return (
                    <span key={i}>
                        <EditableValue 
                            value={typeof p.x === 'number' ? Math.round(p.x) : p.x} 
                            color={color} 
                            onUpdate={(val) => handleUpdate(`points[${i}].x`, val)}
                        />
                        {' '}
                        <EditableValue 
                            value={typeof p.y === 'number' ? Math.round(p.y) : p.y} 
                            color={color} 
                            onUpdate={(val) => handleUpdate(`points[${i}].y`, val)}
                        />
                        {!isLast && ', '}
                    </span>
                );
            })}
            )
        </>
    );

    const renderCircleValues = () => (
        <>
            <span className="text-[#8be9fd]">circle</span>(
            <EditableValue 
                value={typeof model.r === 'number' ? Math.round(model.r) : model.r} 
                color="#ffb86c" 
                onUpdate={(val) => handleUpdate('r', val)}
            /> at <EditableValue 
                value={typeof model.cx === 'number' ? Math.round(model.cx) : model.cx} 
                color="#50fa7b" 
                onUpdate={(val) => handleUpdate('cx', val)}
            /> <EditableValue 
                value={typeof model.cy === 'number' ? Math.round(model.cy) : model.cy} 
                color="#50fa7b" 
                onUpdate={(val) => handleUpdate('cy', val)}
            />
            )
        </>
    );

    const renderEllipseValues = () => (
        <>
            <span className="text-[#8be9fd]">ellipse</span>(
            <EditableValue 
                value={typeof model.rx === 'number' ? Math.round(model.rx) : model.rx} 
                color={getPointColor(0)} 
                onUpdate={(val) => handleUpdate('rx', val)}
            /> <EditableValue 
                value={typeof model.ry === 'number' ? Math.round(model.ry) : model.ry} 
                color={getPointColor(2)} 
                onUpdate={(val) => handleUpdate('ry', val)}
            /> at <EditableValue 
                value={typeof model.cx === 'number' ? Math.round(model.cx) : model.cx} 
                color="#50fa7b" 
                onUpdate={(val) => handleUpdate('cx', val)}
            /> <EditableValue 
                value={typeof model.cy === 'number' ? Math.round(model.cy) : model.cy} 
                color="#50fa7b" 
                onUpdate={(val) => handleUpdate('cy', val)}
            />
            )
        </>
    );

    const renderInsetValues = () => (
        <>
            <span className="text-[#8be9fd]">inset</span>(
            <EditableValue 
                value={typeof model.t === 'number' ? Math.round(model.t) : model.t} 
                color={getPointColor(0)} 
                onUpdate={(val) => handleUpdate('t', val)}
            /> <EditableValue 
                value={typeof model.r === 'number' ? Math.round(model.r) : model.r} 
                color={getPointColor(1)} 
                onUpdate={(val) => handleUpdate('r', val)}
            /> <EditableValue 
                value={typeof model.b === 'number' ? Math.round(model.b) : model.b} 
                color={getPointColor(2)} 
                onUpdate={(val) => handleUpdate('b', val)}
            /> <EditableValue 
                value={typeof model.l === 'number' ? Math.round(model.l) : model.l} 
                color={getPointColor(3)} 
                onUpdate={(val) => handleUpdate('l', val)}
            />
            )
        </>
    );

    return (
        <div className={cn(
            "bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800",
            className
        )}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a]">
                <h3 className="font-medium text-sm text-gray-700 dark:text-gray-200">
                    CSS Output
                </h3>
                <CopyButton text={cssCodeText} />
            </div>
            
            <div className="relative group">
                <pre className="p-4 bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto whitespace-pre-wrap break-all h-full min-h-[100px]">
                    <span className="text-[#ff79c6]">clip-path</span>: {' '}
                    {type === 'polygon' && renderPolygonValues()}
                    {type === 'circle' && renderCircleValues()}
                    {type === 'ellipse' && renderEllipseValues()}
                    {type === 'inset' && renderInsetValues()}
                    ;
                </pre>
            </div>
        </div>
    );
}
