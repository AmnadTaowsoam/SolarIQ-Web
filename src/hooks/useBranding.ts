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

export async function listBrands(): Promise<BrandListResponse> {
  const response = await apiClient.get<BrandListResponse>('/brands')
  return response.data
}

export async function createBrand(payload: BrandCreate): Promise<Brand> {
  const response = await apiClient.post<Brand>('/brands', payload)
  return response.data
}

export async function updateBrand(brandId: string, payload: BrandUpdate): Promise<Brand> {
  const response = await apiClient.put<Brand>(`/brands/${brandId}`, payload)
  return response.data
}

export async function deleteBrand(brandId: string): Promise<void> {
  await apiClient.delete(`/brands/${brandId}`)
}

export async function setDefaultBrand(brandId: string): Promise<Brand> {
  const response = await apiClient.patch<Brand>(`/brands/${brandId}/default`)
  return response.data
}

export async function addBrandDomain(brandId: string, domain: string): Promise<BrandDomain> {
  const response = await apiClient.post<BrandDomain>(`/brands/${brandId}/domain`, { domain })
  return response.data
}

export async function verifyBrandDomain(brandId: string): Promise<BrandDomainVerifyResponse> {
  const response = await apiClient.get<BrandDomainVerifyResponse>(`/brands/${brandId}/domain/verify`)
  return response.data
}

export async function removeBrandDomain(brandId: string): Promise<void> {
  await apiClient.delete(`/brands/${brandId}/domain`)
}

export async function fetchPublicBrand(domain: string): Promise<PublicBrand> {
  const response = await apiClient.get<PublicBrand>(`/public/brand/${domain}`)
  return response.data
}
