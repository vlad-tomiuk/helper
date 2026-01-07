// src/tools/custom-shapes/components/ShapeCanvas.jsx

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Renders an SVG element with the provided path data.
 * Exposes methods to export SVG/PNG and copy code via ref.
 */
const ShapeCanvas = forwardRef(({ path, width = 200, height = 200, fill = 'none', stroke = '#000', strokeWidth = 2, gradient = null }, ref) => {
  const { t } = useTranslation();
  const svgRef = useRef(null);

  useImperativeHandle(ref, () => ({
    exportSvg: () => {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgRef.current);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'shape.svg';
      link.click();
      URL.revokeObjectURL(url);
    },
    exportPng: () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgRef.current);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = 'shape.png';
        link.click();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    },
    copyCode: () => {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgRef.current);
      navigator.clipboard.writeText(svgString);
      alert(t('shapeGenerator.copiedSuccess')); // Or better, return a promise/callback
    }
  }));

  return (
    <div className="shape-canvas" style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto', maxHeight: '100%' }}
      >
        <defs>
          {gradient && (
            <linearGradient id={gradient.id} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradient.start} />
              <stop offset="100%" stopColor={gradient.end} />
            </linearGradient>
          )}
        </defs>
        <path d={path} fill={gradient ? `url(#${gradient.id})` : fill} stroke={gradient && stroke !== 'none' ? `url(#${gradient.id})` : stroke} strokeWidth={strokeWidth} fillRule="nonzero" />
      </svg>
    </div>
  );
});

export default ShapeCanvas;
