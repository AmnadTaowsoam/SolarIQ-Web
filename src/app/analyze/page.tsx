'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context'
import { AppLayout } from '@/components/layout'
import { Card, CardHeader, CardBody, Button, Input } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { useSolarAnalysis } from '@/hooks'
import { ROUTES, DEFAULT_MAP_CENTER } from '@/lib/constants'
import { SolarAnalysisResult } from '@/types'

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Solar Report Component
function SolarReport({ result }: { result: SolarAnalysisResult }) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4 text-center">
            <div className="text-sm text-gray-500">Recommended System</div>
            <div className="text-2xl font-bold text-primary-600 mt-1">
              {result.panelConfig.capacityKw.toFixed(2)} kWp
            </div>
            <div className="text-sm text-gray-500">
              {result.panelConfig.panelsCount} panels
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 text-center">
            <div className="text-sm text-gray-500">Yearly Production</div>
            <div className="text-2xl font-bold text-secondary-600 mt-1">
              {result.panelConfig.yearlyEnergyDcKwh.toLocaleString()} kWh
            </div>
            <div className="text-sm text-gray-500">per year</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 text-center">
            <div className="text-sm text-gray-500">Payback Period</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {result.financialAnalysis.paybackYears.toFixed(1)} years
            </div>
            <div className="text-sm text-gray-500">ROI: {result.financialAnalysis.roi25Year.toFixed(1)}%
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Financial Analysis */}
      <Card>
        <CardHeader title="Financial Analysis" />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Installation Cost</div>
              <div className="text-lg font-semibold">
                {formatCurrency(result.financialAnalysis.installationCost)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Net Cost (after incentives)</div>
              <div className="text-lg font-semibold">
                {formatCurrency(result.financialAnalysis.netCost)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Monthly Savings</div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(result.financialAnalysis.monthlySavings)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Yearly Savings</div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(result.financialAnalysis.yearlySavings)}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Solar Potential */}
      <Card>
        <CardHeader title="Solar Potential" />
        <CardBody>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Max Sunshine Hours/Year</div>
              <div className="text-lg font-semibold">
                {result.solarPotential.maxSunshineHoursPerYear} hours
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Carbon Offset Factor</div>
              <div className="text-lg font-semibold">
                {result.solarPotential.carbonOffsetFactorKgPerMwh} kg/MWh
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Electricity Rate Used</div>
              <div className="text-lg font-semibold">
                ฿{result.electricityRate.toFixed(2)}/kWh
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Location</div>
              <div className="text-lg font-semibold">
                {result.coordinates.latitude.toFixed(4)}, {result.coordinates.longitude.toFixed(4)}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader title="Location" />
        <CardBody>
          <p className="text-gray-700">{result.address}</p>
        </CardBody>
      </Card>
    </div>
  )
}

export default function AnalyzePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { addToast } = useToast()

  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [address, setAddress] = useState('')
  const [monthlyBill, setMonthlyBill] = useState('')
  const [result, setResult] = useState<SolarAnalysisResult | null>(null)

  const analysisMutation = useSolarAnalysis()

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN)
    }
  }, [user, authLoading, router])

  const handleAnalyze = async () => {
    // Validation
    if (!latitude || !longitude || !monthlyBill) {
      addToast('error', 'Please fill in all required fields')
      return
    }

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    const bill = parseFloat(monthlyBill)

    if (isNaN(lat) || lat < -90 || lat > 90) {
      addToast('error', 'Invalid latitude (must be between -90 and 90)')
      return
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      addToast('error', 'Invalid longitude (must be between -180 and 180)')
      return
    }

    if (isNaN(bill) || bill <= 0) {
      addToast('error', 'Monthly bill must be a positive number')
      return
    }

    const sanitizedAddress = address ? address.replace(/[^\w\s,.\u0E00-\u0E7F-]/gi, '').trim() : undefined;

    try {
      const response = await analysisMutation.mutateAsync({
        latitude: lat,
        longitude: lng,
        monthlyBill: bill,
        address: sanitizedAddress,
      })
      setResult(response)
      addToast('success', 'Solar analysis completed successfully!')
    } catch (error) {
      addToast('error', 'Failed to perform solar analysis. Please try again.')
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      addToast('error', 'Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6))
        setLongitude(position.coords.longitude.toFixed(6))
        addToast('success', 'Location retrieved successfully')
      },
      (_error) => {
        addToast('error', 'Failed to get your location. Please enter manually.')
      }
    )
  }

  const useDefaultLocation = () => {
    setLatitude(DEFAULT_MAP_CENTER.lat.toString())
    setLongitude(DEFAULT_MAP_CENTER.lng.toString())
    setAddress('Bangkok, Thailand')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solar Analysis</h1>
          <p className="text-gray-500 mt-1">
            Analyze solar potential and calculate ROI for any location
          </p>
        </div>

        {/* Input Form */}
        <Card>
          <CardHeader title="Location & Bill Information" />
          <CardBody>
            <div className="space-y-4">
              {/* Quick actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={useCurrentLocation}>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Use My Location
                </Button>
                <Button variant="outline" size="sm" onClick={useDefaultLocation}>
                  Use Bangkok (Default)
                </Button>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g., 13.7563"
                  hint="Enter latitude (-90 to 90)"
                />
                <Input
                  label="Longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g., 100.5018"
                  hint="Enter longitude (-180 to 180)"
                />
              </div>

              {/* Address */}
              <Input
                label="Address (Optional)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 123 Sukhumvit Rd, Bangkok"
              />

              {/* Monthly Bill */}
              <Input
                label="Monthly Electricity Bill (THB)"
                type="number"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(e.target.value)}
                placeholder="e.g., 5000"
                hint="Enter your average monthly electricity bill in Thai Baht"
              />

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  onClick={handleAnalyze}
                  isLoading={analysisMutation.isPending}
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Analyze Solar Potential
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Results */}
        {result && <SolarReport result={result} />}
      </div>
    </AppLayout>
  )
}
