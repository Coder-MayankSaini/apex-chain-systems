import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRightLeft,
  Package,
  Truck,
  Shield,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  product_id: string;
  name: string;
}

interface Transfer {
  id: string;
  from_address: string;
  to_address: string;
  transfer_date: string;
  transaction_hash: string | null;
}

interface Shipment {
  id: string;
  from_location: string;
  to_location: string;
  status: string;
  carrier: string | null;
  tracking_number: string | null;
  created_at: string;
  estimated_delivery: string | null;
  actual_delivery: string | null;
}

interface Verification {
  id: string;
  result: boolean;
  verification_method: string;
  confidence_score: number | null;
  created_at: string;
}

interface TrackingDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrackingDialog({
  product,
  open,
  onOpenChange,
}: TrackingDialogProps) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open, product.id]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [transfersData, shipmentsData, verificationsData] = await Promise.all([
        supabase
          .from("ownership_transfers")
          .select("*")
          .eq("product_id", product.id)
          .order("transfer_date", { ascending: false }),
        supabase
          .from("shipments")
          .select("*")
          .eq("product_id", product.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("verification_logs")
          .select("*")
          .eq("product_id", product.id)
          .order("created_at", { ascending: false }),
      ]);

      if (transfersData.error) throw transfersData.error;
      if (shipmentsData.error) throw shipmentsData.error;
      if (verificationsData.error) throw verificationsData.error;

      setTransfers(transfersData.data || []);
      setShipments(shipmentsData.data || []);
      setVerifications(verificationsData.data || []);
    } catch (error: any) {
      toast({
        title: "Failed to Load History",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">PRODUCT HISTORY</DialogTitle>
          <p className="text-sm font-mono text-muted-foreground">{product.name}</p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Ownership Transfers */}
            {transfers.length > 0 && (
              <div>
                <h3 className="text-sm font-heading text-muted-foreground mb-3 flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4" />
                  OWNERSHIP TRANSFERS
                </h3>
                <div className="space-y-3">
                  {transfers.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="p-3 bg-secondary rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(transfer.transfer_date).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                        <div className="text-xs font-mono truncate">
                          {transfer.from_address}
                        </div>
                        <ArrowRightLeft className="h-3 w-3 text-primary" />
                        <div className="text-xs font-mono truncate">
                          {transfer.to_address}
                        </div>
                      </div>
                      {transfer.transaction_hash && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">TX:</span>
                          <code className="flex-1 truncate">{transfer.transaction_hash}</code>
                          <ExternalLink className="h-3 w-3 text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {transfers.length > 0 && (shipments.length > 0 || verifications.length > 0) && (
              <Separator />
            )}

            {/* Shipments */}
            {shipments.length > 0 && (
              <div>
                <h3 className="text-sm font-heading text-muted-foreground mb-3 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  SHIPMENTS
                </h3>
                <div className="space-y-3">
                  {shipments.map((shipment) => (
                    <div
                      key={shipment.id}
                      className="p-3 bg-secondary rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="font-mono text-xs">
                          {shipment.status.toUpperCase().replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(shipment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                        <div className="text-xs">
                          <p className="text-muted-foreground">From</p>
                          <p className="font-mono">{shipment.from_location}</p>
                        </div>
                        <Package className="h-3 w-3 text-primary" />
                        <div className="text-xs">
                          <p className="text-muted-foreground">To</p>
                          <p className="font-mono">{shipment.to_location}</p>
                        </div>
                      </div>
                      {shipment.carrier && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Carrier: </span>
                          <span>{shipment.carrier}</span>
                          {shipment.tracking_number && (
                            <span className="font-mono ml-2">
                              #{shipment.tracking_number}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {shipments.length > 0 && verifications.length > 0 && <Separator />}

            {/* Verifications */}
            {verifications.length > 0 && (
              <div>
                <h3 className="text-sm font-heading text-muted-foreground mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  VERIFICATION HISTORY
                </h3>
                <div className="space-y-3">
                  {verifications.map((verification) => (
                    <div
                      key={verification.id}
                      className="p-3 bg-secondary rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          className={
                            verification.result
                              ? "bg-[hsl(var(--f1-flag-green))] text-white"
                              : "bg-[hsl(var(--f1-racing-red))] text-white"
                          }
                        >
                          {verification.result ? "VERIFIED" : "FAILED"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(verification.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Method: </span>
                        <span className="font-mono">{verification.verification_method}</span>
                      </div>
                      {verification.confidence_score !== null && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Confidence: </span>
                          <span className="font-mono">
                            {(verification.confidence_score * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {transfers.length === 0 && shipments.length === 0 && verifications.length === 0 && (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No history recorded yet
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
