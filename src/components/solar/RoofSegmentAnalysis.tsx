'use client'

import { Card, CardHeader, CardBody } from '@/components/ui'
import { Ruler, Sun, LayoutGrid, Building } from 'lucide-react'
import type { RoofSegment } from '@/types'

interface RoofSegmentAnalysisProps {
  segments: RoofSegment[]
}

function getDirection(azimuth: number): string {
  const normalized = ((azimuth % 360) + 360) % 360
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const
  const index = Math.round(normalized / 45) % 8
  return directions[index] ?? 'N'
}

function CompassVisual({ azimuth }: { azimuth: number }) {
  return (
    <div className="relative w-12 h-12 rounded-full border-2 border-[var(--brand-border)] flex items-center justify-center">
      <div className="absolute text-[8px] text-[var(--brand-text-secondary)] -top-0.5">N</div>
      <div className="absolute text-[8px] text-[var(--brand-text-secondary)] -bottom-0.5">S</div>
      <div className="absolute text-[8px] text-[var(--brand-text-secondary)] -right-0.5">E</div>
      <div className="absolute text-[8px] text-[var(--brand-text-secondary)] -left-0.5">W</div>
      <div
        className="w-0.5 h-4 bg-[var(--brand-primary)] rounded-full origin-bottom absolute"
        style={{
          transform: `rotate(${azimuth}deg)`,
          bottom: '50%',
        }}
      />
      <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)]" />
    </div>
  )
}

function PitchIndicator({ pitch }: { pitch: number }) {
  const height = Math.max(8, Math.min(24, (pitch / 45) * 24))
  return (
    <div className="flex items-end gap-1 h-6">
      <div
        className="w-8 bg-[var(--brand-primary)] rounded-t-sm opacity-70"
        style={{ height: `${height}px` }}
      />
      <span className="text-xs text-[var(--brand-text-secondary)]">{pitch.toFixed(0)}&deg;</span>
    </div>
  )
}

export function RoofSegmentAnalysis({ segments }: RoofSegmentAnalysisProps) {
  if (!segments || segments.length === 0) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <Building className="w-12 h-12 mx-auto mb-3 text-[var(--brand-text-secondary)] opacity-30" />
          <p className="text-[var(--brand-text-secondary)] font-medium mb-2">
            {
              '\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E48\u0E27\u0E19\u0E2B\u0E25\u0E31\u0E07\u0E04\u0E32'
            }
          </p>
          <p className="text-sm text-[var(--brand-text-secondary)]">
            Google Solar API{' '}
            {
              '\u0E44\u0E21\u0E48\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Roof Segment \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07\u0E19\u0E35\u0E49'
            }
            {' \u2014 '}
            {
              '\u0E2D\u0E32\u0E08\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E1E\u0E23\u0E32\u0E30\u0E20\u0E32\u0E1E\u0E16\u0E48\u0E32\u0E22\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E04\u0E23\u0E2D\u0E1A\u0E04\u0E25\u0E38\u0E21\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E19\u0E35\u0E49'
            }
          </p>
          <p className="text-xs text-[var(--brand-text-secondary)] mt-2">
            Roof segment data is not available from Google Solar API for this location. This may be
            because satellite imagery does not fully cover this area yet.
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((segment, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader
              title={`Segment ${index + 1}`}
              subtitle={`${getDirection(segment.azimuthDegrees)}-facing`}
            />
            <CardBody className="space-y-4">
              {/* Compass & Pitch */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CompassVisual azimuth={segment.azimuthDegrees} />
                  <div>
                    <div className="text-xs text-[var(--brand-text-secondary)]">Azimuth</div>
                    <div className="text-sm font-medium text-[var(--brand-text)]">
                      {segment.azimuthDegrees.toFixed(1)}&deg;
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[var(--brand-text-secondary)]">Pitch</div>
                  <PitchIndicator pitch={segment.pitchDegrees} />
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center p-2 rounded-lg bg-[var(--brand-primary)]/5">
                  <Ruler className="w-4 h-4 text-[var(--brand-primary)] mb-1" />
                  <span className="text-xs text-[var(--brand-text-secondary)]">Area</span>
                  <span className="text-sm font-semibold text-[var(--brand-text)]">
                    {segment.areaM2.toFixed(1)} m&sup2;
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-amber-500/5">
                  <Sun className="w-4 h-4 text-amber-500 mb-1" />
                  <span className="text-xs text-[var(--brand-text-secondary)]">Sun hrs</span>
                  <span className="text-sm font-semibold text-[var(--brand-text)]">
                    {segment.sunshineHours.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-orange-500/5">
                  <LayoutGrid className="w-4 h-4 text-orange-500 mb-1" />
                  <span className="text-xs text-[var(--brand-text-secondary)]">Panels</span>
                  <span className="text-sm font-semibold text-[var(--brand-text)]">
                    {segment.panelCount}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-wrap gap-6 justify-center text-sm">
            <div className="text-center">
              <div className="text-[var(--brand-text-secondary)]">Total Segments</div>
              <div className="text-lg font-bold text-[var(--brand-text)]">{segments.length}</div>
            </div>
            <div className="text-center">
              <div className="text-[var(--brand-text-secondary)]">Total Area</div>
              <div className="text-lg font-bold text-[var(--brand-text)]">
                {segments.reduce((s, seg) => s + seg.areaM2, 0).toFixed(1)} m&sup2;
              </div>
            </div>
            <div className="text-center">
              <div className="text-[var(--brand-text-secondary)]">Total Panels</div>
              <div className="text-lg font-bold text-[var(--brand-primary)]">
                {segments.reduce((s, seg) => s + seg.panelCount, 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[var(--brand-text-secondary)]">Avg Sunshine</div>
              <div className="text-lg font-bold text-amber-500">
                {(segments.reduce((s, seg) => s + seg.sunshineHours, 0) / segments.length).toFixed(
                  0
                )}{' '}
                hrs
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
