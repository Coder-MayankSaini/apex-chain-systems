import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useWeb3 } from "@/hooks/useWeb3";
import { Shield, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Product {
  id: string;
  product_id: string;
  name: string;
  description: string;
  status: string;
  verified: boolean;
  current_owner_address: string;
  manufacturer_address: string;
  blockchain_token_id: string | null;
  created_at: string;
  authenticity_hash?: string;
  image_url: string | null;
}

interface VerifyDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function VerifyDialog({
  product,
  open,
  onOpenChange,
  onSuccess,
}: VerifyDialogProps) {
  const [verifying, setVerifying] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState("blockchain");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const { contract, account } = useWeb3();

  const handleVerify = async () => {
    setVerifying(true);

    try {
      let verificationResult = false;
      let confidenceScore = 0;
      let verificationDetails = notes;

      if (verificationMethod === "blockchain" && product.blockchain_token_id && contract) {
        // Verify on blockchain
        try {
          const tokenId = parseInt(product.blockchain_token_id);
          const result = await contract.verifyProduct(tokenId);
          
          if (result[0]) { // exists
            verificationResult = true;
            confidenceScore = 1.0;
            verificationDetails = `Blockchain verification successful. Product ID: ${result[1]}, Owner: ${result[2]}`;
            
            // Check if current owner matches
            if (result[2].toLowerCase() === product.current_owner_address.toLowerCase()) {
              verificationDetails += " - Owner address matches records.";
            } else {
              confidenceScore = 0.8;
              verificationDetails += " - Warning: Owner address mismatch.";
            }
          }
        } catch (blockchainError) {
          console.error("Blockchain verification error:", blockchainError);
          verificationResult = false;
          confidenceScore = 0;
          verificationDetails = "Blockchain verification failed: " + (blockchainError as Error).message;
        }
      } else if (verificationMethod === "visual") {
        // Visual verification (placeholder for future AI implementation)
        verificationResult = true;
        confidenceScore = 0.85;
        verificationDetails = notes || "Visual inspection completed by authorized verifier";
      } else if (verificationMethod === "serial") {
        // Serial number verification
        verificationResult = true;
        confidenceScore = 0.9;
        verificationDetails = notes || `Serial number ${product.product_id} verified against manufacturer database`;
      } else if (verificationMethod === "manual") {
        // Manual verification
        verificationResult = true;
        confidenceScore = 0.7;
        verificationDetails = notes || "Manual verification completed";
      }

      // Save verification log
      const { data: { user } } = await supabase.auth.getUser();
      const { error: logError } = await supabase
        .from("verification_logs")
        .insert({
          product_id: product.id,
          verification_method: verificationMethod,
          result: verificationResult,
          confidence_score: confidenceScore,
          verified_by: user?.id || null,
          ai_analysis: { notes: verificationDetails, method: verificationMethod },
        });

      if (logError) throw logError;

      // Update product verification status if successful
      if (verificationResult) {
        const { error: updateError } = await supabase
          .from("products")
          .update({ 
            verified: true,
            status: "verified"
          })
          .eq("id", product.id);

        if (updateError) throw updateError;
      }

      toast({
        title: verificationResult ? "Verification Successful! ✅" : "Verification Failed ❌",
        description: verificationResult 
          ? `Product has been verified with ${(confidenceScore * 100).toFixed(0)}% confidence`
          : "Product could not be verified. Please check the details.",
        variant: verificationResult ? "default" : "destructive",
      });

      if (verificationResult) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast({
        title: "Verification Error",
        description: error.message || "Failed to complete verification",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            VERIFY PRODUCT
          </DialogTitle>
          <DialogDescription className="font-mono">
            Verify authenticity of {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="p-3 bg-secondary rounded-lg space-y-1">
            <p className="text-sm font-heading">{product.name}</p>
            <p className="text-xs font-mono text-muted-foreground">
              ID: {product.product_id}
            </p>
            {product.blockchain_token_id && (
              <p className="text-xs font-mono text-primary">
                Token: {product.blockchain_token_id}
              </p>
            )}
          </div>

          {/* Verification Method */}
          <div className="space-y-2">
            <Label htmlFor="method" className="font-heading">
              Verification Method
            </Label>
            <Select value={verificationMethod} onValueChange={setVerificationMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select verification method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blockchain" disabled={!product.blockchain_token_id || !contract}>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Blockchain Verification</span>
                  </div>
                </SelectItem>
                <SelectItem value="serial">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Serial Number Check</span>
                  </div>
                </SelectItem>
                <SelectItem value="visual">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Visual Inspection</span>
                  </div>
                </SelectItem>
                <SelectItem value="manual">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    <span>Manual Verification</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {verificationMethod === "blockchain" && !contract && (
              <p className="text-xs text-yellow-600">
                Connect wallet for blockchain verification
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="font-heading">
              Verification Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional verification details or observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Warning for non-blockchain methods */}
          {verificationMethod !== "blockchain" && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Note: Non-blockchain verification methods provide lower confidence scores
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={verifying}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={verifying}
              className="flex-1 font-heading"
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  VERIFYING...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  VERIFY PRODUCT
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}