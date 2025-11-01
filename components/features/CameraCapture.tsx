'use client';

import { useState, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<File | null>(null);

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

  const handleCapture = () => {
    fileInputRef.current?.click();
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
    <Card className="border-2">
      <CardContent className="p-6 space-y-4">
        <h3 className="text-xl font-semibold">ถ่ายรูปอาหาร</h3>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">❌ {error}</p>
          </div>
        )}

        {displayUrl ? (
          <div className="space-y-4">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                src={displayUrl}
                alt="Captured meal"
                className="w-full h-full object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">กำลังอัปโหลด...</p>
                  </div>
                </div>
              )}
              {uploadedUrl && !isUploading && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ✓ อัปโหลดสำเร็จ
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRemove} variant="outline" className="flex-1" disabled={isUploading}>
                🗑️ ลบรูป
              </Button>
              <Button onClick={handleCapture} variant="outline" className="flex-1" disabled={isUploading}>
                📸 ถ่ายใหม่
              </Button>
              {previewUrl && !uploadedUrl && !isUploading && (
                <Button onClick={() => handleUpload()} className="flex-1" disabled={isUploading}>
                  ☁️ อัปโหลด
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-gray-600 mb-4">ยังไม่มีรูปภาพ</p>
            <Button onClick={handleCapture} size="lg" disabled={isUploading}>
              📷 ถ่ายรูป / เลือกไฟล์
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </CardContent>
    </Card>
  );
}

