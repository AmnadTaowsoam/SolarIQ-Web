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
  { id: 'general', label: '1. ข้อกำหนดทั่วไป' },
  { id: 'service-usage', label: '2. การใช้บริการ' },
  { id: 'user-accounts', label: '3. บัญชีผู้ใช้' },
  { id: 'payment', label: '4. การชำระเงิน' },
  { id: 'intellectual-property', label: '5. ทรัพย์สินทางปัญญา' },
  { id: 'liability', label: '6. ข้อจำกัดความรับผิดชอบ' },
  { id: 'cancellation', label: '7. การยกเลิกและคืนเงิน' },
  { id: 'privacy', label: '8. ความเป็นส่วนตัว' },
  { id: 'changes', label: '9. การเปลี่ยนแปลงข้อกำหนด' },
  { id: 'governing-law', label: '10. กฎหมายที่ใช้บังคับ' },
  { id: 'contact', label: '11. การติดต่อ' },
]

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function TermsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            ข้อกำหนดการใช้งาน
          </h1>
          <p className="mt-4 text-gray-300">
            Terms of Service | มีผลบังคับใช้ตั้งแต่วันที่ 1 มกราคม 2567
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Table of Contents - Sidebar */}
          <nav className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">สารบัญ</h3>
              <ul className="space-y-2">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
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
            <div className="lg:hidden mb-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">สารบัญ</h3>
              <ul className="space-y-1.5">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <section id="general" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                1. ข้อกำหนดทั่วไป
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                ข้อกำหนดการใช้งานนี้ (&quot;ข้อกำหนด&quot;) เป็นข้อตกลงระหว่างบริษัท SolarIQ จำกัด (&quot;บริษัท&quot;, &quot;เรา&quot;)
                กับผู้ใช้บริการ (&quot;ผู้ใช้&quot;, &quot;คุณ&quot;) ในการใช้งานแพลตฟอร์ม SolarIQ รวมถึงเว็บไซต์ แอปพลิเคชัน
                และบริการทั้งหมดที่เกี่ยวข้อง
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                การเข้าใช้งานแพลตฟอร์ม SolarIQ ถือว่าคุณยอมรับข้อกำหนดเหล่านี้ทั้งหมด
                หากคุณไม่ยอมรับข้อกำหนดใดๆ กรุณาหยุดใช้บริการของเราทันที
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                บริษัทขอสงวนสิทธิ์ในการแก้ไข เปลี่ยนแปลง หรือปรับปรุงข้อกำหนดเหล่านี้ได้ตลอดเวลา
                โดยจะแจ้งให้ผู้ใช้ทราบผ่านทางอีเมลหรือการแจ้งเตือนบนแพลตฟอร์ม
              </p>
            </section>

            <section id="service-usage" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                2. การใช้บริการ
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                SolarIQ เป็นแพลตฟอร์มวิเคราะห์พลังงานแสงอาทิตย์สำหรับธุรกิจ (B2B) ที่ให้บริการ:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>การวิเคราะห์ศักยภาพพลังงานแสงอาทิตย์ผ่าน Google Solar API</li>
                <li>การคำนวณผลตอบแทนการลงทุน (ROI) สำหรับระบบโซลาร์เซลล์</li>
                <li>การจัดการลูกค้าเป้าหมาย (Lead Management)</li>
                <li>การสร้างใบเสนอราคาและรายงานอัตโนมัติ</li>
                <li>การพยากรณ์สภาพอากาศและคุณภาพอากาศ</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-3">
                ผู้ใช้ตกลงที่จะใช้บริการเพื่อวัตถุประสงค์ที่ถูกกฎหมายเท่านั้น และจะไม่ใช้บริการในทางที่
                อาจก่อให้เกิดความเสียหายต่อบริษัทหรือบุคคลที่สาม
              </p>
            </section>

            <section id="user-accounts" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                3. บัญชีผู้ใช้
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                ในการใช้บริการ SolarIQ คุณจำเป็นต้องสร้างบัญชีผู้ใช้ โดยคุณรับรองว่า:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>ข้อมูลที่ให้เป็นข้อมูลที่ถูกต้องและเป็นปัจจุบัน</li>
                <li>คุณมีอายุครบ 18 ปีบริบูรณ์ หรือได้รับความยินยอมจากผู้ปกครอง</li>
                <li>คุณจะรักษาความลับของรหัสผ่านและข้อมูลบัญชี</li>
                <li>คุณจะแจ้งบริษัททันทีเมื่อพบการใช้งานบัญชีโดยไม่ได้รับอนุญาต</li>
                <li>คุณรับผิดชอบต่อกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของคุณ</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-3">
                บริษัทขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีที่ละเมิดข้อกำหนดการใช้งาน
              </p>
            </section>

            <section id="payment" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                4. การชำระเงิน
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>ค่าบริการจะเรียกเก็บตามแพ็กเกจที่เลือก (รายเดือนหรือรายปี)</li>
                <li>ราคาแสดงเป็นสกุลเงินบาทไทย (THB) และยังไม่รวมภาษีมูลค่าเพิ่ม 7%</li>
                <li>การชำระเงินจะเรียกเก็บโดยอัตโนมัติตามรอบบิล</li>
                <li>รองรับการชำระผ่านบัตรเครดิต/เดบิต, โอนผ่านธนาคาร และพร้อมเพย์</li>
                <li>บริษัทขอสงวนสิทธิ์ในการเปลี่ยนแปลงราคาโดยจะแจ้งให้ทราบล่วงหน้าอย่างน้อย 30 วัน</li>
                <li>หากการชำระเงินล้มเหลว บริษัทจะพยายามเรียกเก็บซ้ำภายใน 3 วันทำการ</li>
              </ul>
            </section>

            <section id="intellectual-property" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                5. ทรัพย์สินทางปัญญา
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                แพลตฟอร์ม SolarIQ รวมถึงซอฟต์แวร์ การออกแบบ โลโก้ เครื่องหมายการค้า เนื้อหา
                และทรัพย์สินทางปัญญาทั้งหมดเป็นของบริษัท SolarIQ จำกัด แต่เพียงผู้เดียว
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                ผู้ใช้ได้รับสิทธิ์ใช้งานแบบไม่ผูกขาด (non-exclusive) ไม่สามารถถ่ายโอนได้ (non-transferable)
                ตามระยะเวลาของแพ็กเกจที่สมัครใช้บริการ
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                ข้อมูลที่ผู้ใช้ป้อนเข้าสู่ระบบยังคงเป็นทรัพย์สินของผู้ใช้ บริษัทจะไม่ใช้ข้อมูลดังกล่าว
                เพื่อวัตถุประสงค์อื่นนอกเหนือจากการให้บริการ
              </p>
            </section>

            <section id="liability" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                6. ข้อจำกัดความรับผิดชอบ
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                บริการ SolarIQ ให้บริการในสภาพ &quot;ตามที่เป็น&quot; (as is) โดยบริษัทไม่รับประกันว่า:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>บริการจะไม่มีข้อผิดพลาดหรือหยุดชะงัก</li>
                <li>ผลการวิเคราะห์จะมีความแม่นยำ 100% ในทุกกรณี</li>
                <li>บริการจะเหมาะสมกับความต้องการเฉพาะของผู้ใช้ทุกราย</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-3">
                ผลการวิเคราะห์โซลาร์เป็นการประมาณการเท่านั้น ไม่ควรใช้เป็นข้อมูลเดียวในการตัดสินใจลงทุน
                บริษัทไม่รับผิดชอบต่อความเสียหายที่เกิดจากการตัดสินใจบนพื้นฐานของผลการวิเคราะห์
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-3">
                ความรับผิดชอบสูงสุดของบริษัทจำกัดอยู่ที่จำนวนค่าบริการที่ผู้ใช้ชำระในรอบ 12 เดือนที่ผ่านมา
              </p>
            </section>

            <section id="cancellation" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                7. การยกเลิกและคืนเงิน
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>ผู้ใช้สามารถยกเลิกแพ็กเกจได้ตลอดเวลาจากหน้าตั้งค่าบัญชี</li>
                <li>เมื่อยกเลิก ผู้ใช้จะยังสามารถใช้บริการได้จนสิ้นสุดรอบบิลปัจจุบัน</li>
                <li>สำหรับแพ็กเกจรายปี สามารถขอคืนเงินได้ภายใน 30 วันหลังการสมัคร โดยหักค่าบริการตามวันที่ใช้งาน</li>
                <li>ไม่มีการคืนเงินสำหรับแพ็กเกจรายเดือนที่ใช้งานไปแล้ว</li>
                <li>บริษัทขอสงวนสิทธิ์ในการยกเลิกบัญชีที่ละเมิดข้อกำหนดโดยไม่มีการคืนเงิน</li>
                <li>หลังจากยกเลิก ข้อมูลของผู้ใช้จะถูกเก็บรักษาเป็นเวลา 90 วัน ก่อนที่จะถูกลบออกจากระบบ</li>
              </ul>
            </section>

            <section id="privacy" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                8. ความเป็นส่วนตัว
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                การเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของผู้ใช้เป็นไปตามนโยบายความเป็นส่วนตัว
                ของบริษัท ซึ่งเป็นส่วนหนึ่งของข้อกำหนดนี้
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                บริษัทปฏิบัติตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
                อย่างเคร่งครัด
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                สามารถอ่านรายละเอียดเพิ่มเติมได้ที่{' '}
                <Link href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
                  นโยบายความเป็นส่วนตัว
                </Link>
              </p>
            </section>

            <section id="changes" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                9. การเปลี่ยนแปลงข้อกำหนด
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                บริษัทขอสงวนสิทธิ์ในการแก้ไข เปลี่ยนแปลง หรือปรับปรุงข้อกำหนดเหล่านี้ได้ตลอดเวลา
                โดยจะแจ้งให้ผู้ใช้ทราบล่วงหน้าไม่น้อยกว่า 30 วันผ่านทาง:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>อีเมลที่ลงทะเบียน</li>
                <li>การแจ้งเตือนบนแพลตฟอร์ม</li>
                <li>ประกาศบนเว็บไซต์ SolarIQ</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-3">
                การใช้บริการต่อหลังจากข้อกำหนดใหม่มีผลบังคับใช้ ถือว่าผู้ใช้ยอมรับข้อกำหนดใหม่
              </p>
            </section>

            <section id="governing-law" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                10. กฎหมายที่ใช้บังคับ
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                ข้อกำหนดนี้อยู่ภายใต้บังคับและตีความตามกฎหมายแห่งราชอาณาจักรไทย
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                ข้อพิพาทใดๆ ที่เกิดขึ้นจากหรือเกี่ยวข้องกับข้อกำหนดนี้จะอยู่ภายใต้เขตอำนาจศาลไทย
                โดยมีศาลที่มีเขตอำนาจในกรุงเทพมหานครเป็นศาลที่มีอำนาจพิจารณา
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                หากข้อกำหนดข้อใดถูกพิจารณาว่าเป็นโมฆะหรือไม่สามารถบังคับใช้ได้ ข้อกำหนดส่วนที่เหลือ
                จะยังคงมีผลบังคับใช้ต่อไป
              </p>
            </section>

            <section id="contact" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                11. การติดต่อ
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                หากมีข้อสงสัยเกี่ยวกับข้อกำหนดการใช้งาน สามารถติดต่อเราได้ที่:
              </p>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 not-prose">
                <p className="font-semibold text-gray-900 dark:text-white">บริษัท SolarIQ จำกัด</p>
                <div className="mt-3 space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <p>อีเมล: legal@solariq.co.th</p>
                  <p>โทรศัพท์: 02-XXX-XXXX</p>
                  <p>ที่อยู่: กรุงเทพมหานคร, ประเทศไทย</p>
                  <p>เวลาทำการ: จันทร์ - ศุกร์ 9:00 - 18:00 น.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
