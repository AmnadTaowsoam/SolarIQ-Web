'use client'

import { useMemo } from 'react'
import { useUpcomingMaintenance } from './useMaintenance'
import { useServiceRequests } from './useServiceRequests'

export interface CalendarEvent {
  id: string
  title: string
  date: string
  type: 'maintenance' | 'service_request' | 'installation'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: string
  href: string
  customerName: string
}

export function useCalendarEvents() {
  const { data: maintenance } = useUpcomingMaintenance(90)
  const { data: openRequests } = useServiceRequests('open')
  const { data: inProgressRequests } = useServiceRequests('in_progress')

  const events = useMemo(() => {
    const items: CalendarEvent[] = []

    // Maintenance events
    if (maintenance) {
      for (const m of maintenance) {
        if (m.schedule?.next_due_date) {
          items.push({
            id: `maint-${m.schedule.id || Math.random()}`,
            title: `บำรุงรักษา: ${m.schedule.maintenance_type === 'cleaning' ? 'ล้างแผง' : m.schedule.maintenance_type === 'inverter_check' ? 'เช็คอินเวอร์เตอร์' : m.schedule.maintenance_type}`,
            date: m.schedule.next_due_date,
            type: 'maintenance',
            priority: m.days_until_due <= 7 ? 'high' : 'medium',
            status: m.days_until_due <= 0 ? 'overdue' : 'upcoming',
            href: `/maintenance/${m.installation?.id || ''}`,
            customerName: m.installation?.customer_name || '',
          })
        }
      }
    }

    // Service request events
    const allRequests = [...(openRequests || []), ...(inProgressRequests || [])]
    for (const req of allRequests) {
      items.push({
        id: `sr-${req.id}`,
        title: `${req.request_type === 'repair' ? 'แจ้งซ่อม' : req.request_type === 'complaint' ? 'ร้องเรียน' : 'คำร้อง'}: ${req.subject}`,
        date: req.created_at.split('T')[0],
        type: 'service_request',
        priority: req.priority as CalendarEvent['priority'],
        status: req.status,
        href: `/service-requests/${req.id}`,
        customerName: req.customer_name,
      })
    }

    // Sort by date
    items.sort((a, b) => a.date.localeCompare(b.date))
    return items
  }, [maintenance, openRequests, inProgressRequests])

  return events
}
