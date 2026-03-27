// Permit types for WK-112: Automated Permitting Engine (MEA/PEA)

export type PermitAuthority = 'mea' | 'pea'

export type PermitType = 'self_consumption' | 'net_metering' | 'commercial'

export type PermitStatus = 'draft' | 'review' | 'submitted' | 'approved' | 'rejected' | 'expired'

export type DocumentStatus = 'pending' | 'generated' | 'reviewed' | 'approved'

export type EquipmentType = 'inverter' | 'panel' | 'relay' | 'meter'

// Permit Document types
export type DocumentType =
  | 'application_form'
  | 'sld'
  | 'equipment_specs'
  | 'engineer_cert'
  | 'property_proof'
  | 'grid_connection'
  | 'protection_relay'
  | 'meter_installation'

// Permit Package
export interface PermitPackage {
  id: string
  dealId: string
  orgId: string
  authority: PermitAuthority
  permitType: PermitType
  status: PermitStatus
  submittedAt: string | null
  approvedAt: string | null
  rejectionReason: string | null
  submissionDeadline: string | null
  metadata: Record<string, unknown>
  documents: PermitDocument[]
  createdAt: string
  updatedAt: string
}

// Permit Document
export interface PermitDocument {
  id: string
  packageId: string
  templateId: string
  documentType: DocumentType
  title: string
  dataJson: Record<string, unknown>
  pdfUrl: string | null
  status: DocumentStatus
  reviewedBy: string | null
  reviewedAt: string | null
  reviewNotes: string | null
  createdAt: string
  updatedAt: string
}

// Approved Equipment
export interface ApprovedEquipment {
  id: string
  equipmentType: EquipmentType
  brand: string
  model: string
  authority: PermitAuthority
  approvedUntil: string | null
  specifications: Record<string, unknown>
  powerRating: number | null
  efficiency: number | null
  voltageRating: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Permit Template
export interface PermitTemplate {
  templateId: string
  name: string
  authority: PermitAuthority
  permitType: PermitType
  documentType: DocumentType
  description: string
  requiredFields: string[]
}

// Permit Checklist
export interface PermitChecklist {
  documentType: DocumentType
  title: string
  required: boolean
  status: string
  documentId: string | null
}

// Permit Statistics
export interface PermitStats {
  totalPackages: number
  byStatus: Record<string, number>
  byAuthority: Record<string, number>
  byType: Record<string, number>
  pendingReview: number
  submittedThisMonth: number
}

// Request types
export interface PermitPackageCreate {
  dealId: string
  authority: PermitAuthority
  permitType: PermitType
}

export interface PermitPackageUpdate {
  status?: PermitStatus
  rejectionReason?: string
}

export interface PermitDocumentGenerate {
  templateId: string
  documentType: DocumentType
  title: string
  dataJson: Record<string, unknown>
}

export interface PermitDocumentReview {
  status: DocumentStatus
  reviewNotes?: string
}

export interface ApprovedEquipmentSearch {
  equipmentType?: EquipmentType
  authority?: PermitAuthority
  brand?: string
  minPower?: number
  maxPower?: number
}

export interface ApprovedEquipmentCreate {
  equipmentType: EquipmentType
  brand: string
  model: string
  authority: PermitAuthority
  approvedUntil?: string
  specifications: Record<string, unknown>
  powerRating?: number
  efficiency?: number
  voltageRating?: string
}

// Document data templates
export interface ApplicationFormData {
  customerName: string
  customerAddress: string
  customerPhone: string
  customerEmail: string
  customerTaxId: string
  installationAddress: string
  gpsCoordinates: string
  meaDistrict?: string
  peaBranch?: string
  systemSize: number
  panelCount: number
  panelBrand: string
  panelModel: string
  panelPower: number
  inverterCount: number
  inverterBrand: string
  inverterModel: string
  inverterPower: number
  installationType: string
  usageType: string
  contractorName: string
  contractorLicense: string
  contractorPhone: string
  contractorEmail: string
  attachedDocuments: Array<{
    name: string
    status: string
  }>
  generationDate: string
}

export interface SLDData {
  customerName: string
  installationAddress: string
  meaDistrict?: string
  peaBranch?: string
  systemSize: number
  panelCount: number
  panelPower: number
  panelBrand: string
  panelModel: string
  inverterCount: number
  inverterBrand: string
  inverterModel: string
  inverterPower: number
  meterType: string
  meterBrand: string
  meterModel: string
  mdbType: string
  connectionType: string
  voltage: string
  frequency: string
  phase: string
  cableSize: string
  cableType: string
  surgeProtection: string
  protectionRelay: string
  emergencySwitch: string
  warningSigns: string
  grounding: string
  generationDate: string
}

export interface EquipmentSpecsData {
  customerName: string
  installationAddress: string
  systemSize: number
  panelBrand: string
  panelModel: string
  panelPower: number
  panelEfficiency: number
  panelDimensions: string
  panelWeight: number
  panelCount: number
  panelTotalPower: number
  panelWarranty: string
  inverterBrand: string
  inverterModel: string
  inverterPower: number
  inverterInputVoltage: string
  inverterOutputVoltage: string
  inverterFrequency: string
  inverterEfficiency: number
  inverterMppt: string
  inverterCount: number
  inverterTotalPower: number
  inverterWarranty: string
  meterBrand: string
  meterModel: string
  meterType: string
  meterAccuracy: string
  meterCommunication: string
  relayBrand: string
  relayModel: string
  relayType: string
  relayProtection: string
  relayCount: number
  dcCableSize: string
  dcCableType: string
  acCableSize: string
  acCableType: string
  groundingCableSize: string
  mountingStructure: string
  clampsType: string
  junctionBoxType: string
  generationDate: string
}

export interface EngineerCertData {
  customerName: string
  installationAddress: string
  meaDistrict?: string
  peaBranch?: string
  systemSize: number
  engineerName: string
  engineerLicense: string
  engineerField: string
  engineerOrganization: string
  engineerPhone: string
  engineerEmail: string
  inspectionDate: string
  observations: string
  recommendations: string
  panelBrand: string
  panelModel: string
  panelCount: number
  inverterBrand: string
  inverterModel: string
  inverterCount: number
  meterBrand: string
  meterModel: string
  generationDate: string
}

export interface PropertyProofData {
  customerName: string
  customerId: string
  customerTaxId: string
  customerPhone: string
  customerEmail: string
  installationAddress: string
  gpsCoordinates: string
  meaDistrict?: string
  peaBranch?: string
  propertyType: string
  titleDeedNumber: string
  province: string
  district: string
  subdistrict: string
  landArea: string
  ownershipDocuments: Array<{
    type: string
    number: string
    date: string
  }>
  documentType: string
  documentNumber: string
  issueDate: string
  issuingAuthority: string
  ownerName: string
  relationship: string
  contractorName: string
  contractorLicense: string
  contractorPhone: string
  contractorEmail: string
  attachedDocuments: Array<{
    name: string
    status: string
  }>
  generationDate: string
}
