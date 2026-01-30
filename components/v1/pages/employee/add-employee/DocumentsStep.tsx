import React, { useState } from 'react';
import { FileText, Plus, X, Upload, ChevronDown, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Document } from './add-employee';
import { IEditEmployeeMasterDataRES } from '@/interface/common.interface';
import { getPreSignedUrl } from '@/apis/common.api';
import { compressFile, formatFileSize, getFileCategory } from '@/utils/file-compression';
import { detectFileCategory, getAllowedExtensions } from '@/utils/file-type-detector';

interface DocumentsStepProps {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  masterData: IEditEmployeeMasterDataRES;
}

export default function DocumentsStep({ documents, setDocuments, masterData }: DocumentsStepProps) {
  const [isTypePopoverOpen, setIsTypePopoverOpen] = useState<Record<number, boolean>>({});
  const [documentTypeSearchValues, setDocumentTypeSearchValues] = useState<Record<number, string>>({});
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const addNewDocument = () => {
    setDocuments((prev) => [...prev, { documentTypeId: '', documentNumber: '', fileUrl: '', fileName: '' }]);
  };

  const updateDocument = (index: number, key: keyof Document, value: string) => {
    setDocuments((prev) => prev.map((d, i) => (i === index ? { ...d, [key]: value } : d)));
  };

  const removeDocument = (index: number) => {
    if (documents.length === 1) {
      toast.error('At least one document is required');
      return;
    }
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const removeDocumentFile = (index: number) => {
    updateDocument(index, 'fileUrl', '');
    updateDocument(index, 'fileName', '');
  };

  // Get available document types (exclude already selected ones)
  const getAvailableDocumentTypes = (currentIndex: number) => {
    const selectedTypeIds = documents
      .map((doc, idx) => (idx !== currentIndex ? doc.documentTypeId : null))
      .filter((id): id is string => !!id);

    const searchValue = documentTypeSearchValues[currentIndex] || '';

    let availableTypes = masterData.documentTypes.filter((docType) => !selectedTypeIds.includes(docType.value));

    // Apply search filter
    if (searchValue.trim()) {
      availableTypes = availableTypes.filter((docType) =>
        docType.label.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    return availableTypes;
  };

  // Get document type label from value
  const getDocumentTypeLabel = (documentTypeId: string) => {
    const docType = masterData.documentTypes.find((dt) => dt.value === documentTypeId);
    return docType?.label || 'Select Type';
  };

  // Check if document type requires a document number
  const requiresDocumentNumber = (documentTypeId: string) => {
    const docType = masterData.documentTypes.find((dt) => dt.value === documentTypeId);
    return docType?.requiresNumber ?? true;
  };

  /**
   * Handle file upload with dynamic category detection
   */
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);

    try {
      // Get file category for better user feedback
      const fileCategory = getFileCategory(file.type);
      const originalSizeStr = formatFileSize(file.size);

      toast.loading(`Processing ${fileCategory}...`, { id: 'process' });

      // Compress/validate file (also validates size limits per category)
      const { file: fileToUpload, wasCompressed, originalSize, finalSize, category } = await compressFile(file);

      // Show compression result if applicable
      if (wasCompressed) {
        const finalSizeStr = formatFileSize(finalSize);
        toast.success(`Compressed from ${originalSizeStr} to ${finalSizeStr}`, { id: 'process' });
      } else {
        toast.dismiss('process');
      }

      // Get pre-signed URL with dynamic category
      toast.loading('Getting upload URL...', { id: 'upload' });

      // Dynamically determine entity type based on file category
      const entityType = category === 'IMAGE' ? 'USER_PROFILE' : 'DOCUMENT';

      const presignedRes = await getPreSignedUrl(
        fileToUpload.name,
        fileToUpload.type,
        fileToUpload.size,
        category, // Dynamic: IMAGE, VIDEO, DOCUMENT, or AUDIO
        entityType // Dynamic: USER_PROFILE for images, DOCUMENT for others
      );

      if (!presignedRes || presignedRes.error || !presignedRes.payload?.presignedUrl) {
        throw new Error('Failed to get upload URL');
      }

      const { presignedUrl, fileUrl } = presignedRes.payload;

      // Upload file to S3
      toast.loading('Uploading document...', { id: 'upload' });
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': fileToUpload.type,
        },
        body: fileToUpload,
      });

      if (!uploadResponse.ok) {
        const errorMessage = `Upload failed with status: ${uploadResponse.status}`;
        throw new Error(errorMessage);
      }

      // Update document with file URL
      const finalUrl = fileUrl || presignedUrl.split('?')[0];
      updateDocument(index, 'fileUrl', finalUrl);
      updateDocument(index, 'fileName', fileToUpload.name);

      toast.success(`${fileToUpload.name} uploaded successfully`, { id: 'upload' });
    } catch (error) {
      console.error('Document upload failed', error);
      const errorMessage = error instanceof Error ? error.message : 'Document upload failed';
      toast.error(errorMessage, { id: 'upload' });
    } finally {
      e.target.value = '';
      setUploadingIndex(null);
    }
  };

  return (
    <div className="bg-sidebar border shadow-sm">
      <div className="flex items-center justify-between px-4 pt-8">
        <h3 className="flex items-center text-base font-semibold sm:text-lg">
          <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Documents
        </h3>
        <button
          type="button"
          onClick={addNewDocument}
          className="bg-primary text-background flex items-center rounded px-3 py-1 text-sm"
        >
          <Plus className="mr-1 h-4 w-4" /> Add Document
        </button>
      </div>
      <hr className="mt-7" />

      {documents.map((doc, docIndex) => {
        const availableTypes = getAvailableDocumentTypes(docIndex);
        const showDocumentNumber = doc.documentTypeId ? requiresDocumentNumber(doc.documentTypeId) : true;

        return (
          <div key={docIndex} className="border-b p-4 last:border-b-0">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-medium">Document {docIndex + 1}</h4>
              {documents.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDocument(docIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium">
                  Type<span className="text-xs text-red-500"> *</span>
                </label>
                <Popover
                  open={isTypePopoverOpen[docIndex]}
                  onOpenChange={(open) => {
                    setIsTypePopoverOpen((prev) => ({ ...prev, [docIndex]: open }));
                    if (open) {
                      setDocumentTypeSearchValues((prev) => ({ ...prev, [docIndex]: '' }));
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2"
                    >
                      {doc.documentTypeId ? getDocumentTypeLabel(doc.documentTypeId) : 'Select Type'}
                      <ChevronDown className="ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search document type..."
                        value={documentTypeSearchValues[docIndex] || ''}
                        onValueChange={(value) =>
                          setDocumentTypeSearchValues((prev) => ({ ...prev, [docIndex]: value }))
                        }
                      />
                      <CommandList>
                        <CommandEmpty>
                          {availableTypes.length === 0
                            ? 'All document types are already selected'
                            : 'No document type found'}
                        </CommandEmpty>
                        <CommandGroup>
                          {availableTypes.map((dt, dtIndex) => (
                            <CommandItem
                              key={`${docIndex}-${dtIndex}`}
                              value={dt.value}
                              className="cursor-pointer"
                              onSelect={(val) => {
                                updateDocument(docIndex, 'documentTypeId', val);
                                setIsTypePopoverOpen((prev) => ({ ...prev, [docIndex]: false }));
                                setDocumentTypeSearchValues((prev) => ({ ...prev, [docIndex]: '' }));
                              }}
                            >
                              <div className="flex flex-col">
                                <span>{dt.label}</span>
                                {!dt.requiresNumber && (
                                  <span className="text-muted-foreground text-xs">(No number required)</span>
                                )}
                              </div>
                              <Check
                                className={`ml-auto ${doc.documentTypeId === dt.value ? 'opacity-100' : 'opacity-0'}`}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Document Number - Only show if required */}
              {showDocumentNumber && (
                <div>
                  <label className="block text-sm font-medium">
                    Number<span className="text-xs text-red-500"> *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter document number"
                    value={doc.documentNumber}
                    onChange={(e) => updateDocument(docIndex, 'documentNumber', e.target.value)}
                    disabled={!doc.documentTypeId}
                    className="mt-1 w-full rounded border p-2 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>
              )}

              {/* File Upload */}
              <div className={showDocumentNumber ? '' : 'md:col-span-2'}>
                <label className="block text-sm font-medium">
                  File<span className="text-xs text-red-500"> *</span>
                </label>
                <div className="mt-1">
                  {uploadingIndex === docIndex ? (
                    <div className="flex items-center justify-center rounded border bg-gray-50 p-2">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  ) : doc.fileUrl ? (
                    <div className="flex items-center gap-2 rounded border p-2">
                      <span className="flex-1 truncate text-sm">{doc.fileName}</span>
                      <button
                        type="button"
                        onClick={() => removeDocumentFile(docIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center justify-center rounded border border-dashed p-2 hover:bg-gray-50">
                      <Upload className="mr-2 h-4 w-4" />
                      <span className="text-sm">Upload File (All Formats)</span>
                      <input
                        type="file"
                        accept={getAllowedExtensions()}
                        onChange={(e) => handleDocumentUpload(e, docIndex)}
                        disabled={!doc.documentTypeId}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Images (5MB), Videos (100MB), Documents (10MB), Audio (20MB). Auto-compressed.
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
