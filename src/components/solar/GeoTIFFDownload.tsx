'use client'

import { Card, CardHeader, CardBody } from '@/components/ui'
import { Download, Map, Layers, Sun, Cloud, Image as ImageIcon } from 'lucide-react'
import type { DataLayerUrls } from '@/types'

interface GeoTIFFDownloadProps {
  dataLayers: DataLayerUrls
}

interface LayerInfo {
  key: keyof DataLayerUrls
  label: string
  description: string
  icon: React.ReactNode
}

const LAYERS: LayerInfo[] = [
  {
    key: 'dsmUrl',
    label: 'Digital Surface Model (DSM)',
    description:
      'Elevation data showing roof geometry, building heights, and surrounding structures in meters above ground.',
    icon: <Map className="w-5 h-5 text-blue-500" />,
  },
  {
    key: 'rgbUrl',
    label: 'RGB Satellite Imagery',
    description: 'High-resolution satellite/aerial imagery of the building and its surroundings.',
    icon: <ImageIcon className="w-5 h-5 text-green-500" aria-hidden="true" />,
  },
  {
    key: 'maskUrl',
    label: 'Roof Mask',
    description: 'Binary mask identifying roof surfaces suitable for solar panel installation.',
    icon: <Layers className="w-5 h-5 text-purple-500" />,
  },
  {
    key: 'annualFluxUrl',
    label: 'Annual Solar Flux Map',
    description:
      'Annual solar energy received per pixel in kWh/m2/year, accounting for shade and orientation.',
    icon: <Sun className="w-5 h-5 text-[var(--brand-primary)]" />,
  },
  {
    key: 'monthlyFluxUrl',
    label: 'Monthly Flux Maps',
    description:
      'Monthly breakdown of solar flux showing seasonal variation across the roof surface.',
    icon: <Sun className="w-5 h-5 text-amber-500" />,
  },
]

export function GeoTIFFDownload({ dataLayers }: GeoTIFFDownloadProps) {
  const availableCount = LAYERS.filter((l) => {
    const val = dataLayers[l.key]
    return typeof val === 'string' && val.length > 0
  }).length

  const shadeLayerCount = dataLayers.hourlyShadeUrls?.length || 0

  return (
    <Card>
      <CardHeader
        title="Data Layer Downloads"
        subtitle={`${availableCount + (shadeLayerCount > 0 ? 1 : 0)} data layers available for download`}
      />
      <CardBody>
        <div className="space-y-3">
          {LAYERS.map((layer) => {
            const url = dataLayers[layer.key]
            const isAvailable = typeof url === 'string' && url.length > 0
            return (
              <div
                key={layer.key}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                  isAvailable
                    ? 'border-[var(--brand-border)] hover:border-[var(--brand-primary)]/50'
                    : 'border-[var(--brand-border)] opacity-50'
                }`}
              >
                <div className="p-2 rounded-lg bg-[var(--brand-surface)] border border-[var(--brand-border)]">
                  {layer.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[var(--brand-text)] text-sm">{layer.label}</h4>
                  <p className="text-xs text-[var(--brand-text-secondary)] mt-1 line-clamp-2">
                    {layer.description}
                  </p>
                </div>
                {isAvailable ? (
                  <a
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-[var(--brand-radius)] bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] transition-colors flex-shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                ) : (
                  <span className="text-xs text-[var(--brand-text-secondary)] px-3 py-1.5 flex-shrink-0">
                    Not available
                  </span>
                )}
              </div>
            )
          })}

          {/* Hourly shade maps */}
          {shadeLayerCount > 0 && (
            <div className="flex items-start gap-4 p-4 rounded-lg border border-[var(--brand-border)] hover:border-[var(--brand-primary)]/50 transition-colors">
              <div className="p-2 rounded-lg bg-[var(--brand-surface)] border border-[var(--brand-border)]">
                <Cloud className="w-5 h-5 text-[var(--brand-text-secondary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-[var(--brand-text)] text-sm">
                  Hourly Shade Maps ({shadeLayerCount} files)
                </h4>
                <p className="text-xs text-[var(--brand-text-secondary)] mt-1">
                  Hourly shade coverage maps showing shadow patterns at each hour of the day.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {dataLayers.hourlyShadeUrls.slice(0, 12).map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-[var(--brand-surface)] border border-[var(--brand-border)] text-[var(--brand-text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      {i.toString().padStart(2, '0')}:00
                    </a>
                  ))}
                  {shadeLayerCount > 12 && (
                    <span className="inline-flex items-center px-2 py-1 text-xs text-[var(--brand-text-secondary)]">
                      +{shadeLayerCount - 12} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
