import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: '📸',
    title: 'ถ่ายรูปง่ายๆ',
    description: 'ถ่ายรูปอาหารทุกมื้อด้วยกล้องมือถือ พร้อม Quick Tags เพื่อระบุประเภทอาหาร',
  },
  {
    icon: '📊',
    title: 'ติดตาม Real-time',
    description: 'ดูสถิติอาหารของคุณแบบเรียลไทม์ พร้อมแถบพลังงานที่อัพเดททุกวัน',
  },
  {
    icon: '🎭',
    title: 'ค้นพบตัวตน',
    description: 'หลัง 7 วัน รับการ์ดฉายาอาหาร (Food Persona) ที่เป็นเอกลักษณ์ของคุณ!',
  },
  {
    icon: '🤖',
    title: 'AI Insight',
    description: 'ได้รับบทวิเคราะห์ส่วนตัวจาก Gemini AI ที่ตลก คมคาย และสร้างสรรค์',
  },
];

export function FeatureHighlight() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-semibold text-center mb-12">
          ทำไมต้อง Eat-dentity?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-orange-400 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

