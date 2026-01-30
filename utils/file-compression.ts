import { S3_FILE_CONFIGS, detectFileCategory, type FileCategory } from './file-type-detector';

/**
 * Compress image files using canvas
 */
export const compressImage = async (
  file: File,
  maxSizeMB: number = 1,
  maxWidthOrHeight: number = 1920
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = (height * maxWidthOrHeight) / width;
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = (width * maxWidthOrHeight) / height;
            height = maxWidthOrHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Start with quality 0.9 and reduce if needed
        let quality = 0.9;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // If size is acceptable or quality is too low, resolve
              if (blob.size <= maxSizeBytes || quality <= 0.1) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                // Reduce quality and try again
                quality -= 0.1;
                tryCompress();
              }
            },
            file.type,
            quality
          );
        };

        tryCompress();
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

/**
 * Compress any file type with dynamic size limits based on category
 */
export const compressFile = async (
  file: File
): Promise<{
  file: File;
  wasCompressed: boolean;
  originalSize: number;
  finalSize: number;
  category: FileCategory;
}> => {
  const category = detectFileCategory(file.type);
  const maxSizeBytes = S3_FILE_CONFIGS[category].maxSize;
  const COMPRESSIBLE_IMAGE_THRESHOLD = 2 * 1024 * 1024; // 2MB

  const originalSize = file.size;

  // Check if file exceeds maximum size for its category
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / 1024 / 1024).toFixed(0);
    throw new Error(`${category} files must be less than ${maxSizeMB}MB`);
  }

  // For images that are larger than threshold, compress them
  if (category === 'IMAGE' && file.size > COMPRESSIBLE_IMAGE_THRESHOLD) {
    try {
      const compressedFile = await compressImage(file, 1, 1920);
      return {
        file: compressedFile,
        wasCompressed: true,
        originalSize,
        finalSize: compressedFile.size,
        category,
      };
    } catch (error) {
      console.warn('Image compression failed, using original file:', error);
      // If compression fails, return original if within limits
      return {
        file,
        wasCompressed: false,
        originalSize,
        finalSize: file.size,
        category,
      };
    }
  }

  // For other file types (VIDEO, DOCUMENT, AUDIO) - no compression, just validate size
  return {
    file,
    wasCompressed: false,
    originalSize,
    finalSize: file.size,
    category,
  };
};

/**
 * Get file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file type category display name
 */
export const getFileCategory = (mimeType: string): string => {
  const category = detectFileCategory(mimeType);
  switch (category) {
    case 'IMAGE':
      return 'Image';
    case 'VIDEO':
      return 'Video';
    case 'DOCUMENT':
      return 'Document';
    case 'AUDIO':
      return 'Audio';
    default:
      return 'File';
  }
};
