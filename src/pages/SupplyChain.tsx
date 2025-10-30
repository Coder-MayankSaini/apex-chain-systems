import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LayoutDashboard,
  Plus,
  Search,
  Filter,
  Package,
  LogOut,
  ArrowRight,
  Loader2,
  Shield,
  Upload,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/hooks/useWeb3";
import { WalletConnect } from "@/components/supply-chain/WalletConnect";
import { ProductCard } from "@/components/supply-chain/ProductCard";

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

const SupplyChain = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { account, contract } = useWeb3();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
        loadProducts();
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

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } else {
      setProducts(data || []);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setIsRegistering(true);

    try {
      const productId = formData.get("product_id") as string;
      const authenticityHash = crypto.randomUUID();
      let blockchainTokenId = null;
      let imageUrl = null;

      // Upload image if provided
      if (productImage) {
        const fileExt = productImage.name.split('.').pop();
        const fileName = `${productId}-${Date.now()}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, productImage);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);
          imageUrl = publicUrl;
        } else {
          console.error('Image upload error:', uploadError);
          toast({
            title: "Image Upload Warning",
            description: "Product registered but image upload failed",
            variant: "destructive",
          });
        }
      }

      // If wallet is connected and contract is available, register on blockchain
      if (account && contract) {
        try {
          const tx = await contract.registerProduct(productId, authenticityHash);
          const receipt = await tx.wait();
          
          // Extract token ID from event logs
          const event = receipt.logs.find((log: any) => 
            log.fragment?.name === 'ProductRegistered'
          );
          if (event) {
            blockchainTokenId = event.args[0].toString();
          }

          toast({
            title: "Blockchain Registration Complete! 🏁",
            description: `Token ID: ${blockchainTokenId}`,
          });
        } catch (blockchainError: any) {
          console.error("Blockchain registration error:", blockchainError);
          toast({
            title: "Blockchain Registration Failed",
            description: "Product will be registered in database only",
            variant: "destructive",
          });
        }
      }

      const productData = {
        product_id: productId,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        manufacturer_address: formData.get("manufacturer_address") as string || account || "0x0",
        current_owner_address: formData.get("current_owner_address") as string || account || "0x0",
        authenticity_hash: authenticityHash,
        blockchain_token_id: blockchainTokenId,
        brand_id: user?.id,
        status: "manufactured" as const,
        image_url: imageUrl,
      };

      const { error } = await supabase.from("products").insert([productData]);

      if (error) throw error;

      toast({
        title: "Product Registered! 🏁",
        description: blockchainTokenId 
          ? "Product registered on blockchain and database"
          : "Product registered in database",
      });

      setIsAddDialogOpen(false);
      setProductImage(null);
      setImagePreview(null);
      loadProducts();
    } catch (error: any) {
      console.error("Product registration error:", error);
      toast({
        title: "Registration Failed! 🚩",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Checkered Flag! 🏁",
      description: "Logged out successfully",
    });
    navigate("/");
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.product_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="font-mono text-muted-foreground">Loading supply chain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-heading">SUPPLY CHAIN TRACKING</h1>
          </div>

          <div className="flex items-center gap-4">
            <WalletConnect />
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              DASHBOARD
            </Button>
            <div className="text-right">
              <p className="text-sm font-mono text-muted-foreground">Logged in as</p>
              <p className="text-sm font-heading">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="font-heading border-primary/50 hover:bg-primary/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              LOGOUT
            </Button>
          </div>
        </div>
        <div className="h-1 bg-speed-gradient animate-speed-slide" />
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Action Bar */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1 w-full md:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search products by name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] font-mono">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="manufactured">Manufactured</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="at_distributor">At Distributor</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                    </SelectContent>
                  </Select>

                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="font-heading">
                        <Plus className="h-4 w-4 mr-2" />
                        ADD PRODUCT
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle className="font-heading">REGISTER NEW PRODUCT</DialogTitle>
                        <DialogDescription className="font-mono">
                          Add a new product to the blockchain supply chain
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddProduct} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="product_id" className="font-heading">
                            Product ID
                          </Label>
                          <Input
                            id="product_id"
                            name="product_id"
                            placeholder="F1-JACKET-2024-001"
                            required
                            className="font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name" className="font-heading">
                            Product Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="F1 Racing Jacket"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description" className="font-heading">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            name="description"
                            placeholder="Official F1 team racing jacket..."
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="manufacturer_address" className="font-heading">
                            Manufacturer Wallet Address {!account && "(Optional)"}
                          </Label>
                          <Input
                            id="manufacturer_address"
                            name="manufacturer_address"
                            placeholder={account || "0x..."}
                            defaultValue={account || ""}
                            className="font-mono"
                          />
                          {account && (
                            <p className="text-xs text-muted-foreground">
                              Using connected wallet address
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="current_owner_address" className="font-heading">
                            Current Owner Wallet Address {!account && "(Optional)"}
                          </Label>
                          <Input
                            id="current_owner_address"
                            name="current_owner_address"
                            placeholder={account || "0x..."}
                            defaultValue={account || ""}
                            className="font-mono"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="product_image" className="font-heading">
                            Product Image (Optional)
                          </Label>
                          <div className="flex flex-col gap-2">
                            {imagePreview ? (
                              <div className="relative w-full">
                                <img 
                                  src={imagePreview} 
                                  alt="Product preview" 
                                  className="w-full h-48 object-cover rounded-lg border border-border"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  className="absolute top-2 right-2"
                                  onClick={() => {
                                    setProductImage(null);
                                    setImagePreview(null);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <label htmlFor="product_image" className="cursor-pointer">
                                <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                                  <div className="flex flex-col items-center gap-2">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <span className="text-sm font-mono text-muted-foreground">
                                      Click to upload product image
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      JPG, PNG, WEBP up to 5MB
                                    </span>
                                  </div>
                                </div>
                              </label>
                            )}
                            <input
                              id="product_image"
                              name="product_image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </div>
                        </div>

                        {!account && (
                          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">
                              Connect your wallet to register products on blockchain
                            </p>
                          </div>
                        )}

                        <Button 
                          type="submit" 
                          className="w-full font-heading"
                          disabled={isRegistering}
                        >
                          {isRegistering ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              REGISTERING...
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              {account ? "REGISTER TO BLOCKCHAIN" : "REGISTER PRODUCT"}
                            </>
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onUpdate={loadProducts}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <Card className="bg-secondary/50 border-border">
              <CardContent className="pt-6 text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading text-lg mb-2">NO PRODUCTS FOUND</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Start by adding your first product to the supply chain"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Button onClick={() => setIsAddDialogOpen(true)} className="font-heading">
                    <Plus className="h-4 w-4 mr-2" />
                    ADD FIRST PRODUCT
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default SupplyChain;