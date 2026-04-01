import apiClient from '@/lib/api'
import type {
  Brand,
  BrandCreate,
  BrandDomain,
  BrandDomainVerifyResponse,
  BrandListResponse,
  BrandUpdate,
  PublicBrand,
} from '@/types/branding'

const BRAND_API_BASE = '/api/v1/brands'
const PUBLIC_BRAND_API_BASE = '/api/v1/public/brand'

export async function listBrands(): Promise<BrandListResponse> {
  const response = await apiClient.get<BrandListResponse>(BRAND_API_BASE)
  return response.data
}

export async function createBrand(payload: BrandCreate): Promise<Brand> {
  const response = await apiClient.post<Brand>(BRAND_API_BASE, payload)
  return response.data
}

export async function updateBrand(brandId: string, payload: BrandUpdate): Promise<Brand> {
  const response = await apiClient.put<Brand>(`${BRAND_API_BASE}/${brandId}`, payload)
  return response.data
}

export async function deleteBrand(brandId: string): Promise<void> {
  await apiClient.delete(`${BRAND_API_BASE}/${brandId}`)
}

export async function setDefaultBrand(brandId: string): Promise<Brand> {
  const response = await apiClient.patch<Brand>(`${BRAND_API_BASE}/${brandId}/default`)
  return response.data
}

export async function addBrandDomain(brandId: string, domain: string): Promise<BrandDomain> {
  const response = await apiClient.post<BrandDomain>(`${BRAND_API_BASE}/${brandId}/domain`, {
    domain,
  })
  return response.data
}

export async function verifyBrandDomain(brandId: string): Promise<BrandDomainVerifyResponse> {
  const response = await apiClient.get<BrandDomainVerifyResponse>(
    `${BRAND_API_BASE}/${brandId}/domain/verify`
  )
  return response.data
}

export async function removeBrandDomain(brandId: string): Promise<void> {
  await apiClient.delete(`${BRAND_API_BASE}/${brandId}/domain`)
}

export async function fetchPublicBrand(domain: string): Promise<PublicBrand> {
  const response = await apiClient.get<PublicBrand>(`${PUBLIC_BRAND_API_BASE}/${domain}`)
  return response.data
}
