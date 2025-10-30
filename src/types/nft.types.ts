// NFT Certificate and Verification Types

export interface NftCertificate {
  id: string;
  product_id: string;
  token_id: number | null;
  contract_address: string;
  owner_address: string;
  metadata_uri: string | null;
  authenticity_score: number | null;
  qr_code: string;
  image_urls: string[];
  is_recalled: boolean;
  minted_at: string;
  updated_at: string;
  created_at: string;
}

export interface VerificationLog {
  id: string;
  product_id: string;
  nft_certificate_id: string | null;
  verification_method: 'qr_scan' | 'manual_search' | 'api' | 'nfc';
  ai_score: number | null;
  vision_api_response: Record<string, any> | null;
  image_urls: string[];
  user_ip: string | null;
  user_agent: string | null;
  location: Record<string, any> | null;
  is_authentic: boolean | null;
  verification_status: 'success' | 'failed' | 'pending';
  failure_reason: string | null;
  verified_at: string;
  created_at: string;
}

export interface ProductAuthenticityHistory {
  id: string;
  nft_certificate_id: string | null;
  old_score: number | null;
  new_score: number | null;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
}

export interface NftAnalytics {
  total_certificates: number;
  recalled_products: number;
  avg_authenticity_score: number;
  total_verifications: number;
  successful_verifications: number;
  failed_verifications: number;
}

// Input types for creating records
export interface CreateNftCertificateInput {
  product_id: string;
  token_id?: number;
  contract_address: string;
  owner_address: string;
  metadata_uri?: string;
  authenticity_score?: number;
  qr_code: string;
  image_urls?: string[];
}

export interface CreateVerificationLogInput {
  product_id: string;
  nft_certificate_id?: string;
  verification_method: 'qr_scan' | 'manual_search' | 'api' | 'nfc';
  ai_score?: number;
  vision_api_response?: Record<string, any>;
  image_urls?: string[];
  user_ip?: string;
  user_agent?: string;
  location?: Record<string, any>;
  is_authentic?: boolean;
  verification_status: 'success' | 'failed' | 'pending';
  failure_reason?: string;
}

export interface UpdateAuthenticityScoreInput {
  nft_certificate_id: string;
  new_score: number;
  reason?: string;
  changed_by?: string;
}
