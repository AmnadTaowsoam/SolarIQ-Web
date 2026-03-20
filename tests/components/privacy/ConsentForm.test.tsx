import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConsentForm } from '@/components/privacy/ConsentForm'
import { ConsentType, CONSENT_DESCRIPTIONS } from '@/types/privacy'

// Mock usePrivacy hook
const mockFetchConsentTypes = jest.fn()
const mockGrantConsents = jest.fn()

jest.mock('@/hooks/usePrivacy', () => ({
  usePrivacy: () => ({
    consentTypes: mockConsentTypes,
    fetchConsentTypes: mockFetchConsentTypes,
    grantConsents: mockGrantConsents,
    isLoadingConsent: false,
    consentError: mockConsentError,
  }),
}))

jest.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
}))

let mockConsentTypes: {
  required: Array<{ type: string; description: string; is_required: boolean }>
  optional: Array<{ type: string; description: string; is_required: boolean }>
} | null = null

let mockConsentError: string | null = null

describe('ConsentForm', () => {
  const defaultConsentTypes = {
    required: [
      { type: ConsentType.DATA_COLLECTION, description: 'Data collection consent', is_required: true },
      { type: ConsentType.BILL_ANALYSIS, description: 'Bill analysis consent', is_required: true },
      { type: ConsentType.LOCATION_DATA, description: 'Location data consent', is_required: true },
    ],
    optional: [
      { type: ConsentType.MARKETING, description: 'Marketing consent', is_required: false },
      { type: ConsentType.DATA_SHARING, description: 'Data sharing consent', is_required: false },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockConsentTypes = defaultConsentTypes
    mockConsentError = null
  })

  it('renders all consent types', () => {
    render(<ConsentForm />)

    // Required consents
    expect(
      screen.getByText(CONSENT_DESCRIPTIONS[ConsentType.DATA_COLLECTION])
    ).toBeInTheDocument()
    expect(
      screen.getByText(CONSENT_DESCRIPTIONS[ConsentType.BILL_ANALYSIS])
    ).toBeInTheDocument()
    expect(
      screen.getByText(CONSENT_DESCRIPTIONS[ConsentType.LOCATION_DATA])
    ).toBeInTheDocument()

    // Optional consents
    expect(
      screen.getByText(CONSENT_DESCRIPTIONS[ConsentType.MARKETING])
    ).toBeInTheDocument()
    expect(
      screen.getByText(CONSENT_DESCRIPTIONS[ConsentType.DATA_SHARING])
    ).toBeInTheDocument()
  })

  it('shows required consents section header', () => {
    render(<ConsentForm />)

    expect(screen.getByText(/ข้อมูลที่จำเป็นต้องเก็บ/)).toBeInTheDocument()
  })

  it('shows optional consents section header', () => {
    render(<ConsentForm />)

    expect(screen.getByText(/ข้อมูลเพิ่มเติม/)).toBeInTheDocument()
  })

  it('required consents are marked as required', () => {
    render(<ConsentForm />)

    const requiredTexts = screen.getAllByText('จำเป็นต้องยินยอม')
    expect(requiredTexts.length).toBe(3)
  })

  it('optional consents are marked as optional', () => {
    render(<ConsentForm />)

    const optionalTexts = screen.getAllByText('ไม่บังคับ')
    expect(optionalTexts.length).toBe(2)
  })

  it('optional consents are toggleable', () => {
    render(<ConsentForm />)

    const checkboxes = screen.getAllByRole('checkbox')
    // There should be 5 checkboxes total (3 required + 2 optional)
    expect(checkboxes.length).toBe(5)

    // Toggle an optional consent
    const marketingCheckbox = checkboxes[3] // 4th checkbox (first optional)
    expect(marketingCheckbox).not.toBeChecked()

    fireEvent.click(marketingCheckbox)
    expect(marketingCheckbox).toBeChecked()

    fireEvent.click(marketingCheckbox)
    expect(marketingCheckbox).not.toBeChecked()
  })

  it('submit button is disabled until all required consents are accepted', () => {
    render(<ConsentForm />)

    const submitButton = screen.getByRole('button', { name: /ยินยอมและดำเนินการต่อ/ })
    expect(submitButton).toBeDisabled()

    // Accept all required consents
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0]) // data_collection
    fireEvent.click(checkboxes[1]) // bill_analysis
    fireEvent.click(checkboxes[2]) // location_data

    expect(submitButton).toBeEnabled()
  })

  it('submit calls handler with consent data', async () => {
    mockGrantConsents.mockResolvedValueOnce(undefined)
    const mockOnComplete = jest.fn()

    render(<ConsentForm onComplete={mockOnComplete} />)

    // Accept all required consents
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])
    fireEvent.click(checkboxes[2])

    // Also accept marketing
    fireEvent.click(checkboxes[3])

    // Submit form
    const submitButton = screen.getByRole('button', { name: /ยินยอมและดำเนินการต่อ/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockGrantConsents).toHaveBeenCalledWith({
        consents: expect.arrayContaining([
          expect.objectContaining({ consent_type: ConsentType.DATA_COLLECTION, granted: true }),
          expect.objectContaining({ consent_type: ConsentType.BILL_ANALYSIS, granted: true }),
          expect.objectContaining({ consent_type: ConsentType.LOCATION_DATA, granted: true }),
          expect.objectContaining({ consent_type: ConsentType.MARKETING, granted: true }),
          expect.objectContaining({ consent_type: ConsentType.DATA_SHARING, granted: false }),
        ]),
      })
    })

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled()
    })
  })

  it('shows loading spinner when consentTypes is null', () => {
    mockConsentTypes = null

    const { container } = render(<ConsentForm />)

    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('shows error message when consentError is set', () => {
    mockConsentError = 'Failed to load consents'

    render(<ConsentForm />)

    expect(screen.getByText('Failed to load consents')).toBeInTheDocument()
  })

  it('shows warning when required consents are not all accepted', () => {
    render(<ConsentForm />)

    expect(
      screen.getByText('กรุณายินยอมให้เก็บข้อมูลที่จำเป็นทั้งหมด')
    ).toBeInTheDocument()
  })

  it('hides optional consents when showRequiredOnly is true', () => {
    render(<ConsentForm showRequiredOnly />)

    expect(screen.queryByText(/ข้อมูลเพิ่มเติม/)).not.toBeInTheDocument()
    expect(
      screen.queryByText(CONSENT_DESCRIPTIONS[ConsentType.MARKETING])
    ).not.toBeInTheDocument()
  })

  it('fetches consent types on mount', () => {
    render(<ConsentForm />)

    expect(mockFetchConsentTypes).toHaveBeenCalled()
  })

  it('shows privacy policy link', () => {
    render(<ConsentForm />)

    const link = screen.getByText('นโยบายความเป็นส่วนตัว')
    expect(link).toHaveAttribute('href', '/privacy')
  })
})
