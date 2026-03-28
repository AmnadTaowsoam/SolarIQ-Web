import { NextResponse } from 'next/server'

export const runtime = 'edge'

/**
 * POST /api/analytics/vitals
 * Receives Web Vitals metrics from the client.
 * Currently logs and discards — can be extended to forward to an analytics service.
 */
export async function POST() {
  // Accept the beacon silently — no processing needed for now
  return NextResponse.json({ ok: true }, { status: 200 })
}
