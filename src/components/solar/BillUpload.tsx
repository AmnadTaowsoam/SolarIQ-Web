'use client'

import { useState, useRef } from 'react'
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useApi } from '@/lib/api'

/**
 * BillUpload Component
 *
 * Upload electricity bill image and extract structured data using LLM.
 *
 * WK-113: LLM Bill Analysis & Auto Data Extraction
 */

interface BillData {
  provider: 'PEA' | 'MEA' | 'UNKNOWN'
  customer_name?: string
  address?: string
  account_number?: string
  user_type?: string
  user_type_code?: string
  billing_period?: string
  total_kwh?: number
  total_amount_thb?: number
  peak_kwh?: number
  off_peak_kwh?: number
  rate_type?: 'TOU' | 'FLAT' | 'UNKNOWN'
  electricity_authority?: string
  ft_rate?: number
  confidence: number
}

interface ExtractionResult {
  success: boolean
  bill_data?: BillData
  cache_key?: string
  error_message?: string
}

interface BillUploadProps {
  onDataExtracted?: (data: BillData, cacheKey: string) => void
  onError?: (error: string) => void
}

export default function BillUpload({ onDataExtracted, onError }: BillUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [editedData, setEditedData] = useState<BillData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const api = useApi()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await processFile(files[0])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await processFile(files[0])
    }
  }

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError?.('Please upload an image file (JPEG, PNG, WEBP)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError?.('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    setExtractionResult(null)

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file)

      // Call API to extract bill data
      const response = await api.post<ExtractionResult>('/api/v1/bills/extract', {
        image_base64: base64,
        source: 'web',
      })

      setExtractionResult(response)

      if (response.success && response.bill_data && response.cache_key) {
        setShowConfirmation(true)
        setEditedData(response.bill_data)
      } else if (response.error_message) {
        onError?.(response.error_message)
      }
    } catch {
      onError?.('Failed to extract bill data. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleConfirm = async () => {
    if (!editedData || !extractionResult?.cache_key) {
      return
    }

    try {
      await api.post('/api/v1/bills/confirm', {
        bill_data: editedData,
        action: 'confirm',
      })

      onDataExtracted?.(editedData, extractionResult.cache_key)
      setShowConfirmation(false)
      setExtractionResult(null)
    } catch {
      // eslint-disable-next-line no-console

      onError?.('Failed to confirm bill data. Please try again.')
    }
  }

  const _handleEdit = () => {
    // Keep the confirmation open for editing
  }

  const handleCancel = () => {
    setShowConfirmation(false)
    setExtractionResult(null)
    setEditedData(null)
  }

  const handleReupload = () => {
    setShowConfirmation(false)
    setExtractionResult(null)
    setEditedData(null)
    fileInputRef.current?.click()
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) {
      return 'text-green-600'
    }
    if (confidence >= 0.6) {
      return 'text-yellow-600'
    }
    return 'text-red-600'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) {
      return 'High'
    }
    if (confidence >= 0.6) {
      return 'Medium'
    }
    return 'Low'
  }

  return (
    <div className="w-full">
      {!showConfirmation ? (
        <Card className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="text-gray-600">Analyzing bill with AI...</p>
                <p className="text-sm text-gray-500">This may take a few seconds</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Electricity Bill
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your PEA/MEA bill image here, or click to browse
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()} variant="primary">
                    Select File
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Supported formats: JPEG, PNG, WEBP</p>
                  <p>Maximum file size: 10MB</p>
                </div>
              </div>
            )}
          </div>

          {extractionResult && !extractionResult.success && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">Extraction Failed</h4>
                <p className="text-sm text-red-700">
                  {extractionResult.error_message ||
                    'Failed to extract data from the bill. Please try again with a clearer image.'}
                </p>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Bill Information</h3>
            <p className="text-sm text-gray-600">
              Please review the extracted information below and make any necessary corrections.
            </p>
          </div>

          {editedData && (
            <div className="space-y-4">
              {/* Confidence Score */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Extraction Confidence</span>
                  <span
                    className={`text-sm font-semibold ${getConfidenceColor(editedData.confidence)}`}
                  >
                    {getConfidenceLabel(editedData.confidence)} (
                    {Math.round(editedData.confidence * 100)}%)
                  </span>
                </div>
              </div>

              {/* Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Electricity Provider
                </label>
                <select
                  value={editedData.provider}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      provider: e.target.value as 'PEA' | 'MEA' | 'UNKNOWN',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PEA">PEA (Provincial Electricity Authority)</option>
                  <option value="MEA">MEA (Metropolitan Electricity Authority)</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={editedData.account_number || ''}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      account_number: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., CA-12345678"
                />
              </div>

              {/* Billing Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Period
                </label>
                <input
                  type="text"
                  value={editedData.billing_period || ''}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      billing_period: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 15 ก.พ. - 15 มี.ค. 2569"
                />
              </div>

              {/* Total kWh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Consumption (kWh)
                </label>
                <input
                  type="number"
                  value={editedData.total_kwh || ''}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      total_kwh: parseFloat(e.target.value) || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 450"
                />
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount (THB)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editedData.total_amount_thb || ''}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      total_amount_thb: parseFloat(e.target.value) || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2150.75"
                />
              </div>

              {/* TOU Data */}
              {(editedData.peak_kwh !== undefined || editedData.off_peak_kwh !== undefined) && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">TOU (Time of Use) Data</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Peak kWh
                      </label>
                      <input
                        type="number"
                        value={editedData.peak_kwh || ''}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            peak_kwh: parseFloat(e.target.value) || undefined,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Off-Peak kWh
                      </label>
                      <input
                        type="number"
                        value={editedData.off_peak_kwh || ''}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            off_peak_kwh: parseFloat(e.target.value) || undefined,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 250"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleConfirm}
                  variant="primary"
                  className="flex-1"
                  disabled={!editedData.total_kwh || !editedData.total_amount_thb}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm & Analyze
                </Button>
                <Button onClick={handleReupload} variant="secondary" className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Reupload
                </Button>
                <Button onClick={handleCancel} variant="ghost" className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
