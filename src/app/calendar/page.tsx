'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'
import { useCalendarEvents } from '@/hooks/useCalendar'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

const TYPE_COLORS: Record<string, string> = {
  maintenance: 'bg-blue-500',
  service_request: 'bg-red-500',
  installation: 'bg-green-500',
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarPage() {
  const { user } = useAuth()
  const t = useTranslations('calendarPage')
  const events = useCalendarEvents()
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const DAYS = [
    t('daysShort.sun'),
    t('daysShort.mon'),
    t('daysShort.tue'),
    t('daysShort.wed'),
    t('daysShort.thu'),
    t('daysShort.fri'),
    t('daysShort.sat'),
  ]

  const MONTHS = [
    t('months.january'),
    t('months.february'),
    t('months.march'),
    t('months.april'),
    t('months.may'),
    t('months.june'),
    t('months.july'),
    t('months.august'),
    t('months.september'),
    t('months.october'),
    t('months.november'),
    t('months.december'),
  ]

  const TYPE_LABELS: Record<string, string> = {
    maintenance: t('eventTypes.maintenance'),
    service_request: t('eventTypes.service_request'),
    installation: t('eventTypes.installation'),
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof events> = {}
    for (const event of events) {
      const dateKey = event.date
      if (!map[dateKey]) {
        map[dateKey] = []
      }
      map[dateKey].push(event)
    }
    return map
  }, [events])

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : []

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  if (!user) {
    return null
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <AppLayout user={user}>
      <div className="max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
            <p className="mt-0.5 text-sm text-gray-500">{t('subtitle')}</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
          >
            + {t('addActivity')}
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs">
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${TYPE_COLORS[key]}`} />
              {label}
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border bg-white p-4">
              {/* Month Navigation */}
              <div className="mb-4 flex items-center justify-between">
                <button onClick={prevMonth} className="rounded-lg p-2 hover:bg-gray-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <h2 className="text-lg font-semibold">
                  {MONTHS[currentMonth]} {currentYear + 543}
                </h2>
                <button onClick={nextMonth} className="rounded-lg p-2 hover:bg-gray-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Day headers */}
              <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-gray-500">
                {DAYS.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Date cells */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const dayEvents = eventsByDate[dateStr] || []
                  const isToday = dateStr === todayStr
                  const isSelected = dateStr === selectedDate

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`relative flex min-h-[3.5rem] flex-col items-center rounded-lg p-1 text-sm transition-colors ${
                        isSelected
                          ? 'bg-amber-100 ring-2 ring-amber-400'
                          : isToday
                            ? 'bg-amber-50 font-bold text-amber-700'
                            : 'hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`${isToday ? 'flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs text-white' : ''}`}
                      >
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <div className="mt-0.5 flex gap-0.5">
                          {dayEvents.slice(0, 3).map((e, idx) => (
                            <span
                              key={idx}
                              className={`h-1.5 w-1.5 rounded-full ${TYPE_COLORS[e.type]}`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Event List */}
          <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-3 font-semibold text-gray-900">
              {selectedDate
                ? t('eventsForDate', { date: new Date(selectedDate).toLocaleDateString('th-TH') })
                : t('selectDatePrompt')}
            </h3>
            {selectedEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={event.href}
                    className="block rounded-lg border p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${TYPE_COLORS[event.type]}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.customerName}</p>
                        <span
                          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${
                            event.priority === 'urgent'
                              ? 'bg-red-100 text-red-700'
                              : event.priority === 'high'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {event.status === 'overdue' ? t('overdue') : event.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : selectedDate ? (
              <p className="text-sm text-gray-500">{t('noEventsToday')}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">{t('upcomingEvents')}</p>
                {events.slice(0, 5).map((event) => (
                  <Link
                    key={event.id}
                    href={event.href}
                    className="block rounded-lg border p-2 text-sm hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${TYPE_COLORS[event.type]}`} />
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <p className="ml-4 text-xs text-gray-500">
                      {event.customerName} • {new Date(event.date).toLocaleDateString('th-TH')}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Add Activity Modal */}
        {showAddModal && (
          <AddActivityModal selectedDate={selectedDate} onClose={() => setShowAddModal(false)} />
        )}
      </div>
    </AppLayout>
  )
}

function AddActivityModal({
  selectedDate,
  onClose,
}: {
  selectedDate: string | null
  onClose: () => void
}) {
  const t = useTranslations('addActivityModal')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    type: 'appointment',
    date: selectedDate || new Date().toISOString().split('T')[0],
    time: '09:00',
    customer_name: '',
    notes: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      await apiClient.post('/api/v1/calendar/events', {
        title: form.title,
        type: form.type,
        date: form.date,
        time: form.time,
        customer_name: form.customer_name || undefined,
        notes: form.notes || undefined,
      })
      onClose()
      window.location.reload()
    } catch {
      setError(t('error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('title')}</h2>
        {error && (
          <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('fields.activityName')} *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('fields.type')}
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
            >
              {(['appointment', 'survey', 'installation', 'maintenance', 'followup'] as const).map(
                (tp) => (
                  <option key={tp} value={tp}>
                    {t(`types.${tp}`)}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('fields.date')} *
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('fields.time')}
              </label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('fields.customerName')}
            </label>
            <input
              type="text"
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('fields.notes')}
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-amber-500 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {isSubmitting ? t('adding') : t('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
