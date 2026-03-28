/**
 * LIFF Map Picker Page
 * Allows users to select their home location for solar analysis
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { useLIFF, useLIFFUser } from '../../../context/LIFFContext'
import { sendLocationMessage, closeWindow } from '../../../lib/liff'
import { useTranslations } from 'next-intl'

interface LocationState {
  lat: number
  lng: number
  address: string
}

const mapContainerStyle = {
  width: '100%',
  height: '60vh',
}

const defaultCenter = {
  lat: 13.7563, // Bangkok
  lng: 100.5018,
}

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
}

export default function MapPickerPage(): React.ReactElement {
  const t = useTranslations('mapPickerPage')
  const { isInitialized, isLoading: liffLoading, error: liffError } = useLIFF()
  const user = useLIFFUser()

  const [location, setLocation] = useState<LocationState>({
    lat: defaultCenter.lat,
    lng: defaultCenter.lng,
    address: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { isLoaded: mapLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  })

  // Get current location on mount
  useEffect(() => {
    if (!mapLoaded) {
      return
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation((prev) => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }))
          setIsLoading(false)
        },
        () => {
          // Use default location if geolocation fails
          setIsLoading(false)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setIsLoading(false)
    }
  }, [mapLoaded])

  // Reverse geocode coordinates to address
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    if (!window.google?.maps) {
      return ''
    }

    try {
      const geocoder = new google.maps.Geocoder()
      const response = await geocoder.geocode({ location: { lat, lng } })

      if (response.results && response.results.length > 0) {
        return response.results[0]?.formatted_address || ''
      }
      return ''
    } catch {
      return ''
    }
  }, [])

  // Handle marker drag
  const handleMarkerDragEnd = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) {
        return
      }

      const lat = e.latLng.lat()
      const lng = e.latLng.lng()

      setLocation((prev) => ({ ...prev, lat, lng }))

      const address = await reverseGeocode(lat, lng)
      setLocation((prev) => ({ ...prev, address }))
    },
    [reverseGeocode]
  )

  // Handle map click
  const handleMapClick = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) {
        return
      }

      const lat = e.latLng.lat()
      const lng = e.latLng.lng()

      setLocation((prev) => ({ ...prev, lat, lng }))

      const address = await reverseGeocode(lat, lng)
      setLocation((prev) => ({ ...prev, address }))
    },
    [reverseGeocode]
  )

  // Submit location to chat
  const handleSubmit = async () => {
    if (!location.address) {
      setError(t('pleaseSelectLocation'))
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await sendLocationMessage(t('myHomeLocation'), location.address, location.lat, location.lng)

      // Close LIFF after sending
      setTimeout(() => {
        closeWindow()
      }, 1000)
    } catch {
      setError(t('errors.submitError'))
      setIsSubmitting(false)
    }
  }

  // Loading states
  if (liffLoading || !isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  // Error states
  if (liffError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-red-600 mb-2">{t('errors.locationError')}</h1>
          <p className="text-red-500">{liffError.message}</p>
        </div>
      </div>
    )
  }

  if (loadError || !mapLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <h1 className="text-xl font-bold text-red-600 mb-2">{t('errors.geocodeError')}</h1>
          <p className="text-red-500">{t('checkInternetConnection')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold text-center">📍 {t('title')}</h1>
        <p className="text-green-100 text-sm text-center mt-1">{t('subtitle')}</p>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={{ lat: location.lat, lng: location.lng }}
          zoom={16}
          options={mapOptions}
          onClick={handleMapClick}
        >
          <Marker
            position={{ lat: location.lat, lng: location.lng }}
            draggable
            onDragEnd={handleMarkerDragEnd}
            icon={{
              url: '/marker-home.png',
              scaledSize: new google.maps.Size(48, 48),
              anchor: new google.maps.Point(24, 48),
            }}
          />
        </GoogleMap>
      </div>

      {/* Address Display */}
      <div className="bg-white border-t p-4">
        {location.address ? (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">{t('address')}:</p>
            <p className="text-gray-800 font-medium">{location.address}</p>
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-gray-400 text-center">{t('selectOnMap')}</p>
          </div>
        )}

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!location.address || isSubmitting}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            location.address && !isSubmitting
              ? 'bg-green-600 text-white hover:bg-green-700 active:scale-98'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {t('confirming')}
            </span>
          ) : (
            `✓ ${t('confirm')}`
          )}
        </button>
      </div>

      {/* User info */}
      {user && (
        <div className="fixed top-16 right-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow text-xs text-gray-600">
          {user.displayName}
        </div>
      )}
    </div>
  )
}
