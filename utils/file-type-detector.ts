export const S3_FILE_CONFIGS = {
  IMAGE: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'] as const,
    maxSize: 5 * 1024 * 1024, // 5MB
    extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const,
  },
  VIDEO: {
    allowedTypes: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'] as const,
    maxSize: 100 * 1024 * 1024, // 100MB
    extensions: ['mp4', 'mpeg', 'mov', 'avi', 'webm'] as const,
  },
  DOCUMENT: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ] as const,
    maxSize: 10 * 1024 * 1024, // 10MB
    extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'] as const,
  },
  AUDIO: {
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'] as const,
    maxSize: 20 * 1024 * 1024, // 20MB
    extensions: ['mp3', 'wav', 'ogg', 'webm'] as const,
  },
} as const;

export type FileCategory = keyof typeof S3_FILE_CONFIGS;

// Helper type to get all allowed MIME types
type AllowedMimeType =
  | (typeof S3_FILE_CONFIGS.IMAGE.allowedTypes)[number]
  | (typeof S3_FILE_CONFIGS.VIDEO.allowedTypes)[number]
  | (typeof S3_FILE_CONFIGS.DOCUMENT.allowedTypes)[number]
  | (typeof S3_FILE_CONFIGS.AUDIO.allowedTypes)[number];

/**
 * Detect file category based on MIME type
 * Returns the S3 file category for getPreSignedUrl API
 */
export const detectFileCategory = (mimeType: string): FileCategory => {
  // Check IMAGE types
  if ((S3_FILE_CONFIGS.IMAGE.allowedTypes as readonly string[]).includes(mimeType)) {
    return 'IMAGE';
  }

  // Check VIDEO types
  if ((S3_FILE_CONFIGS.VIDEO.allowedTypes as readonly string[]).includes(mimeType)) {
    return 'VIDEO';
  }

  // Check DOCUMENT types
  if ((S3_FILE_CONFIGS.DOCUMENT.allowedTypes as readonly string[]).includes(mimeType)) {
    return 'DOCUMENT';
  }

  // Check AUDIO types
  if ((S3_FILE_CONFIGS.AUDIO.allowedTypes as readonly string[]).includes(mimeType)) {
    return 'AUDIO';
  }

  // Default fallback to DOCUMENT for unknown types
  return 'DOCUMENT';
};

/**
 * Get maximum allowed file size for a given MIME type
 */
export const getMaxFileSize = (mimeType: string): number => {
  const category = detectFileCategory(mimeType);
  return S3_FILE_CONFIGS[category].maxSize;
};

/**
 * Validate if file type is allowed
 */
export const isFileTypeAllowed = (mimeType: string): boolean => {
  return Object.values(S3_FILE_CONFIGS).some((config) => (config.allowedTypes as readonly string[]).includes(mimeType));
};

/**
 * Get file category name for display
 */
export const getFileCategoryDisplay = (mimeType: string): string => {
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

/**
 * Get allowed extensions for file input accept attribute
 */
export const getAllowedExtensions = (): string => {
  const allExtensions = Object.values(S3_FILE_CONFIGS)
    .flatMap((config) => [...config.extensions])
    .map((ext) => `.${ext}`)
    .join(',');

  return allExtensions;
};

/**
 * Get allowed MIME types for all categories
 */
export const getAllowedMimeTypes = (): string[] => {
  return Object.values(S3_FILE_CONFIGS).flatMap((config) => [...config.allowedTypes]);
};

/**
 * Type guard to check if a string is a valid MIME type
 */
export const isValidMimeType = (mimeType: string): mimeType is AllowedMimeType => {
  return isFileTypeAllowed(mimeType);
};
