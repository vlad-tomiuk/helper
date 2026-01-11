import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Scissors, Shapes, MousePointer2, Ratio, Key } from 'lucide-react';

const tools = [
	{
		id: 'svg-to-clippath',
		icon: Scissors,
		nameKey: 'tools.svgToClippath.name',
		descKey: 'tools.svgToClippath.desc',
		path: '/svg-to-clippath',
		color: 'indigo',
		available: true,
	},
	{
		id: 'svg-shape-generator',
		icon: Shapes,
		nameKey: 'tools.clipPathGenerator.name',
		descKey: 'tools.clipPathGenerator.desc',
		path: '/clip-path-generator',
		color: 'purple',
		available: true,
	},
	{
		id: 'custom-shapes',
		icon: MousePointer2,
		nameKey: 'tools.shapeGenerator.name',
		descKey: 'tools.shapeGenerator.desc',
		path: '/shape-generator',
		color: 'pink',
		available: true,
	},
	{
		id: 'aspect-ratio-calc',
		icon: Ratio,
		nameKey: 'tools.aspectRatioCalc.name',
		descKey: 'tools.aspectRatioCalc.desc',
		path: '/aspect-ratio-calculator',
		color: 'blue',
		available: true,
	},
	{
		id: 'master-key-generator',
		icon: Key,
		nameKey: 'tools.masterKeyGenerator.name',
		descKey: 'tools.masterKeyGenerator.desc',
		path: '/master-key-generator',
		color: 'green',
		available: true,
	},
];

const colorClasses = {
	indigo:
		'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
	purple:
		'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
	pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
	blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
	yellow:
		'from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600',
	green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
};

export default function HomePage() {
	const { t } = useTranslation();

	return (
		<main className="max-w-7xl mx-auto px-6 py-12">
			{/* Hero Section */}
			<div className="text-center mb-16">
				<h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
					{t('home.title')}
				</h1>
				<p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
					{t('home.subtitle')}
				</p>
			</div>

			{/* Tools Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
				{tools.map((tool) => {
					const Icon = tool.icon;
					const isAvailable = tool.available;

					const CardContent = (
						<div
							className={`relative group h-full bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 ${
								isAvailable
									? 'hover:shadow-2xl hover:scale-105 cursor-pointer'
									: 'opacity-60 cursor-not-allowed'
							}`}
						>
							{/* Gradient Background */}
							<div
								className={`absolute inset-0 bg-gradient-to-br ${colorClasses[tool.color]} opacity-5 group-hover:opacity-10 transition-opacity`}
							/>

							<div className="relative p-8">
								{/* Icon */}
								<div
									className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colorClasses[tool.color]} flex items-center justify-center mb-6 shadow-lg`}
								>
									<Icon className="w-8 h-8 text-white" />
								</div>

								{/* Content */}
								<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
									{t(tool.nameKey)}
								</h3>
								<p className="text-gray-600 dark:text-gray-400 leading-relaxed">
									{t(tool.descKey)}
								</p>

								{/* Coming Soon Badge */}
								{!isAvailable && (
									<div className="mt-4">
										<span className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full">
											{t('home.comingSoon')}
										</span>
									</div>
								)}

								{/* Arrow Icon */}
								{isAvailable && (
									<div className="mt-6 flex items-center text-indigo-600 dark:text-indigo-400 font-medium group-hover:translate-x-2 transition-transform">
										{t('home.openTool')}
										<svg
											className="w-5 h-5 ml-2"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M17 8l4 4m0 0l-4 4m4-4H3"
											/>
										</svg>
									</div>
								)}
							</div>
						</div>
					);

					return isAvailable ? (
						<Link key={tool.id} to={tool.path}>
							{CardContent}
						</Link>
					) : (
						<div key={tool.id}>{CardContent}</div>
					);
				})}
			</div>
		</main>
	);
}
