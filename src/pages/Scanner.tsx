import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  QrCode,
  Package,
  Shield,
  Calendar,
  MapPin,
  LogOut,
  Loader2,
  CheckCircle,
  XCircle,
  History,
  ArrowRight,
  Camera,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

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
  authenticity_hash: string;
  image_url: string | null;
}

interface TrackingEvent {
  id: string;
  event_type: string;
  description: string;
  location: string;
  timestamp: string;
  actor_address: string;
}

const Scanner = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Show message that image search is in development
      toast({
        title: "Image uploaded! 📸",
        description: "Visual product search will analyze the image to find matching products (Coming soon)",
      });
    }
  };

  const handleScan = async () => {
    if (!searchQuery.trim() && !selectedImage) {
      toast({
        title: "Please provide input",
        description: "Enter a product ID, scan QR code, or upload an image",
        variant: "destructive",
      });
      return;
    }

    // If image is selected, show coming soon message
    if (selectedImage && !searchQuery.trim()) {
      toast({
        title: "Visual Search Coming Soon",
        description: "Image-based product search is under development. Please use Product ID for now.",
      });
      return;
    }

    setScanning(true);
    try {
      // Search for product by ID
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("product_id", searchQuery.trim())
        .single();

      if (error || !product) {
        throw new Error("Product not found");
      }

      setScannedProduct(product);

      // Load tracking history
      const { data: events } = await supabase
        .from("tracking_events")
        .select("*")
        .eq("product_id", product.id)
        .order("timestamp", { ascending: false });

      setTrackingEvents(events || []);

      toast({
        title: "Product Found! ✅",
        description: `Successfully scanned ${product.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Scan Failed ❌",
        description: error.message || "Product not found in the system",
        variant: "destructive",
      });
      setScannedProduct(null);
      setTrackingEvents([]);
    } finally {
      setScanning(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out successfully",
      description: "Thank you for using Apex Chain Scanner",
    });
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      manufactured: "bg-blue-500",
      in_transit: "bg-yellow-500",
      at_distributor: "bg-purple-500",
      delivered: "bg-green-500",
      verified: "bg-emerald-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusIcon = (verified: boolean) => {
    return verified ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-yellow-500" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="font-mono text-muted-foreground">Loading scanner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <QrCode className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-heading">PRODUCT SCANNER</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              DASHBOARD
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="font-heading"
            >
              <LogOut className="h-4 w-4 mr-2" />
              LOGOUT
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Scanner Input */}
          <Card className="bg-card border-primary/20 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-heading">SCAN PRODUCT</CardTitle>
              <CardDescription className="font-mono">
                Enter product ID or scan QR code to view details and authenticity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Enter Product ID (e.g., F1-PART-2024-001)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleScan()}
                      className="pl-10 font-mono text-lg h-12"
                    />
                  </div>
                  <Button
                    onClick={handleScan}
                    disabled={scanning}
                    size="lg"
                    className="font-heading px-8"
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        SCANNING...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-5 w-5 mr-2" />
                        SCAN
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Image Upload Section */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground font-mono">OR</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-4">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-primary/20 rounded-lg hover:border-primary/40 transition-colors">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Product preview" 
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Camera className="h-6 w-6 text-primary" />
                          </div>
                          <p className="font-heading text-sm">UPLOAD PRODUCT IMAGE</p>
                          <p className="text-xs text-muted-foreground">Take a photo or select from gallery</p>
                        </>
                      )}
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                    >
                      Remove Image
                    </Button>
                  )}
                </div>
                
                <p className="text-center text-sm text-muted-foreground">
                  Scan QR codes, enter product IDs, or upload images for instant verification
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Scanned Product Details */}
          {scannedProduct && (
            <Card className="bg-card border-border overflow-hidden">
              {scannedProduct.image_url && (
                <div className="w-full h-64 overflow-hidden bg-secondary">
                  <img 
                    src={scannedProduct.image_url} 
                    alt={scannedProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-heading flex items-center gap-2">
                      {scannedProduct.name}
                      {getStatusIcon(scannedProduct.verified)}
                    </CardTitle>
                    <CardDescription className="font-mono mt-1">
                      ID: {scannedProduct.product_id}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(scannedProduct.status)} text-white`}>
                    {scannedProduct.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="details" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Product Details</TabsTrigger>
                    <TabsTrigger value="authenticity">Authenticity</TabsTrigger>
                    <TabsTrigger value="history">Supply Chain History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-muted-foreground">Description</p>
                        <p className="text-base">{scannedProduct.description || "No description available"}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-muted-foreground">Created Date</p>
                          <p className="text-base font-mono">
                            {new Date(scannedProduct.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-muted-foreground">Current Status</p>
                          <p className="text-base capitalize">
                            {scannedProduct.status.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="authenticity" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
                        <Shield className="h-8 w-8 text-primary" />
                        <div className="flex-1">
                          <p className="font-semibold">
                            {scannedProduct.verified ? "✅ Verified Authentic" : "⚠️ Pending Verification"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {scannedProduct.verified 
                              ? "This product has been verified as authentic"
                              : "This product is awaiting authenticity verification"}
                          </p>
                        </div>
                      </div>
                      
                      {scannedProduct.blockchain_token_id && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-muted-foreground">Blockchain Details</p>
                          <div className="p-3 bg-secondary rounded-lg font-mono text-sm">
                            <p>Token ID: {scannedProduct.blockchain_token_id}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Hash: {scannedProduct.authenticity_hash?.slice(0, 20)}...
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-muted-foreground">Manufacturer</p>
                          <p className="text-xs font-mono truncate">
                            {scannedProduct.manufacturer_address}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-muted-foreground">Current Owner</p>
                          <p className="text-xs font-mono truncate">
                            {scannedProduct.current_owner_address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-4">
                    <div className="space-y-3">
                      {trackingEvents.length > 0 ? (
                        trackingEvents.map((event, index) => (
                          <div
                            key={event.id}
                            className="flex gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                          >
                            <div className="flex-shrink-0 pt-1">
                              {index === 0 ? (
                                <div className="h-3 w-3 rounded-full bg-primary" />
                              ) : (
                                <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold text-sm">
                                    {event.event_type.replace("_", " ").toUpperCase()}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {event.description}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(event.timestamp).toLocaleDateString()}
                                </Badge>
                              </div>
                              {event.location && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <History className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No tracking history available</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!scannedProduct && !scanning && (
            <Card className="bg-secondary/30 border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading text-lg mb-2">NO PRODUCT SCANNED</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter a product ID above to view its details, verify authenticity, 
                  and track its journey through the supply chain
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Scanner;