'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function CameraCapture() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="border-2">
      <CardContent className="p-6 space-y-4">
        <h3 className="text-xl font-semibold">ถ่ายรูปอาหาร</h3>

        {imageUrl ? (
          <div className="space-y-4">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                src={imageUrl}
                alt="Captured meal"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRemove} variant="outline" className="flex-1">
                🗑️ ลบรูป
              </Button>
              <Button onClick={handleCapture} variant="outline" className="flex-1">
                📸 ถ่ายใหม่
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-gray-600 mb-4">ยังไม่มีรูปภาพ</p>
            <Button onClick={handleCapture} size="lg">
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
        />
      </CardContent>
    </Card>
  );
}

