import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWeb3 } from "@/hooks/useWeb3";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowRightLeft, Loader2 } from "lucide-react";

interface Product {
  id: string;
  product_id: string;
  name: string;
  current_owner_address: string;
  blockchain_token_id: string | null;
}

interface TransferDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TransferDialog({
  product,
  open,
  onOpenChange,
  onSuccess,
}: TransferDialogProps) {
  const [toAddress, setToAddress] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const { account, contract } = useWeb3();
  const { toast } = useToast();

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      toast({
        title: "Wallet Not Connected! 🚩",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!toAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: "Invalid Address! 🚩",
        description: "Please enter a valid Ethereum address",
        variant: "destructive",
      });
      return;
    }

    setIsTransferring(true);

    try {
      let transactionHash = "";

      // If we have a contract and token ID, do blockchain transfer
      if (contract && product.blockchain_token_id) {
        const tx = await contract.transferProduct(
          product.blockchain_token_id,
          toAddress
        );
        const receipt = await tx.wait();
        transactionHash = receipt.hash;

        toast({
          title: "Blockchain Transfer Complete! 🏁",
          description: `Transaction: ${transactionHash.slice(0, 10)}...`,
        });
      }

      // Record transfer in database
      const { error: transferError } = await supabase
        .from("ownership_transfers")
        .insert({
          product_id: product.id,
          from_address: product.current_owner_address,
          to_address: toAddress,
          transaction_hash: transactionHash || null,
          transfer_date: new Date().toISOString(),
        });

      if (transferError) throw transferError;

      // Update product owner
      const { error: updateError } = await supabase
        .from("products")
        .update({ current_owner_address: toAddress })
        .eq("id", product.id);

      if (updateError) throw updateError;

      toast({
        title: "Ownership Transferred! 🏁",
        description: `Product transferred to ${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`,
      });

      onSuccess();
      onOpenChange(false);
      setToAddress("");
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast({
        title: "Transfer Failed! 🚩",
        description: error.message || "Failed to transfer ownership",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading">TRANSFER OWNERSHIP</DialogTitle>
          <DialogDescription className="font-mono">
            Transfer {product.name} to a new owner
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleTransfer} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-heading">Current Owner</Label>
            <Input
              value={product.current_owner_address}
              disabled
              className="font-mono text-sm"
            />
          </div>

          <div className="flex justify-center">
            <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="to_address" className="font-heading">
              New Owner Address *
            </Label>
            <Input
              id="to_address"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="0x..."
              required
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Enter the Ethereum wallet address of the new owner
            </p>
          </div>

          {!account && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Connect your wallet to transfer on blockchain
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isTransferring}
            className="w-full font-heading"
          >
            {isTransferring ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                TRANSFERRING...
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                TRANSFER OWNERSHIP
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
