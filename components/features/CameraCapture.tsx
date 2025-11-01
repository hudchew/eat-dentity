'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { uploadImage } from '@/lib/actions/upload';

interface CameraCaptureProps {
  onUploaded?: (blobUrl: string) => void;
}

export function CameraCapture({ onUploaded }: CameraCaptureProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<File | null>(null);

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };
    checkMobile();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setError(null);

    // Store file for upload
    selectedFileRef.current = file;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-upload after preview
    await handleUpload(file);
  };

  const handleUpload = async (file?: File) => {
    const fileToUpload = file || selectedFileRef.current;
    if (!fileToUpload) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', fileToUpload);

      const blobUrl = await uploadImage(formData);
      setUploadedUrl(blobUrl);
      onUploaded?.(blobUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCapture = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    // Ensure input element exists
    if (!fileInputRef.current) {
      console.error('File input ref is not available');
      setError('Camera not available. Please try again.');
      return;
    }

    // Check if input is disabled
    if (fileInputRef.current.disabled) {
      console.error('File input is disabled');
      return;
    }

    // Trigger click programmatically
    try {
      console.log('handleCapture', fileInputRef.current);
      fileInputRef.current.click();
    } catch (err) {
      console.error('Failed to trigger file input:', err);
      setError('Failed to open camera. Please check permissions.');
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setUploadedUrl(null);
    selectedFileRef.current = null;
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = uploadedUrl || previewUrl;

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {displayUrl ? (
        <div className="space-y-4">
          {/* Photo Preview */}
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 shadow-lg">
            <img
              src={displayUrl}
              alt="Captured meal"
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Uploading...</p>
                </div>
              </div>
            )}
            {uploadedUrl && !isUploading && (
              <div className="absolute top-3 right-3 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                ✓ Uploaded
              </div>
            )}
          </div>
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              type="button"
              onClick={handleRemove} 
              variant="outline" 
              className="flex-1" 
              disabled={isUploading}
            >
              Remove
            </Button>
            <Button 
              type="button"
              onClick={handleCapture} 
              variant="outline" 
              className="flex-1" 
              disabled={isUploading}
            >
              Retake
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center bg-white">
          <div className="text-6xl mb-4">📸</div>
          <p className="text-gray-600 mb-6 text-sm font-medium">No photo yet</p>
          <Button 
            type="button"
            onClick={handleCapture} 
            size="lg" 
            disabled={isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Capture Photo
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        {...(isMobile ? { capture: 'environment' as const } : {})}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
        aria-label="Upload image"
        tabIndex={-1}
      />
    </div>
  );
}

