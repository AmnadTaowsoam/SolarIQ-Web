'use client'

import { useState, useCallback, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polygon, Rectangle } from '@react-google-maps/api'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { Layers, Thermometer } from 'lucide-react'
import type { SolarPanel, RoofSegment } from '@/types'

interface PanelLayoutMapProps {
  latitude: number
  longitude: number
  panels: SolarPanel[]
  segments: RoofSegment[]
}

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '500px',
  borderRadius: 'var(--brand-radius-lg, 12px)',
}

const ENERGY_COLORS = [
  { threshold: 0, color: '#ef4444' },
  { threshold: 200, color: '#f97316' },
  { threshold: 350, color: '#eab308' },
  { threshold: 500, color: '#22c55e' },
]

function getPanelColor(energyKwh: number): string {
  for (let i = ENERGY_COLORS.length - 1; i >= 0; i--) {
    if (energyKwh >= ENERGY_COLORS[i].threshold) {
      return ENERGY_COLORS[i].color
    }
  }
  return ENERGY_COLORS[0].color
}

export function PanelLayoutMap({ latitude, longitude, panels, segments }: PanelLayoutMapProps) {
  const [mapType, setMapType] = useState<'satellite' | 'roadmap'>('satellite')
  const [selectedPanel, setSelectedPanel] = useState<SolarPanel | null>(null)
  const [panelPercentage, setPanelPercentage] = useState(100)
  const [showFluxHeatmap, setShowFluxHeatmap] = useState(false)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  const center = useMemo(() => ({ lat: latitude, lng: longitude }), [latitude, longitude])

  const onMapClick = useCallback(() => {
    setSelectedPanel(null)
  }, [])

  // Convert panel positions to map coordinates, sorted by energy (highest first)
  // Slice by panelPercentage to show top N% of panels
  const allPanelMarkers = useMemo(() => {
    if (!panels || panels.length === 0) return []
    const scaleFactor = 0.00002 // Approximate scale for panel positions
    return [...panels]
      .map((panel, idx) => ({
        ...panel,
        lat: latitude + panel.centerY * scaleFactor,
        lng: longitude + panel.centerX * scaleFactor,
        index: idx,
      }))
      .sort((a, b) => b.yearlyEnergyDcKwh - a.yearlyEnergyDcKwh)
  }, [panels, latitude, longitude])

  const panelMarkers = useMemo(() => {
    const count = Math.max(1, Math.round((panelPercentage / 100) * allPanelMarkers.length))
    return allPanelMarkers.slice(0, count)
  }, [allPanelMarkers, panelPercentage])

  // Generate flux heatmap overlay rectangles
  const fluxHeatmapRects = useMemo(() => {
    if (!showFluxHeatmap || !panels || panels.length === 0) return []
    const scaleFactor = 0.00002
    const gridSize = 0.00004 // Size of each heatmap cell
    // Group panels into a grid and compute average energy per cell
    const grid: Record<string, { totalEnergy: number; count: number; lat: number; lng: number }> = {}
    panels.forEach((panel) => {
      const pLat = latitude + panel.centerY * scaleFactor
      const pLng = longitude + panel.centerX * scaleFactor
      const gridKey = `${Math.floor(pLat / gridSize)}_${Math.floor(pLng / gridSize)}`
      if (!grid[gridKey]) {
        grid[gridKey] = { totalEnergy: 0, count: 0, lat: Math.floor(pLat / gridSize) * gridSize, lng: Math.floor(pLng / gridSize) * gridSize }
      }
      grid[gridKey].totalEnergy += panel.yearlyEnergyDcKwh
      grid[gridKey].count += 1
    })
    const maxEnergy = Math.max(...Object.values(grid).map((g) => g.totalEnergy / g.count), 1)
    return Object.values(grid).map((cell) => {
      const avgEnergy = cell.totalEnergy / cell.count
      const intensity = avgEnergy / maxEnergy
      // Color from blue (low) through yellow to red (high)
      const r = Math.round(255 * Math.min(intensity * 2, 1))
      const g = Math.round(255 * Math.min((1 - intensity) * 2, 1))
      const color = `rgb(${r}, ${g}, 0)`
      return {
        bounds: {
          north: cell.lat + gridSize,
          south: cell.lat,
          east: cell.lng + gridSize,
          west: cell.lng,
        },
        color,
        opacity: 0.3 + intensity * 0.3,
      }
    })
  }, [showFluxHeatmap, panels, latitude, longitude])

  // Build segment polygons
  const segmentPolygons = useMemo(() => {
    if (!segments || segments.length === 0) return []
    const colors = ['#f97316', '#3b82f6', '#22c55e', '#8b5cf6', '#ec4899', '#14b8a6']
    return segments.map((seg, idx) => {
      const cLat = seg.centerLat || latitude
      const cLng = seg.centerLng || longitude
      const size = Math.sqrt(seg.areaM2) * 0.000005
      return {
        segment: seg,
        color: colors[idx % colors.length],
        paths: [
          { lat: cLat - size, lng: cLng - size },
          { lat: cLat - size, lng: cLng + size },
          { lat: cLat + size, lng: cLng + size },
          { lat: cLat + size, lng: cLng - size },
        ],
      }
    })
  }, [segments, latitude, longitude])

  if (loadError) {
    return (
      <Card>
        <CardBody className="p-6 text-center text-red-500">
          Failed to load Google Maps. Please check your API key configuration.
        </CardBody>
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
        title="Panel Layout"
        subtitle={`${panelMarkers.length} of ${panels.length} panels shown`}
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
              {mapType === 'satellite' ? 'Map View' : 'Satellite'}
            </button>
          </div>
        }
      />
      {/* Panel count slider */}
      <div className="px-4 py-3 border-b border-[var(--brand-border)]">
        <div className="flex items-center gap-3">
          <label className="text-sm text-[var(--brand-text)] whitespace-nowrap">
            {'\u0E41\u0E2A\u0E14\u0E07'} {panelPercentage}% {'\u0E02\u0E2D\u0E07\u0E41\u0E1C\u0E07\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14'}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={panelPercentage}
            onChange={(e) => setPanelPercentage(parseInt(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-[var(--brand-primary)]"
            style={{
              background: `linear-gradient(to right, var(--brand-primary) ${panelPercentage}%, var(--brand-border) ${panelPercentage}%)`,
            }}
          />
          <span className="text-sm font-medium text-[var(--brand-text)] min-w-[4rem] text-right">
            {panelMarkers.length} panels
          </span>
        </div>
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
          }}
        >
          {/* Flux heatmap overlay */}
          {showFluxHeatmap && fluxHeatmapRects.map((rect, idx) => (
            <Rectangle
              key={`flux-${idx}`}
              bounds={rect.bounds}
              options={{
                fillColor: rect.color,
                fillOpacity: rect.opacity,
                strokeColor: rect.color,
                strokeOpacity: 0.1,
                strokeWeight: 0,
              }}
            />
          ))}

          {/* Segment polygons */}
          {segmentPolygons.map((sp, idx) => (
            <Polygon
              key={`seg-${idx}`}
              paths={sp.paths}
              options={{
                fillColor: sp.color,
                fillOpacity: 0.15,
                strokeColor: sp.color,
                strokeOpacity: 0.6,
                strokeWeight: 1,
              }}
            />
          ))}

          {/* Panel markers */}
          {panelMarkers.map((pm) => (
            <Marker
              key={`panel-${pm.index}`}
              position={{ lat: pm.lat, lng: pm.lng }}
              onClick={() => setSelectedPanel(pm)}
              icon={{
                path: 'M 0,-1 L 1,1 L -1,1 Z',
                scale: 5,
                fillColor: getPanelColor(pm.yearlyEnergyDcKwh),
                fillOpacity: 0.9,
                strokeColor: '#ffffff',
                strokeWeight: 1,
                rotation: pm.orientation === 'LANDSCAPE' ? 90 : 0,
              }}
            />
          ))}

          {/* Panel info window */}
          {selectedPanel && (
            <InfoWindow
              position={{
                lat: latitude + selectedPanel.centerY * 0.00002,
                lng: longitude + selectedPanel.centerX * 0.00002,
              }}
              onCloseClick={() => setSelectedPanel(null)}
            >
              <div className="p-2 min-w-[180px]">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">
                  Panel Details
                </h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Orientation:</span>
                    <span className="font-medium">{selectedPanel.orientation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Segment:</span>
                    <span className="font-medium">{selectedPanel.segmentIndex + 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yearly Output:</span>
                    <span className="font-medium text-green-600">
                      {selectedPanel.yearlyEnergyDcKwh.toFixed(0)} kWh
                    </span>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Legend */}
        <div className="px-4 py-3 border-t border-[var(--brand-border)] flex flex-wrap items-center gap-4 text-xs text-[var(--brand-text-secondary)]">
          <span className="font-medium text-[var(--brand-text)]">Energy Output:</span>
          {ENERGY_COLORS.map((ec, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ec.color }} />
              <span>{ec.threshold}+ kWh</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
