export interface BrandLogo {
  light?: string | null
  dark?: string | null
  square?: string | null
}

export interface BrandFavicon {
  ico?: string | null
  png192?: string | null
  png512?: string | null
  appleTouchIcon?: string | null
}

export interface BrandColors {
  primary?: string | null
  secondary?: string | null
  accent?: string | null
  background?: string | null
  surface?: string | null
  sidebar?: string | null
  sidebarText?: string | null
  text?: string | null
  textSecondary?: string | null
  border?: string | null
  success?: string | null
  warning?: string | null
  error?: string | null
}

export interface BrandFonts {
  heading?: string | null
  body?: string | null
  mono?: string | null
}

export interface BrandDarkMode {
  enabled?: boolean
  colors?: BrandColors
}

export interface Brand {
  id: string
  org_id: string
  name: string
  company_name: string
  logo_light_url?: string | null
  logo_dark_url?: string | null
  logo_square_url?: string | null
  favicon_ico_url?: string | null
  favicon_png192_url?: string | null
  favicon_png512_url?: string | null
  favicon_apple_touch_url?: string | null
  colors: Record<string, string>
  dark_mode_enabled: boolean
  dark_mode_colors?: Record<string, string> | null
  fonts: Record<string, string>
  border_radius: number
  domain?: string | null
  proposal_template: string
  terms_and_conditions?: string | null
  contact_info?: Record<string, string> | null
  signature_image_url?: string | null
  email_sender_name?: string | null
  email_reply_to?: string | null
  email_domain?: string | null
  email_domain_verified: boolean
  liff_theme_color?: string | null
  rich_menu_image_url?: string | null
  welcome_message?: string | null
  is_default: boolean
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface BrandListResponse {
  brands: Brand[]
  default?: Brand | null
}

export interface BrandCreate {
  name: string
  company_name: string
  logo?: BrandLogo
  favicon?: BrandFavicon
  colors?: BrandColors
  dark_mode?: BrandDarkMode
  fonts?: BrandFonts
  border_radius?: number
  domain?: string
  proposal_template?: string
  terms_and_conditions?: string
  contact_info?: Record<string, string>
  signature_image_url?: string
  email_sender_name?: string
  email_reply_to?: string
  email_domain?: string
  liff_theme_color?: string
  rich_menu_image_url?: string
  welcome_message?: string
  is_default?: boolean
  active?: boolean
}

export type BrandUpdate = Partial<BrandCreate>

export interface BrandDomain {
  id: string
  brand_id: string
  domain: string
  domain_type: string
  dns_record_type: string
  dns_record_name: string
  dns_record_value: string
  dns_verified: boolean
  dns_verified_at?: string | null
  dns_last_checked_at?: string | null
  dns_check_count: number
  ssl_status: string
  ssl_provisioned_at?: string | null
  ssl_expires_at?: string | null
  ssl_auto_renew: boolean
  status: string
  created_at: string
  updated_at: string
}

export interface BrandDomainVerifyResponse {
  verified: boolean
  status: string
  ssl_status: string
  last_checked?: string | null
}

export interface PublicBrand {
  brand_id: string
  company_name: string
  logo: BrandLogo
  colors: Record<string, string>
  fonts: Record<string, string>
  favicon_url?: string | null
  font_link?: string | null
}
