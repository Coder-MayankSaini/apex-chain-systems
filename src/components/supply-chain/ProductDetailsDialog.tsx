import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Calendar, Hash, MapPin } from "lucide-react";

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

interface ProductDetailsDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsDialog({
  product,
  open,
  onOpenChange,
}: ProductDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            {product.name}
            {product.verified && (
              <Badge className="bg-[hsl(var(--f1-flag-green))] text-white">
                <Shield className="h-3 w-3 mr-1" />
                VERIFIED
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-heading text-muted-foreground mb-2">
              PRODUCT INFORMATION
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Hash className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Product ID</p>
                  <p className="font-mono text-sm">{product.product_id}</p>
                </div>
              </div>
              {product.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{product.description}</p>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">
                    {new Date(product.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-heading text-muted-foreground mb-2">
              BLOCKCHAIN DATA
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Manufacturer Address
                </p>
                <p className="font-mono text-xs break-all bg-secondary p-2 rounded">
                  {product.manufacturer_address || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Current Owner Address
                </p>
                <p className="font-mono text-xs break-all bg-secondary p-2 rounded">
                  {product.current_owner_address}
                </p>
              </div>
              {product.blockchain_token_id && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Blockchain Token ID
                  </p>
                  <p className="font-mono text-xs break-all bg-primary/10 p-2 rounded border border-primary/20">
                    {product.blockchain_token_id}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-heading text-muted-foreground mb-2">
              STATUS
            </h3>
            <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-heading">
                {product.status.toUpperCase().replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
