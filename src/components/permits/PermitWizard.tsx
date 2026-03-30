'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { DocumentType } from '@/types/permit'
import {
  usePermit,
  usePermitChecklist,
  usePermitTemplates,
  generatePermitDocument,
  reviewPermitDocument,
  updatePermitPackage,
} from '@/hooks/usePermits'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'

interface PermitWizardProps {
  permitId: string
  dealId: string
}

export function PermitWizard({ permitId, dealId }: PermitWizardProps) {
  const t = useTranslations('permitWizard')
  const router = useRouter()
  const { permit, loading: permitLoading, error: permitError, refetch } = usePermit(permitId)
  const { checklist, loading: checklistLoading } = usePermitChecklist(permitId)
  const { templates } = usePermitTemplates(permit?.authority, permit?.permitType)

  const [currentStep, setCurrentStep] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [modalContent] = useState<React.ReactNode>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const steps = [
    { id: 'overview', title: t('step1'), titleEn: 'Overview' },
    { id: 'documents', title: t('step2'), titleEn: 'Documents' },
    { id: 'review', title: t('step3'), titleEn: 'Review' },
    { id: 'submit', title: t('step4'), titleEn: 'Submit' },
  ]

  const handleGenerateDocument = async (documentType: DocumentType) => {
    try {
      const template = templates?.find((t) => t.documentType === documentType)
      if (!template) {
        throw new Error('Template not found')
      }

      const data = getDocumentData(documentType)
      await generatePermitDocument(permitId, {
        templateId: template.templateId,
        documentType,
        title: template.name,
        dataJson: data as Record<string, unknown>,
      })

      showToast('success', t('success'))
      refetch()
    } catch {
      showToast('error', t('error'))
    }
  }

  const getDocumentData = (documentType: DocumentType): Record<string, unknown> => {
    const generationDate = new Date().toISOString()

    switch (documentType) {
      case 'application_form':
        return {
          customerName: 'John Doe',
          customerAddress: '123 Solar Street, Bangkok',
          customerPhone: '081-234-5678',
          customerEmail: 'john@example.com',
          customerTaxId: '1234567890123',
          installationAddress: '123 Solar Street, Bangkok',
          gpsCoordinates: '13.7563, 100.5018',
          meaDistrict: permit?.authority === 'mea' ? 'Bangkok' : undefined,
          peaBranch: permit?.authority === 'pea' ? 'Bangkok' : undefined,
          systemSize: 10,
          panelCount: 22,
          panelBrand: 'JA Solar',
          panelModel: 'JAM72S30-450/MR',
          panelPower: 450,
          inverterCount: 1,
          inverterBrand: 'SMA',
          inverterModel: 'Sunny Tripower 10000TL-10',
          inverterPower: 10,
          installationType: 'Roof-mounted',
          usageType: permit?.permitType,
          contractorName: 'SolarPlus Co., Ltd.',
          contractorLicense: '12345/2566',
          contractorPhone: '02-111-2222',
          contractorEmail: 'info@solarplus.com',
          attachedDocuments: [],
          generationDate,
        } as Record<string, unknown>

      case 'sld':
        return {
          customerName: 'John Doe',
          installationAddress: '123 Solar Street, Bangkok',
          meaDistrict: permit?.authority === 'mea' ? 'Bangkok' : undefined,
          peaBranch: permit?.authority === 'pea' ? 'Bangkok' : undefined,
          systemSize: 10,
          panelCount: 22,
          panelPower: 450,
          panelBrand: 'JA Solar',
          panelModel: 'JAM72S30-450/MR',
          inverterCount: 1,
          inverterBrand: 'SMA',
          inverterModel: 'Sunny Tripower 10000TL-10',
          inverterPower: 10,
          meterType: 'Bi-directional',
          meterBrand: 'Schneider Electric',
          meterModel: 'PM8000',
          mdbType: 'Main Distribution Board',
          connectionType:
            permit?.permitType === 'net_metering' ? 'Net Metering' : 'Self-Consumption',
          voltage: '220V/380V',
          frequency: '50Hz',
          phase: '3-Phase',
          cableSize: '16mm²',
          cableType: 'XLPE',
          surgeProtection: 'Installed',
          protectionRelay: 'Installed',
          emergencySwitch: 'Installed',
          warningSigns: 'Installed',
          grounding: 'Installed',
          generationDate,
        } as Record<string, unknown>

      case 'equipment_specs':
        return {
          customerName: 'John Doe',
          installationAddress: '123 Solar Street, Bangkok',
          systemSize: 10,
          panelBrand: 'JA Solar',
          panelModel: 'JAM72S30-450/MR',
          panelPower: 450,
          panelEfficiency: 20.8,
          panelDimensions: '2278 x 1134 x 35 mm',
          panelWeight: 28.5,
          panelCount: 22,
          panelTotalPower: 9.9,
          panelWarranty: '25 years',
          inverterBrand: 'SMA',
          inverterModel: 'Sunny Tripower 10000TL-10',
          inverterPower: 10,
          inverterInputVoltage: '320-800V',
          inverterOutputVoltage: '220/380V',
          inverterFrequency: '50Hz',
          inverterEfficiency: 98.0,
          inverterMppt: '2',
          inverterCount: 1,
          inverterTotalPower: 10,
          inverterWarranty: '10 years',
          meterBrand: 'Schneider Electric',
          meterModel: 'PM8000',
          meterType: 'Bi-directional',
          meterAccuracy: '0.2S',
          meterCommunication: 'Modbus, Ethernet',
          relayBrand: 'Siemens',
          relayModel: '7SJ63',
          relayType: 'Protection Relay',
          relayProtection: 'Overcurrent, Overvoltage, Undervoltage, Frequency',
          relayCount: 1,
          dcCableSize: '6mm²',
          dcCableType: 'PV Cable',
          acCableSize: '16mm²',
          acCableType: 'XLPE',
          groundingCableSize: '16mm²',
          mountingStructure: 'Aluminum',
          clampsType: 'Stainless Steel',
          junctionBoxType: 'IP65',
          generationDate,
        } as Record<string, unknown>

      case 'engineer_cert':
        return {
          customerName: 'John Doe',
          installationAddress: '123 Solar Street, Bangkok',
          meaDistrict: permit?.authority === 'mea' ? 'Bangkok' : undefined,
          peaBranch: permit?.authority === 'pea' ? 'Bangkok' : undefined,
          systemSize: 10,
          engineerName: 'Eng. Somchai S.',
          engineerLicense: '12345/2560',
          engineerField: 'Electrical Engineering',
          engineerOrganization: 'SolarPlus Engineering',
          engineerPhone: '081-234-5678',
          engineerEmail: 'engineer@solarplus.com',
          inspectionDate: '2026-03-25',
          observations: 'All equipment installed according to standards',
          recommendations: 'None',
          panelBrand: 'JA Solar',
          panelModel: 'JAM72S30-450/MR',
          panelCount: 22,
          inverterBrand: 'SMA',
          inverterModel: 'Sunny Tripower 10000TL-10',
          inverterCount: 1,
          meterBrand: 'Schneider Electric',
          meterModel: 'PM8000',
          generationDate,
        } as Record<string, unknown>

      case 'property_proof':
        return {
          customerName: 'John Doe',
          customerId: '1234567890123',
          customerTaxId: '1234567890123',
          customerPhone: '081-234-5678',
          customerEmail: 'john@example.com',
          installationAddress: '123 Solar Street, Bangkok',
          gpsCoordinates: '13.7563, 100.5018',
          meaDistrict: permit?.authority === 'mea' ? 'Bangkok' : undefined,
          peaBranch: permit?.authority === 'pea' ? 'Bangkok' : undefined,
          propertyType: 'Residential',
          titleDeedNumber: '12345',
          province: 'Bangkok',
          district: 'Bangkok',
          subdistrict: 'Bangkok',
          landArea: '100 sq.wa',
          ownershipDocuments: [],
          documentType: 'Title Deed',
          documentNumber: '12345',
          issueDate: '2020-01-01',
          issuingAuthority: 'Land Department',
          ownerName: 'John Doe',
          relationship: 'Owner',
          contractorName: 'SolarPlus Co., Ltd.',
          contractorLicense: '12345/2566',
          contractorPhone: '02-111-2222',
          contractorEmail: 'info@solarplus.com',
          attachedDocuments: [],
          generationDate,
        } as Record<string, unknown>

      default:
        return { generationDate }
    }
  }

  const handleReviewDocument = async (documentId: string, status: 'approved' | 'reviewed') => {
    try {
      await reviewPermitDocument(permitId, documentId, {
        status,
        reviewNotes: '',
      })
      showToast('success', t('success'))
      refetch()
    } catch {
      showToast('error', t('error'))
    }
  }

  const handleSubmit = async () => {
    try {
      await updatePermitPackage(permitId, { status: 'submitted' })
      showToast('success', t('success'))
      router.push(`/deals/${dealId}`)
    } catch {
      showToast('error', t('error'))
    }
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'bg-blue-500/10 text-blue-800'
      case 'reviewed':
        return 'bg-yellow-500/10 text-yellow-600'
      case 'approved':
        return 'bg-green-500/10 text-green-800'
      default:
        return 'bg-[var(--brand-background)] text-[var(--brand-text)]'
    }
  }

  const getDocumentStatusText = (status: string) => {
    switch (status) {
      case 'generated':
        return t('uploadDocuments')
      case 'reviewed':
        return t('reviewTitle')
      case 'approved':
        return t('confirmSubmit')
      default:
        return t('requiredDocs')
    }
  }

  if (permitLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (permitError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 text-red-600">
          <p>
            {t('errorDesc')}: {permitError}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--brand-text)] mb-2">{t('title')}</h1>
        <p className="text-[var(--brand-text-secondary)]">
          Solar Installation Permit - {permit?.authority.toUpperCase()} - {permit?.permitType}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-[var(--brand-border)] text-[var(--brand-text-secondary)]'
                }`}
              >
                {index + 1}
              </div>
              <div className="ml-3">
                <p className="font-medium">{step.title}</p>
                <p className="text-sm text-[var(--brand-text-secondary)]">{step.titleEn}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-4 bg-[var(--brand-border)]">
                  <div
                    className={`h-full ${index < currentStep ? 'bg-blue-600' : 'bg-[var(--brand-border)]'}`}
                    style={{ width: index < currentStep ? '100%' : '0%' }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-6">
        {currentStep === 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('projectName')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[var(--brand-text-secondary)]">{t('step')}:</p>
                <p className="font-medium">{permit?.status}</p>
              </div>
              <div>
                <p className="text-[var(--brand-text-secondary)]">{t('authorityType')}:</p>
                <p className="font-medium">{permit?.authority.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-[var(--brand-text-secondary)]">{t('systemSize')}:</p>
                <p className="font-medium">{permit?.permitType}</p>
              </div>
              <div>
                <p className="text-[var(--brand-text-secondary)]">{t('submit')}:</p>
                <p className="font-medium">
                  {permit?.submissionDeadline
                    ? new Date(permit.submissionDeadline).toLocaleDateString('th-TH')
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('requiredDocs')}</h2>
            {checklistLoading ? (
              <p>{t('uploadDocuments')}...</p>
            ) : (
              <div className="space-y-4">
                {checklist?.map((item) => (
                  <div
                    key={item.documentType}
                    className="flex items-center justify-between p-4 border rounded"
                  >
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-[var(--brand-text-secondary)]">
                        {item.required ? t('requiredDocs') : t('uploadDocuments')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {item.documentId ? (
                        <>
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${getDocumentStatusColor(item.status)}`}
                          >
                            {getDocumentStatusText(item.status)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const doc = permit?.documents.find((d) => d.id === item.documentId)
                              if (doc?.pdfUrl) {
                                window.open(doc.pdfUrl, '_blank')
                              }
                            }}
                          >
                            {t('architecturalPlan')}
                          </Button>
                          {item.status !== 'approved' && (
                            <Button
                              size="sm"
                              onClick={() =>
                                item.documentId && handleReviewDocument(item.documentId, 'approved')
                              }
                            >
                              {t('confirmSubmit')}
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button size="sm" onClick={() => handleGenerateDocument(item.documentType)}>
                          {t('uploadDocuments')}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('reviewTitle')}</h2>
            <div className="space-y-4">
              {permit?.documents.map((doc) => (
                <div key={doc.id} className="p-4 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{doc.title}</p>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getDocumentStatusColor(doc.status)}`}
                    >
                      {getDocumentStatusText(doc.status)}
                    </span>
                  </div>
                  {doc.reviewNotes && (
                    <p className="text-sm text-[var(--brand-text-secondary)] mb-2">
                      {doc.reviewNotes}
                    </p>
                  )}
                  {doc.pdfUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => doc.pdfUrl && window.open(doc.pdfUrl ?? undefined, '_blank')}
                    >
                      {t('architecturalPlan')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('submit')}</h2>
            <div className="space-y-4">
              <p className="text-[var(--brand-text-secondary)]">{t('confirmSubmit')}</p>
              <div className="p-4 bg-blue-500/10 rounded">
                <p className="font-medium mb-2">{t('reviewTitle')}:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    {t('authorityType')}: {permit?.authority.toUpperCase()}
                  </li>
                  <li>
                    {t('systemSize')}: {permit?.permitType}
                  </li>
                  <li>
                    {t('requiredDocs')}: {permit?.documents.length}
                  </li>
                  <li>
                    {t('submit')}:{' '}
                    {permit?.submissionDeadline
                      ? new Date(permit.submissionDeadline).toLocaleDateString('th-TH')
                      : '-'}
                  </li>
                </ul>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {t('submit')}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          {t('back')}
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
        >
          {t('next')}
        </Button>
      </div>

      {/* Toast */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Modal */}
      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          {modalContent}
        </Modal>
      )}
    </div>
  )
}
