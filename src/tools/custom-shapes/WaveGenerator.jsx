// src/tools/custom-shapes/WaveGenerator.jsx

import React, { useState, useEffect } from 'react';
import { generateWave } from './core/generateWave';
import ShapeCanvas from './components/ShapeCanvas';

export default function WaveGenerator() {
  const [amplitude, setAmplitude] = useState(30);
  const [frequency, setFrequency] = useState(2);
  const [path, setPath] = useState('');

  useEffect(() => {
    const d = generateWave({ amplitude, frequency, length: 200, offset: 0 });
    setPath(d);
  }, [amplitude, frequency]);

  const roll = () => {
    const randomAmp = Math.floor(Math.random() * 50) + 10; // 10-60
    const randomFreq = Math.floor(Math.random() * 4) + 1; // 1-4
    setAmplitude(randomAmp);
    setFrequency(randomFreq);
  };

  return (
    <div className="generator-page" style={{ padding: '1rem' }}>
      <h2>Wave Generator</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Amplitude ({amplitude}):
          <input
            type="range"
            min="10"
            max="80"
            value={amplitude}
            onChange={e => setAmplitude(parseInt(e.target.value, 10))}
          />
        </label>
        <label style={{ marginLeft: '1rem' }}>
          Frequency ({frequency}):
          <input
            type="range"
            min="1"
            max="5"
            value={frequency}
            onChange={e => setFrequency(parseInt(e.target.value, 10))}
          />
        </label>
        <button onClick={roll} style={{ marginLeft: '1rem' }}>Roll 🎲</button>
      </div>
      <ShapeCanvas path={path} width={200} height={200} fill="none" stroke="#333" strokeWidth={2} />
    </div>
  );
}
