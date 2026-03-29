'use client'

import { useState } from 'react'
import { Card, CardHeader, CardBody, Badge } from '@/components/ui'
import { Image as ImageIcon, ZoomIn, ZoomOut, Calendar } from 'lucide-react'
import type { DataLayerUrls } from '@/types'

interface AerialImageryProps {
  dataLayers: DataLayerUrls
  imageryDate?: string
}

const QUALITY_COLORS: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  HIGH: 'success',
  MEDIUM: 'warning',
  LOW: 'danger',
}

export function AerialImagery({ dataLayers, imageryDate }: AerialImageryProps) {
  const [zoom, setZoom] = useState(1)
  const [activeLayer, setActiveLayer] = useState<'rgb' | 'dsm' | 'mask' | 'flux'>('rgb')

  const layerUrl = (() => {
    switch (activeLayer) {
      case 'rgb':
        return dataLayers.rgbUrl
      case 'dsm':
        return dataLayers.dsmUrl
      case 'mask':
        return dataLayers.maskUrl
      case 'flux':
        return dataLayers.annualFluxUrl
      default:
        return dataLayers.rgbUrl
    }
  })()

  const layerLabels = {
    rgb: 'Satellite',
    dsm: 'Surface Model',
    mask: 'Roof Mask',
    flux: 'Annual Flux',
  }

  const quality = dataLayers.imageryQuality || 'MEDIUM'

  return (
    <Card>
      <CardHeader
        title="Aerial Imagery"
        subtitle="Satellite and data layer views"
        action={
          <div className="flex items-center gap-2">
            {imageryDate && (
              <div className="flex items-center gap-1 text-xs text-[var(--brand-text-secondary)]">
                <Calendar className="w-3.5 h-3.5" />
                <span>{imageryDate}</span>
              </div>
            )}
            <Badge variant={QUALITY_COLORS[quality] || 'default'}>{quality}</Badge>
          </div>
        }
      />
      <CardBody>
        {/* Layer selector */}
        <div className="flex gap-2 mb-4">
          {(Object.keys(layerLabels) as Array<keyof typeof layerLabels>).map((key) => (
            <button
              key={key}
              onClick={() => setActiveLayer(key)}
              className={`px-3 py-1.5 text-sm rounded-[var(--brand-radius)] border transition-colors ${
                activeLayer === key
                  ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]'
                  : 'border-[var(--brand-border)] text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface)]'
              }`}
            >
              {layerLabels[key]}
            </button>
          ))}
        </div>

        {/* Image display */}
        <div className="relative overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] dark:bg-gray-800 min-h-[300px] flex items-center justify-center">
          {layerUrl ? (
            <div
              className="transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={layerUrl}
                alt={`${layerLabels[activeLayer]} imagery`}
                className="max-w-full h-auto"
                style={{ maxHeight: '400px' }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-[var(--brand-text-secondary)]">
              <ImageIcon className="w-12 h-12 opacity-30" aria-hidden="true" />
              <p className="text-sm">
                No {layerLabels[activeLayer].toLowerCase()} imagery available
              </p>
            </div>
          )}

          {/* Zoom controls */}
          <div className="absolute bottom-3 right-3 flex gap-1">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
              className="p-2 rounded-lg bg-[var(--brand-surface)] border border-[var(--brand-border)] shadow-sm hover:bg-[var(--brand-primary)]/5 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-[var(--brand-text)]" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
              className="p-2 rounded-lg bg-[var(--brand-surface)] border border-[var(--brand-border)] shadow-sm hover:bg-[var(--brand-primary)]/5 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-[var(--brand-text)]" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="px-2 py-1 text-xs rounded-lg bg-[var(--brand-surface)] border border-[var(--brand-border)] shadow-sm hover:bg-[var(--brand-primary)]/5 transition-colors text-[var(--brand-text)]"
              title="Reset Zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
