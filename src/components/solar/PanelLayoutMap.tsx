'use client'

import { useState, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { GoogleMap, useJsApiLoader, InfoWindow, Polygon, Rectangle } from '@react-google-maps/api'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { Layers, Thermometer, Zap } from 'lucide-react'
import type { SolarPanel, RoofSegment, PanelConfigOption } from '@/types'

interface PanelLayoutMapProps {
  latitude: number
  longitude: number
  panels: SolarPanel[]
  segments: RoofSegment[]
  /** All solarPanelConfigs from API (1 panel, 2, ... max) */
  panelConfigs?: PanelConfigOption[]
}

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '500px',
  borderRadius: 'var(--brand-radius-lg, 12px)',
}

// Standard solar panel dimensions (meters)
const PANEL_WIDTH_M = 0.99
const PANEL_HEIGHT_M = 1.65

const ENERGY_COLOR_KEYS = [
  { threshold: 0, color: '#ef4444', labelKey: 'low' },
  { threshold: 300, color: '#f97316', labelKey: 'medium' },
  { threshold: 400, color: '#eab308', labelKey: 'optimal' },
  { threshold: 500, color: '#22c55e', labelKey: 'optimal' },
]

function getPanelColor(energyKwh: number): string {
  for (let i = ENERGY_COLOR_KEYS.length - 1; i >= 0; i--) {
    if (energyKwh >= ENERGY_COLOR_KEYS[i].threshold) {
      return ENERGY_COLOR_KEYS[i].color
    }
  }
  return ENERGY_COLOR_KEYS[0].color
}

/**
 * Compute a point at a given distance and bearing from a center point.
 * Uses the Haversine-based formula for short distances.
 *
 * @param centerLat - Center latitude in degrees
 * @param centerLng - Center longitude in degrees
 * @param distanceM - Distance in meters
 * @param bearingDeg - Bearing in degrees (0=North, 90=East, 180=South, 270=West)
 */
function computeOffset(
  centerLat: number,
  centerLng: number,
  distanceM: number,
  bearingDeg: number
): { lat: number; lng: number } {
  const R = 6371000 // Earth radius in meters
  const latRad = (centerLat * Math.PI) / 180
  const lngRad = (centerLng * Math.PI) / 180
  const bearRad = (bearingDeg * Math.PI) / 180
  const dR = distanceM / R

  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(dR) + Math.cos(latRad) * Math.sin(dR) * Math.cos(bearRad)
  )
  const newLngRad =
    lngRad +
    Math.atan2(
      Math.sin(bearRad) * Math.sin(dR) * Math.cos(latRad),
      Math.cos(dR) - Math.sin(latRad) * Math.sin(newLatRad)
    )

  return {
    lat: (newLatRad * 180) / Math.PI,
    lng: (newLngRad * 180) / Math.PI,
  }
}

/**
 * Compute the 4 corners of a solar panel rotated by azimuth.
 * The azimuth rotates the panel so it aligns with the roof segment direction.
 */
function getPanelCorners(
  centerLat: number,
  centerLng: number,
  orientation: string,
  azimuthDeg: number
): { lat: number; lng: number }[] {
  // Panel dimensions based on orientation
  const w = orientation === 'LANDSCAPE' ? PANEL_HEIGHT_M : PANEL_WIDTH_M
  const h = orientation === 'LANDSCAPE' ? PANEL_WIDTH_M : PANEL_HEIGHT_M
  const halfW = w / 2
  const halfH = h / 2

  // Calculate distance from center to each corner
  const diag = Math.sqrt(halfW * halfW + halfH * halfH)

  // Angle offsets for each corner relative to azimuth
  const baseAngle = Math.atan2(halfW, halfH) * (180 / Math.PI)

  // Four corners at bearings relative to azimuth
  const bearings = [
    azimuthDeg - baseAngle, // top-left
    azimuthDeg + baseAngle, // top-right
    azimuthDeg + 180 - baseAngle, // bottom-right
    azimuthDeg + 180 + baseAngle, // bottom-left
  ]

  return bearings.map((b) => computeOffset(centerLat, centerLng, diag, b))
}

