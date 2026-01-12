/**
 * Compress image file client-side to reduce upload bandwidth
 * Uses Canvas API for efficient compression
 */

export interface CompressionOptions {
	maxWidthOrHeight?: number;
	quality?: number; // 0.0 - 1.0
	mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

export async function compressImage(file: File, options: CompressionOptions = {}): Promise<File> {
	const { maxWidthOrHeight = 1920, quality = 0.85, mimeType = 'image/jpeg' } = options;

	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			const img = new Image();

			img.onload = () => {
				// Calculate new dimensions
				let { width, height } = img;

				if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
					if (width > height) {
						height = (height / width) * maxWidthOrHeight;
						width = maxWidthOrHeight;
					} else {
						width = (width / height) * maxWidthOrHeight;
						height = maxWidthOrHeight;
					}
				}

				// Create canvas and draw image
				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;

				const ctx = canvas.getContext('2d');
				if (!ctx) {
					reject(new Error('Failed to get canvas context'));
					return;
				}

				// Enable image smoothing for better quality
				ctx.imageSmoothingEnabled = true;
				ctx.imageSmoothingQuality = 'high';

				// Draw image
				ctx.drawImage(img, 0, 0, width, height);

				// Convert to blob
				canvas.toBlob(
					(blob) => {
						if (!blob) {
							reject(new Error('Failed to compress image'));
							return;
						}

						// Create new File from blob
						const compressedFile = new File(
							[blob],
							file.name.replace(/\.[^/.]+$/, '') + getExtension(mimeType),
							{
								type: mimeType,
								lastModified: Date.now()
							}
						);

						resolve(compressedFile);
					},
					mimeType,
					quality
				);
			};

			img.onerror = () => {
				reject(new Error('Failed to load image'));
			};

			img.src = e.target?.result as string;
		};

		reader.onerror = () => {
			reject(new Error('Failed to read file'));
		};

		reader.readAsDataURL(file);
	});
}

function getExtension(mimeType: string): string {
	const extensions: Record<string, string> = {
		'image/jpeg': '.jpg',
		'image/webp': '.webp',
		'image/png': '.png'
	};
	return extensions[mimeType] || '.jpg';
}

/**
 * Generate thumbnail from image file
 */
export async function generateThumbnail(file: File, maxSize: number = 200): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			const img = new Image();

			img.onload = () => {
				const canvas = document.createElement('canvas');
				let { width, height } = img;

				// Calculate thumbnail size maintaining aspect ratio
				if (width > height) {
					height = (height / width) * maxSize;
					width = maxSize;
				} else {
					width = (width / height) * maxSize;
					height = maxSize;
				}

				canvas.width = width;
				canvas.height = height;

				const ctx = canvas.getContext('2d');
				if (!ctx) {
					reject(new Error('Failed to get canvas context'));
					return;
				}

				ctx.drawImage(img, 0, 0, width, height);
				resolve(canvas.toDataURL('image/jpeg', 0.7));
			};

			img.onerror = () => reject(new Error('Failed to load image'));
			img.src = e.target?.result as string;
		};

		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsDataURL(file);
	});
}

/**
 * Validate image file
 */
export function validateImageFile(file: File, maxSizeMB: number = 10): string | null {
	// Check file type
	if (!file.type.startsWith('image/')) {
		return 'File harus berupa gambar';
	}

	// Check file size
	const sizeMB = file.size / (1024 * 1024);
	if (sizeMB > maxSizeMB) {
		return `Ukuran file terlalu besar (${sizeMB.toFixed(1)}MB). Maksimal ${maxSizeMB}MB`;
	}

	// Check if browser supports the image type
	const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
	if (!supportedTypes.includes(file.type)) {
		return 'Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP';
	}

	return null;
}
