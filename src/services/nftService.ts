import { supabase } from "@/integrations/supabase/client";
import type { 
  NftCertificate, 
  VerificationLog, 
  CreateNftCertificateInput, 
  CreateVerificationLogInput,
  NftAnalytics,
  UpdateAuthenticityScoreInput
} from "@/types/nft.types";

export class NFTService {
  /**
   * Create a new NFT certificate record
   */
  static async createCertificate(data: CreateNftCertificateInput): Promise<NftCertificate | null> {
    const { data: certificate, error } = await supabase
      .from('nft_certificates')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error creating NFT certificate:', error);
      throw error;
    }

    return certificate;
  }

  /**
   * Get certificate by product ID
   */
  static async getCertificateByProductId(productId: string): Promise<NftCertificate | null> {
    const { data, error } = await supabase
      .from('nft_certificates')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
      console.error('Error fetching certificate:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get certificate by token ID
   */
  static async getCertificateByTokenId(tokenId: number): Promise<NftCertificate | null> {
    const { data, error } = await supabase
      .from('nft_certificates')
      .select('*')
      .eq('token_id', tokenId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching certificate:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update certificate authenticity score
   */
  static async updateAuthenticityScore(input: UpdateAuthenticityScoreInput): Promise<void> {
    const { nft_certificate_id, new_score, reason, changed_by } = input;

    // Get current score
    const { data: current } = await supabase
      .from('nft_certificates')
      .select('authenticity_score')
      .eq('id', nft_certificate_id)
      .single();

    // Update certificate
    const { error: updateError } = await supabase
      .from('nft_certificates')
      .update({ authenticity_score: new_score })
      .eq('id', nft_certificate_id);

    if (updateError) {
      console.error('Error updating authenticity score:', updateError);
      throw updateError;
    }

    // Log history
    const { error: historyError } = await supabase
      .from('product_authenticity_history')
      .insert({
        nft_certificate_id,
        old_score: current?.authenticity_score,
        new_score,
        reason,
        changed_by
      });

    if (historyError) {
      console.error('Error logging authenticity history:', historyError);
    }
  }

  /**
   * Mark product as recalled
   */
  static async recallProduct(productId: string): Promise<void> {
    const { error } = await supabase
      .from('nft_certificates')
      .update({ is_recalled: true })
      .eq('product_id', productId);

    if (error) {
      console.error('Error recalling product:', error);
      throw error;
    }
  }

  /**
   * Create verification log
   */
  static async createVerificationLog(data: CreateVerificationLogInput): Promise<VerificationLog | null> {
    // First, try to find the certificate
    const certificate = await this.getCertificateByProductId(data.product_id);
    
    const logData = {
      ...data,
      nft_certificate_id: certificate?.id || null
    };

    const { data: log, error } = await supabase
      .from('verification_logs')
      .insert(logData)
      .select()
      .single();

    if (error) {
      console.error('Error creating verification log:', error);
      throw error;
    }

    return log;
  }

  /**
   * Get verification history for a product
   */
  static async getVerificationHistory(productId: string): Promise<VerificationLog[]> {
    const { data, error } = await supabase
      .from('verification_logs')
      .select('*')
      .eq('product_id', productId)
      .order('verified_at', { ascending: false });

    if (error) {
      console.error('Error fetching verification history:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get analytics data
   */
  static async getAnalytics(): Promise<NftAnalytics | null> {
    const { data, error } = await supabase
      .from('nft_analytics')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }

    return data;
  }

  /**
   * Verify product authenticity
   */
  static async verifyProduct(productId: string, imageUrls?: string[]): Promise<{
    isAuthentic: boolean;
    certificate: NftCertificate | null;
    message: string;
  }> {
    try {
      const certificate = await this.getCertificateByProductId(productId);

      if (!certificate) {
        // Log failed verification
        await this.createVerificationLog({
          product_id: productId,
          verification_method: 'manual_search',
          verification_status: 'failed',
          failure_reason: 'No certificate found',
          image_urls: imageUrls || []
        });

        return {
          isAuthentic: false,
          certificate: null,
          message: 'Product not found in database'
        };
      }

      if (certificate.is_recalled) {
        // Log recalled product verification
        await this.createVerificationLog({
          product_id: productId,
          verification_method: 'manual_search',
          verification_status: 'failed',
          failure_reason: 'Product has been recalled',
          is_authentic: false,
          image_urls: imageUrls || []
        });

        return {
          isAuthentic: false,
          certificate,
          message: 'This product has been recalled'
        };
      }

      const isAuthentic = (certificate.authenticity_score || 0) >= 70;

      // Log successful verification
      await this.createVerificationLog({
        product_id: productId,
        verification_method: 'manual_search',
        verification_status: 'success',
        is_authentic: isAuthentic,
        ai_score: certificate.authenticity_score,
        image_urls: imageUrls || []
      });

      return {
        isAuthentic,
        certificate,
        message: isAuthentic 
          ? `Product verified! Authenticity score: ${certificate.authenticity_score}%`
          : `Low authenticity score: ${certificate.authenticity_score}%`
      };

    } catch (error) {
      console.error('Error verifying product:', error);
      throw error;
    }
  }

  /**
   * Get recent certificates
   */
  static async getRecentCertificates(limit = 10): Promise<NftCertificate[]> {
    const { data, error } = await supabase
      .from('nft_certificates')
      .select('*')
      .order('minted_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent certificates:', error);
      throw error;
    }

    return data || [];
  }
}
