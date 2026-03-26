import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function RefundPolicyPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">นโยบายการคืนเงิน</h1>
          <p className="mt-4 text-gray-300">
            Refund Policy | มีผลบังคับใช้ตั้งแต่วันที่ 1 มกราคม 2567
          </p>
          <p className="mt-2 text-sm text-gray-400">ปรับปรุงล่าสุด: 22 มีนาคม 2569</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          {/* Introduction */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-6 mb-10 not-prose">
            <p className="text-blue-800 dark:text-blue-300 text-sm leading-relaxed">
              <strong>สรุปสำคัญ:</strong> SolarIQ เสนอการทดลองใช้ฟรี 14 วัน ยกเลิกได้ตลอดเวลา
              สำหรับแพ็กเกจรายปีสามารถขอคืนเงินได้ภายใน 30 วัน เราต้องการให้คุณมั่นใจ 100%
              ก่อนตัดสินใจชำระเงิน
            </p>
          </div>

          {/* 1. Free Trial */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. การทดลองใช้ฟรี (Free Trial)
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                ผู้ใช้ใหม่ทุกคนได้รับสิทธิ์ทดลองใช้งานฟรี <strong>14 วัน</strong>{' '}
                โดยไม่ต้องใช้บัตรเครดิต
              </li>
              <li>ระหว่างช่วงทดลองใช้จะไม่มีการเรียกเก็บเงินใดๆ</li>
              <li>
                เมื่อครบ 14 วัน ระบบจะไม่เรียกเก็บเงินอัตโนมัติ —
                คุณต้องเลือกแพ็กเกจและชำระเงินด้วยตนเอง
              </li>
              <li>ข้อมูลที่สร้างระหว่างช่วงทดลองจะถูกเก็บรักษาไว้ 30 วันหลังสิ้นสุดช่วงทดลอง</li>
            </ul>
          </section>

          {/* 2. Subscription Cancellation */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. การยกเลิกแพ็กเกจ
            </h2>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              2.1 แพ็กเกจรายเดือน
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
              <li>ยกเลิกได้ตลอดเวลาจากหน้า Billing ในแพลตฟอร์ม</li>
              <li>ไม่มีค่าธรรมเนียมการยกเลิก</li>
              <li>เมื่อยกเลิก คุณจะยังใช้บริการได้จนสิ้นสุดรอบบิลปัจจุบัน</li>
              <li>
                <strong>ไม่มีการคืนเงิน</strong>สำหรับค่าบริการรายเดือนที่ชำระแล้ว
                เนื่องจากคุณยังใช้งานได้จนสิ้นรอบ
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              2.2 แพ็กเกจรายปี
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
              <li>ยกเลิกได้ตลอดเวลาจากหน้า Billing ในแพลตฟอร์ม</li>
              <li>ไม่มีค่าธรรมเนียมการยกเลิก</li>
              <li>
                สามารถขอคืนเงินได้ภายใน <strong>30 วัน</strong> นับจากวันที่ชำระเงิน
                (ดูรายละเอียดในข้อ 3)
              </li>
              <li>หลังจาก 30 วัน จะไม่สามารถขอคืนเงินได้ แต่คุณยังใช้บริการได้จนครบรอบปี</li>
            </ul>
          </section>

          {/* 3. Refund Conditions */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. เงื่อนไขการคืนเงิน
            </h2>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                      กรณี
                    </th>
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                      การคืนเงิน
                    </th>
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                      ระยะเวลาดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      ยกเลิกรายปีภายใน 30 วัน
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      คืนเงินตามสัดส่วน (หักวันที่ใช้แล้ว)
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      5-14 วันทำการ
                    </td>
                  </tr>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      ยกเลิกรายปีหลัง 30 วัน
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      ไม่คืนเงิน (ใช้ได้จนครบรอบปี)
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      -
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      ยกเลิกรายเดือน
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      ไม่คืนเงิน (ใช้ได้จนสิ้นรอบเดือน)
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      -
                    </td>
                  </tr>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      ระบบขัดข้อง (SLA breach)
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      เครดิตชดเชยตาม SLA
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      ในรอบบิลถัดไป
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      เรียกเก็บเงินซ้ำซ้อน
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      คืนเงินเต็มจำนวนที่เรียกเก็บซ้ำ
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      5-14 วันทำการ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. Refund Calculation */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. วิธีคำนวณเงินคืน (แพ็กเกจรายปี)
            </h2>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 not-prose mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">สูตรการคำนวณ:</p>
              <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                เงินคืน = ค่าบริการรายปี - (ค่าบริการรายเดือน x จำนวนเดือนที่ใช้แล้ว)
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              <strong>ตัวอย่าง:</strong> คุณสมัคร Professional รายปี (฿3,190/เดือน x 12 =
              ฿38,280/ปี) แล้วยกเลิกหลังใช้ 1 เดือน:
            </p>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 not-prose">
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>ค่าบริการรายเดือนปกติ: ฿3,990/เดือน</p>
                <p>ใช้ไป 1 เดือน: ฿3,990 x 1 = ฿3,990</p>
                <p className="font-semibold text-green-600 dark:text-green-400 text-base pt-2 border-t border-gray-200 dark:border-gray-700">
                  เงินคืน: ฿38,280 - ฿3,990 = ฿34,290
                </p>
              </div>
            </div>
          </section>

          {/* 5. How to Request */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. วิธีขอคืนเงิน
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-sm font-bold text-primary-600 dark:text-primary-400">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">ยกเลิกแพ็กเกจ</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ไปที่หน้า Billing &gt; Subscription &gt; กดยกเลิก
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-sm font-bold text-primary-600 dark:text-primary-400">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">ส่งคำขอคืนเงิน</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ส่งอีเมลไปที่ billing@solariqapp.com พร้อมระบุ: ชื่อบัญชี, อีเมลที่ลงทะเบียน,
                    เหตุผลในการขอคืนเงิน
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-sm font-bold text-primary-600 dark:text-primary-400">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">รอการตรวจสอบ</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ทีมงานจะตรวจสอบคำขอภายใน 3 วันทำการ
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-sm font-bold text-primary-600 dark:text-primary-400">
                  4
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">รับเงินคืน</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    เงินจะคืนผ่านช่องทางเดียวกับที่ชำระเงิน ภายใน 5-14 วันทำการ
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Refund Methods */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. ช่องทางการคืนเงิน
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                <strong>บัตรเครดิต/เดบิต:</strong> คืนเงินเข้าบัตรเดิมที่ใช้ชำระ (5-14 วันทำการ
                ขึ้นอยู่กับธนาคาร)
              </li>
              <li>
                <strong>พร้อมเพย์/Internet Banking:</strong> คืนเงินเข้าบัญชีธนาคารที่แจ้ง (3-7
                วันทำการ)
              </li>
              <li>
                <strong>โอนผ่านธนาคาร:</strong> คืนเงินเข้าบัญชีธนาคารที่แจ้ง (3-7 วันทำการ)
              </li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-3 text-sm">
              หมายเหตุ: ระยะเวลาอาจแตกต่างกันตามนโยบายของธนาคารผู้ออกบัตร
            </p>
          </section>

          {/* 7. Non-refundable */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. กรณีที่ไม่สามารถคืนเงินได้
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
              <li>แพ็กเกจรายเดือนที่ชำระแล้ว (คุณยังใช้งานได้จนสิ้นรอบเดือน)</li>
              <li>แพ็กเกจรายปีที่ใช้งานเกิน 30 วันแล้ว</li>
              <li>บัญชีที่ถูกระงับเนื่องจากละเมิดข้อกำหนดการใช้งาน</li>
              <li>ค่าบริการเสริม (Add-on) ที่ใช้งานไปแล้ว</li>
              <li>บัญชีที่เคยได้รับการคืนเงินมาก่อน (จำกัด 1 ครั้งต่อบัญชี)</li>
            </ul>
          </section>

          {/* 8. SLA Credit */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. เครดิตชดเชย SLA (Service Level Agreement)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              สำหรับแพ็กเกจ Enterprise ที่มี SLA 99.9% Uptime:
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                      Uptime ต่อเดือน
                    </th>
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                      เครดิตชดเชย
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      99.0% - 99.9%
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      10% ของค่าบริการเดือนนั้น
                    </td>
                  </tr>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      95.0% - 99.0%
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      25% ของค่าบริการเดือนนั้น
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      ต่ำกว่า 95.0%
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-600 dark:text-gray-400">
                      50% ของค่าบริการเดือนนั้น
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 9. Dispute */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. การโต้แย้งและข้อพิพาท
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              หากคุณไม่เห็นด้วยกับการตัดสินใจเกี่ยวกับการคืนเงิน คุณสามารถ:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
              <li>ส่งอีเมลอุทธรณ์ไปที่ billing@solariqapp.com พร้อมเหตุผลประกอบ</li>
              <li>ผู้บริหารจะพิจารณาคำอุทธรณ์ภายใน 7 วันทำการ</li>
              <li>หากยังไม่พอใจ สามารถดำเนินการตามช่องทางกฎหมายภายใต้กฎหมายแห่งราชอาณาจักรไทย</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. การติดต่อ</h2>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 not-prose">
              <p className="font-semibold text-gray-900 dark:text-white">ฝ่ายการเงินและชำระเงิน</p>
              <div className="mt-3 space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                <p>บริษัท SolarIQ จำกัด</p>
                <p>อีเมล: billing@solariqapp.com</p>
                <p>โทรศัพท์: 085-662-1113</p>
                <p>เวลาทำการ: จันทร์ - ศุกร์ 9:00 - 18:00 น.</p>
              </div>
            </div>
          </section>

          {/* Related Links */}
          <div className="mt-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 not-prose">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              เอกสารที่เกี่ยวข้อง
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/terms"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                ข้อกำหนดการใช้งาน
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/privacy"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                นโยบายความเป็นส่วนตัว
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/pricing-plans"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                แพ็กเกจและราคา
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/contact"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                ติดต่อเรา
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
