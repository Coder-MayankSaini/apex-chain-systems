import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Shield,
  QrCode,
  ArrowRightLeft,
  History,
} from "lucide-react";
import { ProductDetailsDialog } from "./ProductDetailsDialog";
import { TransferDialog } from "./TransferDialog";
import { TrackingDialog } from "./TrackingDialog";

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
  image_url: string | null;
}

interface ProductCardProps {
  product: Product;
  onUpdate: () => void;
}

export function ProductCard({ product, onUpdate }: ProductCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showTracking, setShowTracking] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "manufactured":
        return <Package className="h-4 w-4" />;
      case "in_transit":
        return <Truck className="h-4 w-4" />;
      case "at_distributor":
        return <MapPin className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle2 className="h-4 w-4" />;
      case "verified":
        return <Shield className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "manufactured":
        return "text-[hsl(var(--f1-silver))]";
      case "in_transit":
        return "text-[hsl(var(--f1-flag-yellow))]";
      case "at_distributor":
        return "text-[hsl(var(--f1-flag-blue))]";
      case "delivered":
        return "text-[hsl(var(--f1-flag-green))]";
      case "verified":
        return "text-[hsl(var(--f1-racing-red))]";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <>
      <Card className="bg-card border-border hover:border-primary/50 transition-all group">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="font-heading text-lg mb-1">
                {product.name}
              </CardTitle>
              <p className="text-xs font-mono text-muted-foreground">
                {product.product_id}
              </p>
            </div>
            {product.verified && (
              <Badge className="bg-[hsl(var(--f1-flag-green))] text-white">
                <Shield className="h-3 w-3 mr-1" />
                VERIFIED
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(product.status)}
                <span className={`text-sm font-heading ${getStatusColor(product.status)}`}>
                  {product.status.toUpperCase().replace("_", " ")}
                </span>
              </div>
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            )}

            <div className="pt-2 space-y-2">
              <div className="text-xs font-mono">
                <span className="text-muted-foreground">Current Owner:</span>
                <p className="truncate text-primary">
                  {product.current_owner_address}
                </p>
              </div>
              {product.blockchain_token_id && (
                <div className="text-xs font-mono">
                  <span className="text-muted-foreground">Token ID:</span>
                  <p className="truncate">{product.blockchain_token_id}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="font-heading"
                onClick={() => setShowTracking(true)}
              >
                <History className="h-4 w-4 mr-1" />
                HISTORY
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="font-heading"
                onClick={() => setShowDetails(true)}
              >
                <QrCode className="h-4 w-4 mr-1" />
                DETAILS
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="font-heading col-span-2"
                onClick={() => setShowTransfer(true)}
              >
                <ArrowRightLeft className="h-4 w-4 mr-1" />
                TRANSFER OWNERSHIP
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProductDetailsDialog
        product={product}
        open={showDetails}
        onOpenChange={setShowDetails}
      />

      <TransferDialog
        product={product}
        open={showTransfer}
        onOpenChange={setShowTransfer}
        onSuccess={onUpdate}
      />

      <TrackingDialog
        product={product}
        open={showTracking}
        onOpenChange={setShowTracking}
      />
    </>
  );
}
