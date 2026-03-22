export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

/**
 * CSP Violation Report Endpoint
 * Receives Content Security Policy violation reports from the browser
 * These reports help identify potential XSS attacks or misconfigured CSP
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the CSP violation report
    const report = await request.json()

    // Extract key information from the report
    const cspReport = report['csp-report'] || report
    const _violationInfo = {
      timestamp: new Date().toISOString(),
      'document-uri': cspReport['document-uri'] || 'unknown',
      referrer: cspReport['referrer'] || 'unknown',
      'violated-directive': cspReport['violated-directive'] || 'unknown',
      'effective-directive': cspReport['effective-directive'] || 'unknown',
      'original-policy': cspReport['original-policy'] ? '[truncated]' : 'unknown',
      'blocked-uri': cspReport['blocked-uri'] || 'unknown',
      'status-code': cspReport['status-code'] || 0,
      'script-sample': cspReport['script-sample'] || null,
      'source-file': cspReport['source-file'] || 'unknown',
      'line-number': cspReport['line-number'] || 0,
      'column-number': cspReport['column-number'] || 0,
    }

    // In production, you would send _violationInfo to a logging service
    // For now, we'll just acknowledge receipt
    // Note: We don't log the full report to avoid potential injection in logs

    // Return 204 No Content (standard for CSP reports)
    return new NextResponse(null, { status: 204 })
  } catch {
    // If parsing fails, still return 204 to avoid breaking the browser's reporting
    return new NextResponse(null, { status: 204 })
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
