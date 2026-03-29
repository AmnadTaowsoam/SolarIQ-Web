import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface TOCItem {
  id: string
  label: string
}

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */
const tocItems: TOCItem[] = [
  { id: 'overview', label: '1. ภาพรวม' },
  { id: 'data-collected', label: '2. ข้อมูลที่เก็บรวบรวม' },
  { id: 'purpose', label: '3. วัตถุประสงค์ในการใช้ข้อมูล' },
  { id: 'data-sharing', label: '4. การเปิดเผยข้อมูล' },
  { id: 'data-security', label: '5. การรักษาความปลอดภัย' },
  { id: 'cookies', label: '6. คุกกี้และเทคโนโลยีติดตาม' },
  { id: 'data-retention', label: '7. ระยะเวลาเก็บรักษาข้อมูล' },
  { id: 'user-rights', label: '8. สิทธิของเจ้าของข้อมูล' },
  { id: 'payment-data', label: '9. ข้อมูลการชำระเงิน' },
  { id: 'children', label: '10. ข้อมูลเด็กและเยาวชน' },
  { id: 'international', label: '11. การโอนข้อมูลระหว่างประเทศ' },
  { id: 'changes', label: '12. การเปลี่ยนแปลงนโยบาย' },
  { id: 'contact', label: '13. การติดต่อ' },
]

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function PrivacyPolicyPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">นโยบายความเป็นส่วนตัว</h1>
          <p className="mt-4 text-[var(--brand-text-secondary)]">
            Privacy Policy | มีผลบังคับใช้ตั้งแต่วันที่ 1 มกราคม 2567
          </p>
          <p className="mt-2 text-sm text-[var(--brand-text-secondary)]">
            ปรับปรุงล่าสุด: 22 มีนาคม 2569
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Table of Contents - Sidebar */}
          <nav className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-[var(--brand-border)] dark:border-gray-700 bg-[var(--brand-background)] dark:bg-gray-800 p-5">
              <h3 className="text-sm font-bold text-[var(--brand-text)] dark:text-white mb-4">
                สารบัญ
              </h3>
              <ul className="space-y-2">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Content */}
          <div className="lg:col-span-3 prose prose-gray dark:prose-invert max-w-none">
            {/* Mobile TOC */}
            <div className="lg:hidden mb-8 rounded-xl border border-[var(--brand-border)] dark:border-gray-700 bg-[var(--brand-background)] dark:bg-gray-800 p-5">
              <h3 className="text-sm font-bold text-[var(--brand-text)] dark:text-white mb-3">
                สารบัญ
              </h3>
              <ul className="space-y-1.5">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] hover:text-primary-600 transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 1. Overview */}
            <section id="overview" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4">
                1. ภาพรวม
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-3">
                บริษัท SolarIQ จำกัด (&quot;บริษัท&quot;, &quot;เรา&quot;)
                เคารพสิทธิความเป็นส่วนตัวของผู้ใช้บริการ (&quot;ผู้ใช้&quot;, &quot;คุณ&quot;)
                นโยบายความเป็นส่วนตัวฉบับนี้อธิบายวิธีที่เราเก็บรวบรวม ใช้ เปิดเผย
                และปกป้องข้อมูลส่วนบุคคลของคุณเมื่อคุณใช้งานแพลตฟอร์ม SolarIQ
              </p>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-3">
                นโยบายฉบับนี้จัดทำขึ้นตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (Personal
                Data Protection Act: PDPA) แห่งราชอาณาจักรไทย
              </p>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed">
                โดยการใช้บริการของเรา
                คุณตกลงยินยอมให้เราเก็บรวบรวมและใช้ข้อมูลของคุณตามที่ระบุไว้ในนโยบายฉบับนี้
              </p>
            </section>

            {/* 2. Data Collected */}
            <section id="data-collected" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4">
                2. ข้อมูลที่เก็บรวบรวม
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-3">
                เราเก็บรวบรวมข้อมูลประเภทต่อไปนี้:
              </p>

              <h3 className="text-lg font-semibold text-[var(--brand-text)] dark:text-white mt-6 mb-3">
                2.1 ข้อมูลที่คุณให้โดยตรง
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                <li>ชื่อ-นามสกุล, อีเมล, เบอร์โทรศัพท์</li>
                <li>ชื่อบริษัท/องค์กร, เลขประจำตัวผู้เสียภาษี</li>
                <li>ที่อยู่สำหรับออกใบกำกับภาษี</li>
                <li>ข้อมูลการเข้าสู่ระบบ (อีเมลและรหัสผ่านที่เข้ารหัส)</li>
                <li>ข้อมูลโปรไฟล์ รูปภาพ และการตั้งค่า</li>
              </ul>

              <h3 className="text-lg font-semibold text-[var(--brand-text)] dark:text-white mt-6 mb-3">
                2.2 ข้อมูลที่เก็บอัตโนมัติ
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                <li>IP Address, ประเภทเบราว์เซอร์, อุปกรณ์ที่ใช้</li>
                <li>ข้อมูลการใช้งาน (หน้าที่เยี่ยมชม, เวลาที่ใช้, คลิก)</li>
                <li>ข้อมูลตำแหน่งที่ตั้ง (พิกัด GPS สำหรับวิเคราะห์โซลาร์)</li>
                <li>ข้อมูล Cookies และ Session</li>
              </ul>

              <h3 className="text-lg font-semibold text-[var(--brand-text)] dark:text-white mt-6 mb-3">
                2.3 ข้อมูลจากบุคคลที่สาม
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                <li>ข้อมูลจาก Google (เมื่อล็อกอินผ่าน Google OAuth)</li>
                <li>ข้อมูลการชำระเงินจาก Opn Payments (Omise)</li>
                <li>ข้อมูลแผนที่และภาพถ่ายดาวเทียมจาก Google Maps/Solar API</li>
              </ul>
            </section>

            {/* 3. Purpose */}
            <section id="purpose" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4">
                3. วัตถุประสงค์ในการใช้ข้อมูล
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-3">
                เราใช้ข้อมูลของคุณเพื่อ:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                <li>
                  <strong>ให้บริการ:</strong> วิเคราะห์ศักยภาพโซลาร์เซลล์ คำนวณ ROI สร้างรายงาน
                </li>
                <li>
                  <strong>จัดการบัญชี:</strong> สร้างและจัดการบัญชีผู้ใช้ ยืนยันตัวตน
                </li>
                <li>
                  <strong>ประมวลผลการชำระเงิน:</strong> เรียกเก็บค่าบริการ ออกใบเสร็จ
                </li>
                <li>
                  <strong>สื่อสาร:</strong> ส่งอีเมลยืนยัน แจ้งเตือนสำคัญ ข่าวสารบริการ
                </li>
                <li>
                  <strong>ปรับปรุงบริการ:</strong> วิเคราะห์การใช้งาน พัฒนาฟีเจอร์ใหม่
                </li>
                <li>
                  <strong>รักษาความปลอดภัย:</strong> ป้องกันการฉ้อโกง ตรวจจับการเข้าถึงที่ผิดปกติ
                </li>
                <li>
                  <strong>ปฏิบัติตามกฎหมาย:</strong> ปฏิบัติตามข้อบังคับทางกฎหมายและภาษี
                </li>
              </ul>
            </section>

            {/* 4. Data Sharing */}
            <section id="data-sharing" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4">
                4. การเปิดเผยข้อมูล
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-3">
                เราจะไม่ขาย ให้เช่า หรือแลกเปลี่ยนข้อมูลส่วนบุคคลของคุณกับบุคคลภายนอก
                ยกเว้นในกรณีต่อไปนี้:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                <li>
                  <strong>ผู้ให้บริการที่ได้รับอนุญาต:</strong> Google Cloud Platform
                  (โครงสร้างพื้นฐาน), Opn Payments/Omise (ชำระเงิน), SendGrid (อีเมล), Cloudflare
                  (CDN/DNS)
                </li>
                <li>
                  <strong>ตามคำสั่งศาลหรือกฎหมาย:</strong> เมื่อมีคำสั่งจากหน่วยงานราชการที่มีอำนาจ
                </li>
                <li>
                  <strong>ป้องกันการฉ้อโกง:</strong> เพื่อปกป้องสิทธิและความปลอดภัยของผู้ใช้
                </li>
                <li>
                  <strong>โดยได้รับความยินยอม:</strong>{' '}
                  เมื่อคุณอนุญาตให้เปิดเผยข้อมูลเป็นลายลักษณ์อักษร
                </li>
              </ul>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mt-3">
                ผู้ให้บริการทุกรายต้องลงนามข้อตกลงการประมวลผลข้อมูล (Data Processing Agreement)
                และปฏิบัติตามมาตรฐานความปลอดภัยที่เหมาะสม
              </p>
            </section>

            {/* 5. Data Security */}
            <section id="data-security" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4">
                5. การรักษาความปลอดภัย
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-3">
                เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลของคุณ:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                <li>
                  <strong>การเข้ารหัส:</strong> ข้อมูลถูกเข้ารหัสด้วย AES-256 ทั้งขณะจัดเก็บ (at
                  rest) และขณะส่ง (in transit) ผ่าน TLS 1.3
                </li>
                <li>
                  <strong>การเข้าถึง:</strong> ระบบ Role-Based Access Control (RBAC)
                  จำกัดการเข้าถึงข้อมูลเฉพาะบุคลากรที่มีสิทธิ์
                </li>
                <li>
                  <strong>โครงสร้างพื้นฐาน:</strong> จัดเก็บบน Google Cloud Platform
                  ที่ได้รับมาตรฐาน ISO 27001, SOC 2
                </li>
                <li>
                  <strong>การสำรองข้อมูล:</strong> สำรองข้อมูลอัตโนมัติทุกวัน
                  พร้อมระบบกู้คืนเมื่อเกิดเหตุฉุกเฉิน
                </li>
                <li>
                  <strong>การตรวจสอบ:</strong> มีระบบ Audit Log ติดตามการเข้าถึงข้อมูลทุกครั้ง
                </li>
                <li>
                  <strong>รหัสผ่าน:</strong> รหัสผ่านถูกเข้ารหัสด้วย bcrypt
                  ไม่มีการจัดเก็บรหัสผ่านในรูปแบบข้อความ
                </li>
              </ul>
            </section>

            {/* 6. Cookies */}
            <section id="cookies" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4">
                6. คุกกี้และเทคโนโลยีติดตาม
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-3">
                เราใช้คุกกี้และเทคโนโลยีที่คล้ายกันเพื่อ:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                <li>
                  <strong>คุกกี้ที่จำเป็น:</strong> สำหรับการเข้าสู่ระบบ ความปลอดภัย
                  และการทำงานพื้นฐาน
                </li>
                <li>
                  <strong>คุกกี้วิเคราะห์:</strong>{' '}
                  เพื่อเข้าใจวิธีที่คุณใช้งานเว็บไซต์และปรับปรุงประสบการณ์
                </li>
                <li>
                  <strong>คุกกี้การตั้งค่า:</strong> เพื่อจดจำการตั้งค่าและความชอบของคุณ
                </li>
              </ul>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mt-3">
                คุณสามารถปิดการใช้งานคุกกี้ได้ผ่านการตั้งค่าเบราว์เซอร์
                แต่อาจส่งผลกระทบต่อการทำงานบางส่วนของเว็บไซต์
              </p>
            </section>

            {/* 7. Data Retention */}
            <section id="data-retention" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4">
                7. ระยะเวลาเก็บรักษาข้อมูล
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                <li>
                  <strong>ข้อมูลบัญชี:</strong> เก็บตลอดระยะเวลาที่คุณใช้บริการ + 90
                  วันหลังยกเลิกบัญชี
                </li>
                <li>
                  <strong>ข้อมูลการชำระเงิน:</strong> เก็บรักษา 7 ปีตามข้อกำหนดทางภาษีของประเทศไทย
                </li>
                <li>
                  <strong>ข้อมูลการวิเคราะห์โซลาร์:</strong> เก็บตลอดระยะเวลาที่ใช้บริการ
                </li>
                <li>
                  <strong>ข้อมูล Log:</strong> เก็บรักษา 1 ปี เพื่อวัตถุประสงค์ด้านความปลอดภัย
                </li>
                <li>
                  <strong>ข้อมูลทางการตลาด:</strong> จนกว่าคุณจะยกเลิกการรับข่าวสาร
                </li>
              </ul>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mt-3">
                เมื่อครบกำหนดระยะเวลาเก็บรักษา ข้อมูลจะถูกลบหรือทำให้ไม่สามารถระบุตัวตนได้
                (anonymization)
              </p>
            </section>

            {/* 8. User Rights */}
            <section id="user-rights" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4">
                8. สิทธิของเจ้าของข้อมูล
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-3">
                ภายใต้พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) คุณมีสิทธิ์:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                <li>
                  <strong>สิทธิในการเข้าถึง:</strong> ขอสำเนาข้อมูลส่วนบุคคลที่เราเก็บรวบรวม
                </li>
                <li>
                  <strong>สิทธิในการแก้ไข:</strong> ขอให้แก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่สมบูรณ์
                </li>
                <li>
                  <strong>สิทธิในการลบ:</strong> ขอให้ลบข้อมูลส่วนบุคคล (ภายใต้ข้อจำกัดทางกฎหมาย)
                </li>
                <li>
                  <strong>สิทธิในการระงับ:</strong> ขอให้ระงับการใช้ข้อมูลชั่วคราว
                </li>
                <li>
                  <strong>สิทธิในการโอนย้าย:</strong> ขอรับข้อมูลในรูปแบบที่อ่านได้ด้วยเครื่อง
                </li>
                <li>
                  <strong>สิทธิในการคัดค้าน:</strong>{' '}
                  คัดค้านการประมวลผลข้อมูลเพื่อวัตถุประสงค์ทางการตลาด
                </li>
                <li>
                  <strong>สิทธิในการถอนความยินยอม:</strong> ถอนความยินยอมที่เคยให้ไว้ได้ตลอดเวลา
                </li>
                <li>
                  <strong>สิทธิในการร้องเรียน:</strong>{' '}
                  ร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล
                </li>
              </ul>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mt-3">
                เพื่อใช้สิทธิ์เหล่านี้ กรุณาติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO) ที่
                dpo@solariqapp.com เราจะดำเนินการตามคำขอภายใน 30 วัน
              </p>
            </section>

            {/* 9. Payment Data */}
            <section id="payment-data" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4">
                9. ข้อมูลการชำระเงิน
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-3">
                การชำระเงินผ่านแพลตฟอร์ม SolarIQ ดำเนินการโดย Opn Payments (Omise)
                ซึ่งเป็นผู้ให้บริการชำระเงินที่ได้รับอนุญาตจากธนาคารแห่งประเทศไทย
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                <li>
                  <strong>เราไม่จัดเก็บ</strong>ข้อมูลบัตรเครดิต/เดบิตในระบบของเรา
                </li>
                <li>
                  ข้อมูลบัตรถูกเข้ารหัสและจัดเก็บโดย Opn Payments ตามมาตรฐาน{' '}
                  <strong>PCI DSS Level 1</strong>
                </li>
                <li>
                  รองรับช่องทางชำระเงิน: บัตรเครดิต/เดบิต (Visa, Mastercard, JCB), พร้อมเพย์
                  (PromptPay), Internet Banking (SCB, KBANK, BBL)
                </li>
                <li>
                  ข้อมูลธุรกรรมที่เราจัดเก็บ: วันที่ชำระ จำนวนเงิน สถานะ รหัสอ้างอิง
                  (ไม่รวมข้อมูลบัตร)
                </li>
              </ul>
            </section>

            {/* 10. Children */}
            <section id="children" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4">
                10. ข้อมูลเด็กและเยาวชน
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed">
                บริการ SolarIQ ไม่ได้มุ่งเป้าหมายไปที่บุคคลที่มีอายุต่ำกว่า 18 ปี
                เราไม่เก็บรวบรวมข้อมูล จากเด็กและเยาวชนโดยเจตนา
                หากเราทราบว่าได้เก็บข้อมูลจากบุคคลที่มีอายุต่ำกว่า 18 ปี
                เราจะดำเนินการลบข้อมูลดังกล่าวทันที
              </p>
            </section>

            {/* 11. International */}
            <section id="international" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4">
                11. การโอนข้อมูลระหว่างประเทศ
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-3">
                ข้อมูลของคุณอาจถูกโอนไปยังเซิร์ฟเวอร์ที่ตั้งอยู่นอกประเทศไทย (เช่น Google Cloud
                Platform ในภูมิภาค asia-southeast1 สิงคโปร์) เราจะดำเนินการดังนี้:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                <li>ให้แน่ใจว่าประเทศปลายทางมีมาตรฐานคุ้มครองข้อมูลที่เพียงพอ</li>
                <li>ใช้มาตรการคุ้มครองที่เหมาะสม เช่น Standard Contractual Clauses</li>
                <li>เก็บข้อมูลในภูมิภาคเอเชียตะวันออกเฉียงใต้เป็นหลัก</li>
              </ul>
            </section>

            {/* 12. Changes */}
            <section id="changes" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4">
                12. การเปลี่ยนแปลงนโยบาย
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-3">
                เราอาจปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว โดยจะแจ้งให้ทราบผ่าน:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                <li>อีเมลแจ้งเตือนไปยังอีเมลที่ลงทะเบียน</li>
                <li>ประกาศบนเว็บไซต์ solariqapp.com</li>
                <li>แบนเนอร์แจ้งเตือนในแพลตฟอร์ม</li>
              </ul>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mt-3">
                การใช้บริการต่อหลังจากนโยบายใหม่มีผลบังคับใช้ ถือว่าคุณยอมรับนโยบายฉบับใหม่
              </p>
            </section>

            {/* 13. Contact */}
            <section id="contact" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4">
                13. การติดต่อ
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-3">
                หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว หรือต้องการใช้สิทธิ์ตาม PDPA:
              </p>
              <div className="rounded-xl border border-[var(--brand-border)] dark:border-gray-700 bg-[var(--brand-background)] dark:bg-gray-800 p-6 not-prose">
                <p className="font-semibold text-[var(--brand-text)] dark:text-white">
                  เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)
                </p>
                <div className="mt-3 space-y-1.5 text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                  <p>บริษัท SolarIQ จำกัด</p>
                  <p>อีเมล: dpo@solariqapp.com</p>
                  <p>อีเมลทั่วไป: privacy@solariqapp.com</p>
                  <p>โทรศัพท์: 085-662-1113</p>
                  <p>ที่อยู่: นนทบุรี, ประเทศไทย</p>
                  <p>เวลาทำการ: จันทร์ - ศุกร์ 9:00 - 18:00 น.</p>
                </div>
              </div>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mt-4 text-sm">
                คุณสามารถร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล
                หากเชื่อว่าเราไม่ปฏิบัติตาม PDPA
              </p>
            </section>

            {/* Related Links */}
            <div className="mt-12 rounded-xl border border-[var(--brand-border)] dark:border-gray-700 bg-[var(--brand-background)] dark:bg-gray-800 p-6 not-prose">
              <h3 className="font-semibold text-[var(--brand-text)] dark:text-white mb-3">
                เอกสารที่เกี่ยวข้อง
              </h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/terms"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  ข้อกำหนดการใช้งาน
                </Link>
                <span className="text-[var(--brand-text-secondary)]">|</span>
                <Link
                  href="/refund-policy"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  นโยบายการคืนเงิน
                </Link>
                <span className="text-[var(--brand-text-secondary)]">|</span>
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
    </div>
  )
}
