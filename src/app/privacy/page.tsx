'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConsentForm } from '@/components/privacy/ConsentForm';
import { DataDeletionRequest } from '@/components/privacy/DataDeletionRequest';
import { usePrivacy } from '@/hooks/usePrivacy';
import { useAuth } from '@/context/AuthContext';

export default function PrivacyPage() {
  const { user } = useAuth();
  const { consentStatus, fetchConsentStatus, exportData, isExporting } = usePrivacy();
  const [activeTab, setActiveTab] = useState<'policy' | 'consent' | 'deletion' | 'export'>('policy');

  useEffect(() => {
    if (user) {
      fetchConsentStatus();
    }
  }, [user, fetchConsentStatus]);

  const handleExportData = async () => {
    const result = await exportData();
    if (result) {
      alert('ข้อมูลของคุณถูกส่งออกเรียบร้อยแล้ว กรุณาตรวจสอบอีเมลของคุณ');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            นโยบายความเป็นส่วนตัว (PDPA)
          </h1>
          <p className="mt-2 text-gray-600">
            SolarIQ - ระบบวิเคราะห์ศักยภาพการติดตั้งโซลาร์เซลล์
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('policy')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'policy'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              นโยบายความเป็นส่วนตัว
            </button>
            {user && (
              <>
                <button
                  onClick={() => setActiveTab('consent')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'consent'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  การให้ความยินยอม
                </button>
                <button
                  onClick={() => setActiveTab('deletion')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'deletion'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ขอลบข้อมูล
                </button>
                <button
                  onClick={() => setActiveTab('export')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'export'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ส่งออกข้อมูล
                </button>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Privacy Policy Tab */}
        {activeTab === 'policy' && (
          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                นโยบายความเป็นส่วนตัว
              </h2>
              <p className="text-gray-600 mb-6">
                ฉบับปรับปรุงล่าสุด: 20 มีนาคม 2567
              </p>

              <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900">1. บทนำ</h3>
                  <p>
                    SolarIQ ("เรา", "ของเรา") เคารพความเป็นส่วนตัวของคุณและมุ่งมั่นที่จะปกป้อง
                    ข้อมูลส่วนบุคคลของคุณตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
                    นโยบายนี้อธิบายว่าเราเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของคุณอย่างไร
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">2. ข้อมูลที่เราเก็บรวบรวม</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>ข้อมูลติดต่อ:</strong> ชื่อ, อีเมล, เบอร์โทรศัพท์, ที่อยู่</li>
                    <li><strong>ข้อมูลตำแหน่งที่ตั้ง:</strong> พิกัด GPS ของสถานที่ติดตั้งโซลาร์เซลล์</li>
                    <li><strong>ข้อมูลบิลค่าไฟ:</strong> ภาพบิลค่าไฟฟ้า, ข้อมูลการใช้ไฟฟ้า</li>
                    <li><strong>ข้อมูลการใช้งาน:</strong> ประวัติการใช้งานระบบ, การวิเคราะห์โซลาร์เซลล์</li>
                    <li><strong>ข้อมูลการสื่อสาร:</strong> ประวัติการแชทกับ AI Agent</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">3. วัตถุประสงค์ในการใช้ข้อมูล</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>วิเคราะห์ศักยภาพการติดตั้งโซลาร์เซลล์</li>
                    <li>คำนวณผลตอบแทนการลงทุน (ROI)</li>
                    <li>สร้างรายงานข้อเสนอโครงการ</li>
                    <li>ติดต่อสื่อสารกับคุณเกี่ยวกับบริการ</li>
                    <li>ปรับปรุงคุณภาพบริการ</li>
                    <li>ปฏิบัติตามกฎหมายและข้อบังคับ</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">4. ระยะเวลาเก็บรักษาข้อมูล</h3>
                  <table className="min-w-full border border-gray-200 mt-4">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border px-4 py-2 text-left">ประเภทข้อมูล</th>
                        <th className="border px-4 py-2 text-left">ระยะเวลาเก็บรักษา</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-4 py-2">ประวัติการแชท</td>
                        <td className="border px-4 py-2">90 วัน</td>
                      </tr>
                      <tr>
                        <td className="border px-4 py-2">ภาพบิลค่าไฟ</td>
                        <td className="border px-4 py-2">30 วัน</td>
                      </tr>
                      <tr>
                        <td className="border px-4 py-2">ข้อมูลการวิเคราะห์โซลาร์</td>
                        <td className="border px-4 py-2">1 ปี</td>
                      </tr>
                      <tr>
                        <td className="border px-4 py-2">ข้อมูลลูกค้า (Lead)</td>
                        <td className="border px-4 py-2">3 ปี</td>
                      </tr>
                      <tr>
                        <td className="border px-4 py-2">บันทึกการเข้าถึงข้อมูล</td>
                        <td className="border px-4 py-2">7 ปี</td>
                      </tr>
                      <tr>
                        <td className="border px-4 py-2">บันทึกความยินยอม</td>
                        <td className="border px-4 py-2">10 ปี</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">5. สิทธิของเจ้าของข้อมูล</h3>
                  <p>ตาม PDPA คุณมีสิทธิดังต่อไปนี้:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>สิทธิในการเข้าถึง:</strong> ขอสำเนาข้อมูลส่วนบุคคลของคุณ</li>
                    <li><strong>สิทธิในการแก้ไข:</strong> ขอแก้ไขข้อมูลที่ไม่ถูกต้อง</li>
                    <li><strong>สิทธิในการลบ:</strong> ขอให้ลบข้อมูลของคุณ</li>
                    <li><strong>สิทธิในการระงับการใช้:</strong> ขอให้ระงับการใช้ข้อมูล</li>
                    <li><strong>สิทธิในการคัดค้าน:</strong> คัดค้านการใช้ข้อมูลในบางกรณี</li>
                    <li><strong>สิทธิในการโอนย้าย:</strong> ขอรับข้อมูลในรูปแบบที่อ่านได้</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">6. การแบ่งปันข้อมูล</h3>
                  <p>
                    เราจะไม่เปิดเผยข้อมูลส่วนบุคคลของคุณให้กับบุคคลภายนอก เว้นแต่:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>คุณให้ความยินยอม</li>
                    <li>จำเป็นตามกฎหมาย</li>
                    <li>เพื่อป้องกันการฉ้อโกงหรือความปลอดภัย</li>
                    <li>กับผู้รับเหมาโซลาร์ที่คุณเลือก (หากให้ความยินยอม)</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">7. ความปลอดภัยของข้อมูล</h3>
                  <p>
                    เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสม เช่น:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>การเข้ารหัสข้อมูล (Encryption)</li>
                    <li>การควบคุมการเข้าถึง (Access Control)</li>
                    <li>การบันทึกการเข้าถึงข้อมูล (Audit Logging)</li>
                    <li>การสำรองข้อมูล (Backup)</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">8. ติดต่อเจ้าหน้าที่คุ้มครองข้อมูล (DPO)</h3>
                  <p>
                    หากคุณมีคำถามหรือข้อกังวลเกี่ยวกับข้อมูลส่วนบุคคล สามารถติดต่อเราได้ที่:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg mt-2">
                    <p><strong>Data Protection Officer (DPO)</strong></p>
                    <p>อีเมล: dpo@solariqapp.com</p>
                    <p>โทรศัพท์: 02-XXX-XXXX</p>
                    <p>ที่อยู่: 123 ถนนสุขุมวิท กรุงเทพฯ 10110</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">9. การเปลี่ยนแปลงนโยบาย</h3>
                  <p>
                    เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว โดยจะแจ้งให้คุณทราบผ่านช่องทางที่เหมาะสม
                    และจะระบุวันที่ปรับปรุงล่าสุดไว้ด้านบน
                  </p>
                </section>
              </div>
            </Card>
          </div>
        )}

        {/* Consent Tab */}
        {activeTab === 'consent' && user && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                การให้ความยินยอม
              </h2>
              {consentStatus && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {consentStatus.can_use_service
                      ? '✅ คุณได้ให้ความยินยอมครบถ้วนแล้ว สามารถใช้งานบริการได้ตามปกติ'
                      : '⚠️ กรุณาให้ความยินยอมในข้อมูลที่จำเป็นเพื่อใช้งานบริการ'}
                  </p>
                </div>
              )}
              <ConsentForm />
            </Card>
          </div>
        )}

        {/* Deletion Tab */}
        {activeTab === 'deletion' && user && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                ขอลบข้อมูล
              </h2>
              <p className="text-gray-600 mb-6">
                คุณมีสิทธิขอให้ลบข้อมูลส่วนบุคคลของคุณตาม PDPA
                การขอลบข้อมูลจะถูกพิจารณาภายใน 30 วัน
              </p>
              <DataDeletionRequest />
            </Card>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && user && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                ส่งออกข้อมูล
              </h2>
              <p className="text-gray-600 mb-6">
                คุณมีสิทธิขอรับสำเนาข้อมูลส่วนบุคคลของคุณตาม PDPA
                ข้อมูลจะถูกส่งให้คุณภายใน 24 ชั่วโมง
              </p>
              <Button
                variant="primary"
                onClick={handleExportData}
                disabled={isExporting}
                className="w-full sm:w-auto"
              >
                {isExporting ? 'กำลังส่งออกข้อมูล...' : 'ส่งออกข้อมูลของฉัน'}
              </Button>
            </Card>
          </div>
        )}

        {/* Login prompt for non-authenticated users */}
        {!user && activeTab !== 'policy' && (
          <Card className="p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              กรุณาเข้าสู่ระบบ
            </h2>
            <p className="text-gray-600 mb-6">
              คุณต้องเข้าสู่ระบบเพื่อจัดการการให้ความยินยอมและข้อมูลส่วนบุคคล
            </p>
            <Link href="/login">
              <Button variant="primary">เข้าสู่ระบบ</Button>
            </Link>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2024 SolarIQ. สงวนลิขสิทธิ์. |
            <Link href="/privacy" className="ml-2 text-blue-600 hover:underline">
              นโยบายความเป็นส่วนตัว
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
