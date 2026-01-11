import { useState, useEffect } from 'react';
import './App.css';
import BlobGenerator from './tools/custom-shapes/BlobGenerator';
import WaveGenerator from './tools/custom-shapes/WaveGenerator';
import PatternGenerator from './tools/custom-shapes/PatternGenerator';
import viteLogo from './assets/vite.svg';
import reactLogo from './assets/react.svg';
import MasterKeyGenerator from './tools/master-key-generator/MasterKeyGenerator';

function OriginalDemo() {
	const [count, setCount] = useState(0);
	return (
		<>
			<div>
				<a href="https://vite.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<button onClick={() => setCount((c) => c + 1)}>count is {count}</button>
				<p>
					Edit <code>src/App.jsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p>
		</>
	);
}

function App() {
	// Determine which page to show based on URL
	const path = window.location.pathname;
	const [page, setPage] = useState(() => {
		if (path === '/' || path.startsWith('/shape-generator')) {
			const seg = path.split('/')[2];
			// Default to 'blob' if at /shape-generator root or invalid sub-path, or show 'home' if we want a landing page.
			// User asked for "link to custom-shapes and in this link we should have a generated page".
			// Let's make /shape-generator default to 'blob' for now, or keep 'home' if we want a menu.
			// Based on request "generated page... similar to softr", it implies direct access or clear access.
			// Let's keep 'home' as the menu but rename/refine it, or just direct link to blob.
			return seg && ['blob', 'wave', 'pattern'].includes(seg) ? seg : 'home';
		}
		if (path === '/master-key-generator') return 'master-key';
		if (path.startsWith('/clippy-generator')) return 'clippy';
		return 'home';
	});

	// Update page when URL changes (back/forward)
	useEffect(() => {
		const onPop = () => {
			const newPath = window.location.pathname;
			if (newPath.startsWith('/shape-generator')) {
				const seg = newPath.split('/')[2];
				setPage(
					seg && ['blob', 'wave', 'pattern'].includes(seg) ? seg : 'home',
				);
			} else if (newPath === '/master-key-generator') {
				setPage('master-key');
			} else if (newPath.startsWith('/clippy-generator')) {
				setPage('clippy');
			} else {
				setPage('home');
			}
		};
		window.addEventListener('popstate', onPop);
		return () => window.removeEventListener('popstate', onPop);
	}, []);

	const navigate = (target) => {
		if (target === 'clippy') {
			window.history.pushState({}, '', '/clippy-generator');
			setPage('clippy');
		} else if (target === 'shape-home') {
			window.history.pushState({}, '', '/shape-generator');
			setPage('home');
		} else {
			window.history.pushState({}, '', `/shape-generator/${target}`);
			setPage(target);
		}
	};

	if (page === 'clippy') {
		return (
			<div className="App">
				<OriginalDemo />
				<nav style={{ marginTop: '1rem' }}>
					<button onClick={() => navigate('home')}>
						Back to Custom Shapes
					</button>
				</nav>
			</div>
		);
	}

	const renderGenerator = () => {
		switch (page) {
			case 'blob':
				return <BlobGenerator />;
			case 'wave':
				return <WaveGenerator />;
			case 'pattern':
				return <PatternGenerator />;
			case 'master-key':
				return <MasterKeyGenerator />;
			default:
				return (
					<div
						className="home"
						style={{ padding: '2rem', textAlign: 'center' }}
					>
						<h1>Custom Shape Generators</h1>
						<p style={{ marginBottom: '2rem' }}>
							Create beautiful SVG shapes for your designs.
						</p>
						<div
							style={{
								display: 'flex',
								gap: '1rem',
								justifyContent: 'center',
								flexWrap: 'wrap',
							}}
						>
							<button
								onClick={() => navigate('blob')}
								style={{
									padding: '1.5rem 2rem',
									fontSize: '1.2rem',
									cursor: 'pointer',
									background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
									border: 'none',
									color: 'white',
									borderRadius: '12px',
								}}
							>
								Blob Generator
							</button>
							<button
								onClick={() => {
									window.history.pushState({}, '', '/master-key-generator');
									setPage('master-key');
								}}
								style={{
									padding: '1.5rem 2rem',
									fontSize: '1.2rem',
									cursor: 'pointer',
									background: 'linear-gradient(135deg, #43cea2, #185a9d)',
									border: 'none',
									color: 'white',
									borderRadius: '12px',
								}}
							>
								Master Key Generator
							</button>
							{/* 
              <button onClick={() => navigate('wave')}>Wave Generator</button>
              <button onClick={() => navigate('pattern')}>Pattern Generator</button> 
              */}
						</div>
					</div>
				);
		}
	};

	return (
		<div className="App">
			{renderGenerator()}
			<nav
				style={{
					marginTop: '2rem',
					padding: '1rem',
					borderTop: '1px solid #eee',
				}}
			>
				{page !== 'home' && (
					<button onClick={() => navigate('shape-home')}>
						← All Generators
					</button>
				)}
			</nav>
		</div>
	);
}

export default App;
