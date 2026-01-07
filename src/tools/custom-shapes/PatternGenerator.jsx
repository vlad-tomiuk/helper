// src/tools/custom-shapes/PatternGenerator.jsx

import React, { useState, useEffect } from 'react';
import { generatePattern } from './core/generatePattern';
import ShapeCanvas from './components/ShapeCanvas';
import Controls from './components/Controls';

export default function PatternGenerator() {
  const [type, setType] = useState('triangles');
  const [size, setSize] = useState(20);
  const [repeat, setRepeat] = useState(8);
  const [path, setPath] = useState('');

  useEffect(() => {
    const d = generatePattern({ type, size, repeat });
    setPath(d);
  }, [type, size, repeat]);

  const roll = () => {
    const types = ['triangles', 'circles'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomSize = Math.floor(Math.random() * 30) + 10; // 10-40
    const randomRepeat = Math.floor(Math.random() * 6) + 5; // 5-10
    setType(randomType);
    setSize(randomSize);
    setRepeat(randomRepeat);
  };

  return (
    <div className="generator-page" style={{ padding: '1rem' }}>
      <h2>Pattern Generator</h2>
      <Controls>
        <label>
          Type:
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="triangles">Triangles</option>
            <option value="circles">Circles</option>
          </select>
        </label>
        <label style={{ marginLeft: '1rem' }}>
          Size ({size}):
          <input
            type="range"
            min="10"
            max="40"
            value={size}
            onChange={e => setSize(parseInt(e.target.value, 10))}
          />
        </label>
        <label style={{ marginLeft: '1rem' }}>
          Repeat ({repeat}):
          <input
            type="range"
            min="5"
            max="12"
            value={repeat}
            onChange={e => setRepeat(parseInt(e.target.value, 10))}
          />
        </label>
        <button onClick={roll} style={{ marginLeft: '1rem' }}>Roll 🎲</button>
      </Controls>
      <ShapeCanvas path={path} width={200} height={200} fill="none" stroke="#333" strokeWidth={2} />
    </div>
  );
}