export function PanelLayoutMap({
  latitude,
  longitude,
  panels,
  segments,
  panelConfigs,
}: PanelLayoutMapProps) {
  const t = useTranslations('panelLayout')
  const [mapType, setMapType] = useState<'satellite' | 'roadmap'>('satellite')
  const [selectedPanel, setSelectedPanel] = useState<(SolarPanel & { index: number }) | null>(null)
  const maxPanels = panels.length
  const [panelCount, setPanelCount] = useState(maxPanels)
  const [showFluxHeatmap, setShowFluxHeatmap] = useState(false)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  const center = useMemo(() => ({ lat: latitude, lng: longitude }), [latitude, longitude])

  const onMapClick = useCallback(() => setSelectedPanel(null), [])

  // Energy from solarPanelConfigs for current slider position
  const currentConfigEnergy = useMemo(() => {
    if (!panelConfigs || panelConfigs.length === 0) {
      return null
    }
    const idx = Math.min(panelCount - 1, panelConfigs.length - 1)
    return idx >= 0 ? panelConfigs[idx] : null
  }, [panelConfigs, panelCount])

  // Get azimuth for each segment index
  const segmentAzimuths = useMemo(() => {
    const map: Record<number, number> = {}
    segments.forEach((seg, idx) => {
      map[idx] = seg.azimuthDegrees
    })
    return map
  }, [segments])

  // Panels are pre-sorted by energy (best first) from API.
  // Slice by panelCount from slider.
  const visiblePanels = useMemo(() => {
    if (!panels || panels.length === 0) {
      return []
    }
    return panels.slice(0, panelCount)
  }, [panels, panelCount])

  // Convert panels to rotated Polygon paths using actual lat/lng + azimuth
  const panelPolygons = useMemo(() => {
    return visiblePanels.map((panel, idx) => {
      const azimuth = segmentAzimuths[panel.segmentIndex] ?? 180 // default south-facing
      const corners = getPanelCorners(panel.centerLat, panel.centerLng, panel.orientation, azimuth)
      return {
        panel,
        index: idx,
        paths: corners,
        color: getPanelColor(panel.yearlyEnergyDcKwh),
      }
    })
  }, [visiblePanels, segmentAzimuths])

  // Flux heatmap grid
  const fluxHeatmapRects = useMemo(() => {
    if (!showFluxHeatmap || visiblePanels.length === 0) {
      return []
    }
    const gridSizeM = 3 // 3 meter grid cells
    const mPerDegLat = 111320
    const mPerDegLng = 111320 * Math.cos((latitude * Math.PI) / 180)
    const gridLat = gridSizeM / mPerDegLat
    const gridLng = gridSizeM / mPerDegLng

    const grid: Record<string, { totalEnergy: number; count: number; lat: number; lng: number }> =
      {}
    visiblePanels.forEach((p) => {
      const gLat = Math.floor(p.centerLat / gridLat) * gridLat
      const gLng = Math.floor(p.centerLng / gridLng) * gridLng
      const key = `${gLat}_${gLng}`
      if (!grid[key]) {
        grid[key] = { totalEnergy: 0, count: 0, lat: gLat, lng: gLng }
      }
      grid[key].totalEnergy += p.yearlyEnergyDcKwh
      grid[key].count += 1
    })

    const maxE = Math.max(...Object.values(grid).map((g) => g.totalEnergy / g.count), 1)
    return Object.values(grid).map((cell) => {
      const intensity = cell.totalEnergy / cell.count / maxE
      const r = Math.round(255 * Math.min(intensity * 2, 1))
      const g = Math.round(255 * Math.min((1 - intensity) * 2, 1))
      return {
        bounds: {
          north: cell.lat + gridLat,
          south: cell.lat,
          east: cell.lng + gridLng,
          west: cell.lng,
        },
        color: `rgb(${r}, ${g}, 0)`,
        opacity: 0.2 + intensity * 0.35,
      }
    })
  }, [showFluxHeatmap, visiblePanels, latitude])

  // Segment boundary polygons
  const segmentPolygons = useMemo(() => {
    if (!segments || segments.length === 0) {
      return []
    }
    const colors = ['#f97316', '#3b82f6', '#22c55e', '#8b5cf6', '#ec4899', '#14b8a6']
    return segments.map((seg, idx) => {
      const cLat = seg.centerLat || latitude
      const cLng = seg.centerLng || longitude
      const sizeM = Math.sqrt(seg.areaM2) / 2
      // Use segment azimuth to orient the boundary
      const corners = [
        computeOffset(cLat, cLng, sizeM, seg.azimuthDegrees - 45),
        computeOffset(cLat, cLng, sizeM, seg.azimuthDegrees + 45),
        computeOffset(cLat, cLng, sizeM, seg.azimuthDegrees + 135),
        computeOffset(cLat, cLng, sizeM, seg.azimuthDegrees + 225),
      ]
      return { segment: seg, color: colors[idx % colors.length], paths: corners }
    })
  }, [segments, latitude, longitude])

  if (loadError) {
    return (
      <Card>
        <CardBody className="p-6 text-center text-red-500">{t('title')}</CardBody>
      </Card>
    )
  }

  if (!isLoaded) {
    return (
      <Card>
        <CardBody className="p-6 flex items-center justify-center h-[500px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]" />
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title={t('title')}
        subtitle={`${visiblePanels.length} / ${maxPanels} ${t('panels')}`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFluxHeatmap(!showFluxHeatmap)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-[var(--brand-radius)] border transition-colors ${
                showFluxHeatmap
                  ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                  : 'border-[var(--brand-border)] text-[var(--brand-text)] hover:bg-[var(--brand-surface)]'
              }`}
            >
              <Thermometer className="w-4 h-4" />
              Flux Heatmap
            </button>
            <button
              onClick={() => setMapType(mapType === 'satellite' ? 'roadmap' : 'satellite')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-[var(--brand-radius)] border border-[var(--brand-border)] text-[var(--brand-text)] hover:bg-[var(--brand-surface)] transition-colors"
            >
              <Layers className="w-4 h-4" />
              {mapType === 'satellite' ? 'Map' : 'Satellite'}
            </button>
          </div>
        }
      />

      {/* Panel count slider — linked to solarPanelConfigs */}
      <div className="px-4 py-3 border-b border-[var(--brand-border)] space-y-2">
        <div className="flex items-center gap-3">
          <label className="text-sm text-[var(--brand-text)] whitespace-nowrap font-medium">
            {t('panels')}:
          </label>
          <input
            type="range"
            min={1}
            max={maxPanels}
            value={panelCount}
            onChange={(e) => setPanelCount(parseInt(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-[var(--brand-primary)]"
            style={{
              background: `linear-gradient(to right, var(--brand-primary) ${(panelCount / maxPanels) * 100}%, var(--brand-border) ${(panelCount / maxPanels) * 100}%)`,
            }}
          />
          <span className="text-sm font-bold text-[var(--brand-primary)] min-w-[5rem] text-right">
            {panelCount} {t('panels')}
          </span>
        </div>

        {/* Energy production from solarPanelConfigs for selected panel count */}
        {currentConfigEnergy && (
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[var(--brand-primary)]" />
              <span className="text-[var(--brand-text-secondary)]">
                {panelCount} {t('panels')} =
              </span>
              <span className="font-bold text-[var(--brand-text)]">
                {currentConfigEnergy.yearlyEnergyDcKwh.toLocaleString()} kWh
              </span>
            </div>
            <span className="text-[var(--brand-text-secondary)]">
              ({((panelCount / maxPanels) * 100).toFixed(0)}% {t('capacity')})
            </span>
            {currentConfigEnergy.roofSegmentSummaries.length > 0 && (
              <span className="text-xs text-[var(--brand-text-secondary)]">
                | {currentConfigEnergy.roofSegmentSummaries.length} {t('area')}
              </span>
            )}
          </div>
        )}
      </div>

      <CardBody className="p-0 overflow-hidden rounded-b-[var(--brand-radius-lg)]">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={center}
          zoom={20}
          mapTypeId={mapType}
          onClick={onMapClick}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            tilt: 0,
          }}
        >
          {/* Flux heatmap overlay */}
          {showFluxHeatmap &&
            fluxHeatmapRects.map((rect, idx) => (
              <Rectangle
                key={`flux-${idx}`}
                bounds={rect.bounds}
                options={{ fillColor: rect.color, fillOpacity: rect.opacity, strokeWeight: 0 }}
              />
            ))}

          {/* Segment boundary polygons */}
          {segmentPolygons.map((sp, idx) => (
            <Polygon
              key={`seg-${idx}`}
              paths={sp.paths}
              options={{
                fillColor: sp.color,
                fillOpacity: 0.08,
                strokeColor: sp.color,
                strokeOpacity: 0.5,
                strokeWeight: 1,
                strokePosition: 0, // INSIDE
              }}
            />
          ))}

          {/* Solar panel polygons — rotated rectangles at actual lat/lng */}
          {panelPolygons.map((pp) => (
            <Polygon
              key={`panel-${pp.index}`}
              paths={pp.paths}
              onClick={() => setSelectedPanel({ ...pp.panel, index: pp.index })}
              options={{
                fillColor: pp.color,
                fillOpacity: 0.8,
                strokeColor: '#ffffff',
                strokeOpacity: 0.9,
                strokeWeight: 1,
                clickable: true,
                zIndex: 10,
              }}
            />
          ))}

          {/* Selected panel info */}
          {selectedPanel && (
            <InfoWindow
              position={{ lat: selectedPanel.centerLat, lng: selectedPanel.centerLng }}
              onCloseClick={() => setSelectedPanel(null)}
            >
              <div className="p-2 min-w-[220px]">
                <h4 className="font-semibold text-sm text-[var(--brand-text)] mb-2">
                  {t('panels')} {selectedPanel.index + 1}
                </h4>
                <div className="space-y-1.5 text-xs text-[var(--brand-text-secondary)]">
                  <div className="flex justify-between">
                    <span>{t('orientation')}:</span>
                    <span className="font-medium">
                      {selectedPanel.orientation === 'LANDSCAPE' ? t('east') : t('north')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('area')}:</span>
                    <span className="font-medium">
                      Segment {selectedPanel.segmentIndex + 1}
                      {segmentAzimuths[selectedPanel.segmentIndex] !== undefined &&
                        ` (${segmentAzimuths[selectedPanel.segmentIndex]}${t('degrees')})`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('capacity')}:</span>
                    <span className="font-bold text-green-600">
                      {(selectedPanel.yearlyEnergyDcKwh ?? 0).toFixed(0)} kWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('coordinates')}:</span>
                    <span className="font-mono text-[10px]">
                      {(selectedPanel.centerLat ?? 0).toFixed(6)},{' '}
                      {(selectedPanel.centerLng ?? 0).toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Legend */}
        <div className="px-4 py-3 border-t border-[var(--brand-border)] flex flex-wrap items-center gap-4 text-xs text-[var(--brand-text-secondary)]">
          <span className="font-medium text-[var(--brand-text)]">{t('capacity')}:</span>
          {ENERGY_COLOR_KEYS.map((ec, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className="w-4 h-3 rounded-sm border border-white/50"
                style={{ backgroundColor: ec.color }}
              />
              <span>
                {ec.threshold}+ kWh ({t(ec.labelKey as Parameters<typeof t>[0])})
              </span>
            </div>
          ))}
          <div className="ml-auto text-[10px]">
            {PANEL_WIDTH_M}m × {PANEL_HEIGHT_M}m | {t('tilt')} Azimuth
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
