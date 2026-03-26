'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, Facebook, Linkedin } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Contact Info                                                        */
/* ------------------------------------------------------------------ */
const contactCards = [
  {
    icon: Mail,
    title: 'อีเมล',
    detail: 'contact@solariqapp.com',
    sub: 'ตอบกลับภายใน 24 ชั่วโมง',
  },
  {
    icon: Phone,
    title: 'โทรศัพท์',
    detail: '085-662-1113',
    sub: 'จ.-ศ. 9:00-18:00',
  },
  {
    icon: MapPin,
    title: 'ที่อยู่',
    detail: 'นนทบุรี',
    sub: 'ประเทศไทย',
  },
  {
    icon: Clock,
    title: 'เวลาทำการ',
    detail: 'จ.-ศ. 9:00-18:00',
    sub: 'หยุดเสาร์-อาทิตย์ และวันหยุดนักขัตฤกษ์',
  },
]

const subjects = [
  'สอบถามทั่วไป',
  'สนใจแพ็กเกจ',
  'ปัญหาทางเทคนิค',
  'ข้อเสนอพิเศษ/Enterprise',
  'อื่นๆ',
]

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would send the data to an API
    setSubmitted(true)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-amber-500 py-20 sm:py-24">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-white/5" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            ติดต่อเรา
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/85">
            มีคำถามหรือต้องการข้อมูลเพิ่มเติม? ทีมงานของเราพร้อมช่วยเหลือคุณ
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="relative -mt-12 pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {contactCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{card.title}</h3>
                <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {card.detail}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{card.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ส่งข้อความถึงเรา
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                กรอกแบบฟอร์มด้านล่าง เราจะติดต่อกลับโดยเร็วที่สุด
              </p>

              {submitted ? (
                <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-8 text-center">
                  <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                    <Send className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 dark:text-green-300">
                    ส่งข้อความเรียบร้อยแล้ว!
                  </h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    ขอบคุณที่ติดต่อเรา ทีมงานจะตอบกลับภายใน 24 ชั่วโมง
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setFormData({ name: '', email: '', company: '', subject: '', message: '' })
                    }}
                    className="mt-6 rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                  >
                    ส่งข้อความอีกครั้ง
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      ชื่อ-นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="กรอกชื่อ-นามสกุล"
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      อีเมล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="example@company.com"
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      บริษัท <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="ชื่อบริษัท"
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      หัวข้อ <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    >
                      <option value="">เลือกหัวข้อ</option>
                      {subjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      รายละเอียด <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="อธิบายรายละเอียดที่ต้องการสอบถาม..."
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-8 py-3 text-sm font-semibold text-white shadow hover:bg-primary-700 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    ส่งข้อความ
                  </button>
                </form>
              )}
            </div>

            {/* Map + Social */}
            <div className="mt-12 lg:mt-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ที่ตั้งสำนักงาน
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">นนทบุรี ประเทศไทย</p>

              {/* Map placeholder */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                <iframe
                  title="SolarIQ Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62004.19453988828!2d100.48!3d13.86!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29d4e3c6b2e5f%3A0x4019a6a5b4b9460!2sNonthaburi!5e0!3m2!1sen!2sth!4v1700000000000!5m2!1sen!2sth"
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </div>

              {/* Social Links */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  ติดตามเราบนโซเชียลมีเดีย
                </h3>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-400 dark:text-gray-500 cursor-default">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 text-white">
                      <span className="text-xs font-bold">LINE</span>
                    </div>
                    LINE Official
                    <span className="ml-1 text-xs text-gray-400">(เร็วๆ นี้)</span>
                  </span>
                  <span className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-400 dark:text-gray-500 cursor-default">
                    <Facebook className="h-5 w-5 text-gray-400" />
                    Facebook
                    <span className="ml-1 text-xs text-gray-400">(เร็วๆ นี้)</span>
                  </span>
                  <span className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-400 dark:text-gray-500 cursor-default">
                    <Linkedin className="h-5 w-5 text-gray-400" />
                    LinkedIn
                    <span className="ml-1 text-xs text-gray-400">(เร็วๆ นี้)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
