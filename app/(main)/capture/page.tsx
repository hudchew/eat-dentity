import { CameraCapture } from '@/components/features/CameraCapture';
import { QuickTagsSelector } from '@/components/features/QuickTagsSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CapturePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">บันทึกมื้ออาหาร</h1>
          <p className="text-gray-600">ถ่ายรูปและเลือกแท็กอาหารของคุณ</p>
        </div>

        <CameraCapture />

        <Card>
          <CardContent className="p-6">
            <QuickTagsSelector />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button size="lg" className="flex-1 text-lg">
            ✅ บันทึกมื้ออาหาร
          </Button>
          <Button size="lg" variant="outline" className="flex-1">
            ยกเลิก
          </Button>
        </div>
      </div>
    </div>
  );
}

