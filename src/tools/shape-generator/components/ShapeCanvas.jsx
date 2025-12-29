import React, { useRef, useState, useEffect } from 'react';
import { cn } from '../../../shared/utils/cn';
import { getPointColor } from '../core/colors';
import { Smartphone, Tablet, Laptop, Monitor, RotateCcw, Eye, EyeOff } from 'lucide-react';

export default function ShapeCanvas({ model, type = 'polygon', isCustom, onChange, onReset, className }) {
    const svgRef = useRef(null);
    const [draggingId, setDraggingId] = useState(null); // 'index' for polygon, or 'id' for handles
    const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });
    const [showPoints, setShowPoints] = useState(true);

    const presets = {
        mobile: { width: 360, height: 640 },
        tablet: { width: 768, height: 1024 },
        laptop: { width: 1280, height: 800 },
        desktop: { width: 1600, height: 900 }
    };

    const handlePreset = (preset) => {
        setCanvasSize(presets[preset]);
    };

    // Helper: Resolve any CSS value (px, %, calc, etc.) to a 0-100 percentage relative to the canvas
    const resolveToPercent = (value, axis = 'x') => {
        if (typeof value === 'number') return value;
        if (!value) return 0;
        
        // Simple numeric strings are treated as percentages
        if (!isNaN(value) && value.trim() !== '') return parseFloat(value);
        
        try {
            // Create a temporary element to let the browser resolve the CSS value
            const temp = document.createElement('div');
            temp.style.position = 'absolute';
            temp.style.visibility = 'hidden';
            
            // We use the current canvas dimensions to resolve units like 'px' correctly
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.visibility = 'hidden';
            container.style.width = `${canvasSize.width}px`;
            container.style.height = `${canvasSize.height}px`;
            
            const normalizedValue = value.includes('%') || value.includes('px') || value.includes('calc') ? value : `${value}%`;
            if (axis === 'x') {
                temp.style.left = normalizedValue;
            } else {
                temp.style.top = normalizedValue;
            }
            
            container.appendChild(temp);
            document.body.appendChild(container);
            
            const computed = window.getComputedStyle(temp);
            const resolvedPixels = parseFloat(axis === 'x' ? computed.left : computed.top);
            
            document.body.removeChild(container);
            
            const total = axis === 'x' ? canvasSize.width : canvasSize.height;
            return isNaN(resolvedPixels) ? 0 : (resolvedPixels / total) * 100;
        } catch (e) {
            console.error('Failed to resolve CSS value:', value, e);
            return parseFloat(value) || 0;
        }
    };

    // Helper: 0-100% to Pixels for SVG ViewBox
    const p2x = (v) => (resolveToPercent(v, 'x') * canvasSize.width) / 100;
    const p2y = (v) => (resolveToPercent(v, 'y') * canvasSize.height) / 100;

    // Coordinate conversion utilities
    const toSvgCoord = (clientX, clientY) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const rect = svgRef.current.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;
        return {
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y))
        };
    };

    const distToSegment = (px, py, x1, y1, x2, y2) => {
        const l2 = (x1 - x2) ** 2 + (y1 - y2) ** 2;
        if (l2 === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
        let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.sqrt((px - (x1 + t * (x2 - x1))) ** 2 + (py - (y1 + t * (y2 - y1))) ** 2);
    };

    const handleCanvasClick = (e) => {
        // Only polygons support point addition
        if (type !== 'polygon' || draggingId !== null) return;
        
        const { x, y } = toSvgCoord(e.clientX, e.clientY);
        const currentPoints = Array.isArray(model) ? model : [];
        
        if (isCustom) {
            // In custom mode, add points anywhere
            const newPoints = [...currentPoints];
            newPoints.push({
                x: Math.round(x * 10) / 10,
                y: Math.round(y * 10) / 10
            });
            onChange(newPoints);
        } else {
            // In predefined polygon mode, add points only on segments
            if (currentPoints.length < 2) return;
            
            let bestDist = Infinity;
            let insertIndex = -1;
            const threshold = 2; // Distance threshold in SVG percentage units

            for (let i = 0; i < currentPoints.length; i++) {
                const p1 = currentPoints[i];
                const p2 = currentPoints[(i + 1) % currentPoints.length];
                const d = distToSegment(x, y, p1.x, p1.y, p2.x, p2.y);
                
                if (d < bestDist) {
                    bestDist = d;
                    insertIndex = i + 1;
                }
            }

            if (bestDist < threshold) {
                const newPoints = [...currentPoints];
                newPoints.splice(insertIndex, 0, {
                    x: Math.round(x * 10) / 10,
                    y: Math.round(y * 10) / 10
                });
                onChange(newPoints);
            }
        }
    };

    const handlePointerDown = (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggingId(id);
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (draggingId === null) return;
        e.preventDefault();
        const { x, y } = toSvgCoord(e.clientX, e.clientY);
        
        if (type === 'polygon') {
            const newPoints = [...model];
            newPoints[draggingId] = { ...newPoints[draggingId], x, y };
            onChange(newPoints);
        } else if (type === 'circle') {
            const newModel = { ...model };
            if (draggingId === 'center') {
                newModel.cx = x;
                newModel.cy = y;
            } else if (draggingId === 'radius') {
                const dx = x - newModel.cx;
                const dy = y - newModel.cy;
                // Radius in percentage units relative to width (standard clip-path behavior)
                newModel.r = Math.sqrt(dx * dx + dy * dy);
            }
            onChange(newModel);
        } else if (type === 'ellipse') {
            const newModel = { ...model };
            if (draggingId === 'center') {
                newModel.cx = x;
                newModel.cy = y;
            } else if (draggingId === 'rx') {
                newModel.rx = Math.abs(x - newModel.cx);
            } else if (draggingId === 'ry') {
                newModel.ry = Math.abs(y - newModel.cy);
            }
            onChange(newModel);
        } else if (type === 'inset') {
             const newModel = { ...model };
             if (draggingId === 'top') {
                 newModel.t = Math.min(y, 100 - newModel.b - 5);
             } else if (draggingId === 'bottom') {
                 newModel.b = Math.min(100 - y, 100 - newModel.t - 5);
             } else if (draggingId === 'left') {
                 newModel.l = Math.min(x, 100 - newModel.r - 5);
             } else if (draggingId === 'right') {
                 newModel.r = Math.min(100 - x, 100 - newModel.l - 5);
             }
             onChange(newModel);
        }
    };

    const handlePointerUp = (e) => {
        if (draggingId !== null) {
            e.target.releasePointerCapture(e.pointerId);
            setDraggingId(null);
        }
    };

    const handleDeletePoint = (index, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (type !== 'polygon' || !Array.isArray(model) || model.length <= 3) return;
        
        const newPoints = model.filter((_, i) => i !== index);
        onChange(newPoints);
    };

    // Helper: Render a handle with fixed pixels to prevent distortion
    const RenderHandle = ({ id, x, y, color, onDelete, cursor = "cursor-move" }) => {
        const isDragging = draggingId === id;
        return (
            <g 
                onPointerDown={(e) => handlePointerDown(id, e)} 
                onContextMenu={(e) => {
                    e.preventDefault();
                    if (onDelete) onDelete(e);
                }}
                className={cn("group outline-none", cursor)}
                transform={`translate(${p2x(x)}, ${p2y(y)})`}
            >
                <circle cx={0} cy={0} r={16} fill="transparent" stroke="none" />
                <circle 
                    cx={0} 
                    cy={0} 
                    r={9} 
                    fill="white" 
                    stroke={color} 
                    strokeWidth={4}
                    className="transition-[r,stroke-width] duration-200 pointer-events-none"
                />
            </g>
        );
    };

    // Render Logic (same renderContent but p2x/p2y used)
    const renderContent = () => {
        if (!model) return null;

        if (type === 'polygon') {
            const pointsStr = Array.isArray(model) && model.length > 0 ? model.map(p => `${p2x(p.x)},${p2y(p.y)}`).join(' ') : '';
            return (
                <>
                    {Array.isArray(model) && model.length > 0 && (
                        <polygon points={pointsStr} className="fill-none stroke-indigo-500 stroke-[0.8]" clipPath="url(#canvas-clip)" />
                    )}
                    {showPoints && Array.isArray(model) && model.map((p, i) => (
                        <RenderHandle 
                            key={i} 
                            id={i} 
                            x={parseVal(p.x)} 
                            y={parseVal(p.y)} 
                            color={getPointColor(i)} 
                            onDelete={(e) => handleDeletePoint(i, e)}
                        />
                    ))}
                </>
            );
        } else if (type === 'circle') {
            return (
                <>
                    <circle cx={p2x(parseVal(model.cx))} cy={p2y(parseVal(model.cy))} r={p2x(parseVal(model.r))} className="fill-none stroke-indigo-500 stroke-[0.8]" clipPath="url(#canvas-clip)" />
                    {showPoints && (
                        <>
                            <RenderHandle id="center" x={parseVal(model.cx)} y={parseVal(model.cy)} color="#50fa7b" />
                            <RenderHandle id="radius" x={parseVal(model.cx) + parseVal(model.r)} y={parseVal(model.cy)} color="#ffb86c" cursor="cursor-ew-resize" />
                            <line 
                                x1={p2x(model.cx)} y1={p2y(model.cy)} 
                                x2={p2x(model.cx + model.r)} y2={p2y(model.cy)} 
                                stroke="#ffb86c" strokeDasharray="4 2" strokeWidth={0.5} opacity={0.8} pointerEvents="none" 
                            />
                        </>
                    )}
                </>
            );
        } else if (type === 'ellipse') {
            return (
                <>
                    <ellipse cx={p2x(parseVal(model.cx))} cy={p2y(parseVal(model.cy))} rx={p2x(parseVal(model.rx))} ry={p2y(parseVal(model.ry))} className="fill-none stroke-indigo-500 stroke-[0.8]" clipPath="url(#canvas-clip)" />
                    {showPoints && (
                        <>
                            <RenderHandle id="center" x={parseVal(model.cx)} y={parseVal(model.cy)} color="#50fa7b" />
                            <RenderHandle id="rx" x={parseVal(model.cx) + parseVal(model.rx)} y={parseVal(model.cy)} color={getPointColor(0)} cursor="cursor-ew-resize" />
                            <RenderHandle id="ry" x={parseVal(model.cx)} y={parseVal(model.cy) + parseVal(model.ry)} color={getPointColor(2)} cursor="cursor-ns-resize" />
                        </>
                    )}
                </>
            );
        } else if (type === 'inset') {
             const x = p2x(model.l);
             const y = p2y(model.t);
             const width = p2x(100 - model.l - model.r);
             const height = p2y(100 - model.t - model.b);
             const centerX = (model.l + (100 - model.r)) / 2;
             const centerY = (model.t + (100 - model.b)) / 2;
             return (
                 <>
                    <rect x={p2x(parseVal(model.l))} y={p2y(parseVal(model.t))} width={p2x(100 - parseVal(model.l) - parseVal(model.r))} height={p2y(100 - parseVal(model.t) - parseVal(model.b))} className="fill-none stroke-indigo-500 stroke-[0.8]" clipPath="url(#canvas-clip)" />
                    {showPoints && (
                        <>
                            <RenderHandle id="top" x={(parseVal(model.l) + (100 - parseVal(model.r))) / 2} y={parseVal(model.t)} color={getPointColor(0)} cursor="cursor-ns-resize" />
                            <RenderHandle id="right" x={100 - parseVal(model.r)} y={(parseVal(model.t) + (100 - parseVal(model.b))) / 2} color={getPointColor(1)} cursor="cursor-ew-resize" />
                            <RenderHandle id="bottom" x={(parseVal(model.l) + (100 - parseVal(model.r))) / 2} y={100 - parseVal(model.b)} color={getPointColor(2)} cursor="cursor-ns-resize" />
                            <RenderHandle id="left" x={parseVal(model.l)} y={(parseVal(model.t) + (100 - parseVal(model.b))) / 2} color={getPointColor(3)} cursor="cursor-ew-resize" />
                        </>
                    )}
                 </>
             );
        }
    };

    const formatCssValue = (v) => typeof v === 'number' ? `${Math.round(v)}%` : (v.includes('%') || v.includes('px') || v.includes('calc') || v.includes('rem') ? v : `${v}%`);

    const getClipPathStr = () => {
        if (!model) return 'none';
        switch (type) {
            case 'circle': return `circle(${formatCssValue(model.r)} at ${formatCssValue(model.cx)} ${formatCssValue(model.cy)})`;
            case 'ellipse': return `ellipse(${formatCssValue(model.rx)} ${formatCssValue(model.ry)} at ${formatCssValue(model.cx)} ${formatCssValue(model.cy)})`;
            case 'inset': return `inset(${formatCssValue(model.t)} ${formatCssValue(model.r)} ${formatCssValue(model.b)} ${formatCssValue(model.l)})`;
            case 'polygon':
            default: 
                if (!Array.isArray(model) || model.length === 0) return 'none';
                return `polygon(${model.map(p => `${formatCssValue(p.x)} ${formatCssValue(p.y)}`).join(', ')})`;
        }
    };

    const parseVal = (v) => resolveToPercent(v);

    return (
        <div className={cn(
            "relative flex flex-col bg-gray-100 dark:bg-[#151515] rounded-xl overflow-hidden select-none touch-none shadow-sm border border-gray-200 dark:border-gray-800",
            className
        )}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1e1e] z-10 shadow-sm">
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => handlePreset('mobile')}
                        className={cn("p-1.5 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500", canvasSize.width === 360 && "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20")}
                        title="Mobile (360x640)"
                    >
                        <Smartphone size={18} />
                    </button>
                    <button 
                        onClick={() => handlePreset('tablet')}
                        className={cn("p-1.5 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500", canvasSize.width === 768 && "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20")}
                        title="Tablet (768x1024)"
                    >
                        <Tablet size={18} />
                    </button>
                    <button 
                        onClick={() => handlePreset('laptop')}
                        className={cn("p-1.5 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500", canvasSize.width === 1280 && "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20")}
                        title="Laptop (1280x800)"
                    >
                        <Laptop size={18} />
                    </button>
                    <button 
                        onClick={() => handlePreset('desktop')}
                        className={cn("p-1.5 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500", canvasSize.width === 1600 && "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20")}
                        title="Desktop (1600x900)"
                    >
                        <Monitor size={18} />
                    </button>
                    <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-800 mx-1" />
                    <button 
                        onClick={() => setShowPoints(!showPoints)}
                        className={cn("p-1.5 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500", !showPoints && "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20")}
                        title={showPoints ? "Hide Points" : "Show Points"}
                    >
                        {showPoints ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button 
                        onClick={() => {
                            setCanvasSize({ width: 400, height: 400 });
                            setShowPoints(true);
                            if (onReset) onReset();
                        }}
                        className="p-1.5 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                        title="Reset Size & Shape"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 shadow-sm">
                        <input 
                            type="number" 
                            value={canvasSize.width} 
                            onChange={(e) => setCanvasSize(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                            className="bg-transparent w-12 text-xs font-mono outline-none text-center text-gray-700 dark:text-gray-200"
                        />
                        <span className="text-xs text-gray-400">×</span>
                        <input 
                            type="number" 
                            value={canvasSize.height} 
                            onChange={(e) => setCanvasSize(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                            className="bg-transparent w-12 text-xs font-mono outline-none text-center text-gray-700 dark:text-gray-200"
                        />
                    </div>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden min-h-0 bg-gray-100 dark:bg-[#151515]">
                <div 
                    className="relative bg-white dark:bg-[#1e1e1e] shadow-2xl rounded-sm overflow-visible"
                    style={{
                        width: '100%',
                        height: '100%',
                        maxWidth: canvasSize.width,
                        maxHeight: canvasSize.height,
                        aspectRatio: `${canvasSize.width} / ${canvasSize.height}`
                    }}
                >
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none" 
                         style={{
                             backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', 
                             backgroundSize: '20px 20px'
                         }} 
                    />

                    {/* CSS ClipPath Layer (The actual truth) */}
                    <div className="absolute inset-0 pointer-events-none p-[0.5px]">
                        <div 
                            className="w-full h-full bg-indigo-500/5 shadow-sm"
                            style={{ clipPath: getClipPathStr() }}
                        />
                    </div>

                    <svg 
                        ref={svgRef}
                        viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
                        preserveAspectRatio="none"
                        className={cn(
                            "w-full h-full overflow-visible relative z-10", 
                            isCustom && "cursor-crosshair"
                        )}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        onPointerDown={handleCanvasClick}
                    >
                        <defs>
                            <clipPath id="canvas-clip">
                                <rect x="0" y="0" width={canvasSize.width} height={canvasSize.height} />
                            </clipPath>
                        </defs>
                        {renderContent()}
                    </svg>
                </div>
            </div>
        </div>
    );
}
