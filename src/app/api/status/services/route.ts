import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance'

interface ServiceProbeResult {
  name: string
  status: ServiceStatus
  description: string
  lastChecked: string
  details?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function probe(
  name: string,
  description: string,
  target: string | URL,
  options?: {
    detailResolver?: (payload: unknown) => string | undefined
  }
): Promise<ServiceProbeResult> {
  const lastChecked = new Date().toISOString()

  try {
    const response = await fetch(target, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    let payload: unknown = null
    try {
      payload = await response.json()
    } catch {
      payload = null
    }

    if (!response.ok) {
      return {
        name,
        status: response.status >= 500 ? 'outage' : 'degraded',
        description,
        lastChecked,
        details: `Probe failed with ${response.status}`,
      }
    }

    return {
      name,
      status: 'operational',
      description,
      lastChecked,
      details: options?.detailResolver?.(payload),
    }
  } catch (error) {
    return {
      name,
      status: 'degraded',
      description,
      lastChecked,
      details: error instanceof Error ? error.message : 'Probe failed',
    }
  }
}

export async function GET(request: Request) {
  const frontendHealthUrl = new URL('/api/health', request.url)

  const services = await Promise.all([
    probe('Frontend Website', 'Public website at www.solariqapp.com', frontendHealthUrl),
    probe('Backend API', 'Core REST API health check', `${API_BASE_URL}/health`),
    probe(
      'LINE Messaging API',
      'LINE webhook and message delivery health',
      `${API_BASE_URL}/webhook/line/health`
    ),
    probe(
      'Billing & Checkout',
      'Subscription and checkout readiness',
      `${API_BASE_URL}/api/v1/billing/public-status`,
      {
        detailResolver: (payload) => {
          if (
            payload &&
            typeof payload === 'object' &&
            'checkout_configured' in payload &&
            typeof payload.checkout_configured === 'boolean'
          ) {
            return payload.checkout_configured
              ? 'Checkout provider configured'
              : 'Checkout provider configuration missing'
          }
          return undefined
        },
      }
    ),
    probe(
      'Developer Sandbox',
      'Developer API sandbox availability',
      `${API_BASE_URL}/api/v1/developers/sandbox/public-status`
    ),
  ])

  return NextResponse.json(
    { services, checkedAt: new Date().toISOString() },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
