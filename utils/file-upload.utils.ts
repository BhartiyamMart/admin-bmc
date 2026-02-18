import toast from 'react-hot-toast';
import { getPreSignedUrl } from '@/apis/common.api';
import { compressImage } from './file-compression';
// import { compressImage } from '@/lib/image-compression';

export interface FileUploadOptions {
  file: File;
  path: 'USER_PROFILE' | 'EMPLOYEE_DOCUMENT' | 'BANNER' | 'PRODUCT' | 'CATEGORY' | string;
  fileType?: 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'PDF';
  maxSizeInMB?: number;
  compressToMB?: number;
  maxDimension?: number;
  showToast?: boolean;
}

export interface FileUploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileId?: string;
  error?: string;
}

/**
 * Uploads a file to S3 using pre-signed URL
 */
export async function uploadFile(options: FileUploadOptions): Promise<FileUploadResult> {
  const {
    file,
    path,
    fileType = 'IMAGE',
    maxSizeInMB = 5,
    compressToMB = 1,
    maxDimension = 1920,
    showToast = true,
  } = options;

  // Validate file exists
  if (!file) {
    const error = 'No file provided';
    if (showToast) toast.error(error);
    return { success: false, error };
  }

  // Validate file type for images
  if (fileType === 'IMAGE' && !file.type.startsWith('image/')) {
    const error = 'Please upload a valid image file';
    if (showToast) toast.error(error);
    return { success: false, error };
  }

  // Check initial file size
  const maxSizeBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    const error = `File must be less than ${maxSizeInMB}MB`;
    if (showToast) toast.error(error);
    return { success: false, error };
  }

  let loadingToast: string | undefined;
  if (showToast) {
    loadingToast = toast.loading('Uploading file...');
  }

  try {
    let fileToUpload = file;

    // Compress image if needed
    if (fileType === 'IMAGE' && compressToMB > 0) {
      fileToUpload = await compressImage(file, compressToMB, maxDimension);
    }

    // Get pre-signed URL using your existing API
    const preSignedResponse = await getPreSignedUrl(
      fileToUpload.name,
      fileToUpload.type,
      fileToUpload.size,
      fileType,
      path
    );

    const uploadUrl = preSignedResponse?.payload?.presignedUrl;
    const fileUrl = preSignedResponse?.payload?.fileUrl;
    const fileId = preSignedResponse?.payload?.fileId; // ✅ Get UUID

    if (!uploadUrl || !fileUrl) {
      throw new Error('Failed to get upload URL from server');
    }

    // Upload file to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': fileToUpload.type,
      },
      body: fileToUpload,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }

    if (showToast && loadingToast) {
      toast.dismiss(loadingToast);
      toast.success('File uploaded successfully');
    }

    return {
      success: true,
      fileUrl,
      fileId,
      fileName: fileToUpload.name,
    };
  } catch (err) {
    console.error('File upload error:', err);

    if (showToast && loadingToast) {
      toast.dismiss(loadingToast);
      toast.error('Failed to upload file');
    }

    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed',
    };
  }
}
