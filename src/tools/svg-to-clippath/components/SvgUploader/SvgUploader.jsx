import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileCode } from 'lucide-react';
import { cn } from '../../../../shared/utils/cn';

export default function SvgUploader({ onUpload, className }) {
	const { t } = useTranslation();
	const inputRef = useRef(null);

	const handleFile = (file) => {
		if (file && file.type === 'image/svg+xml') {
			const reader = new FileReader();
			reader.onload = (e) => onUpload(e.target.result);
			reader.readAsText(file);
		} else {
			alert(t('svgToClippath.upload.error'));
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		handleFile(e.dataTransfer.files[0]);
	};

	const handleChange = (e) => {
		handleFile(e.target.files[0]);
	};

	return (
		<div
			className={cn(
				'relative group cursor-pointer border-2 border-dashed rounded-xl p-8 transition-all duration-300',
				'border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400',
				'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800',
				className,
			)}
			onDragOver={(e) => e.preventDefault()}
			onDrop={handleDrop}
			onClick={() => inputRef.current?.click()}
		>
			<input
				type="file"
				accept=".svg"
				onChange={handleChange}
				className="hidden"
				ref={inputRef}
			/>
			<div className="flex flex-col items-center text-center gap-3">
				<div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
					<Upload size={24} />
				</div>
				<div className="space-y-1">
					<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
						{t('svgToClippath.upload.label')}
					</p>
					<p className="text-xs text-gray-500 dark:text-gray-400">
						{t('svgToClippath.upload.drop')}
					</p>
				</div>
			</div>
		</div>
	);
}
