import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Loader2 } from "lucide-react";

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    brandName: "",
    brandType: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error, data } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            brand_name: formData.brandName,
            brand_type: formData.brandType,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Podium Finish! 🏆",
          description: "Account created successfully. Welcome to the grid!",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Pit Stop Error! ⚠️",
        description: error.message || "Signup failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Racing Background Pattern */}
      <div className="absolute inset-0 checkered-pattern opacity-5" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-speed-gradient" />
      
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm shadow-speed border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full shadow-racing">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-heading">JOIN THE GRID</CardTitle>
          <CardDescription className="font-mono">
            Create your racing chain account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brandName" className="font-heading text-sm">
                BRAND NAME
              </Label>
              <Input
                id="brandName"
                type="text"
                placeholder="Ferrari Racing Team"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                required
                className="bg-secondary border-border focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brandType" className="font-heading text-sm">
                BRAND TYPE
              </Label>
              <Select onValueChange={(value) => setFormData({ ...formData, brandType: value })} required>
                <SelectTrigger className="bg-secondary border-border focus:border-primary">
                  <SelectValue placeholder="Select your category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="f1-team">F1 Team</SelectItem>
                  <SelectItem value="automotive">Automotive Manufacturer</SelectItem>
                  <SelectItem value="merchandise">Merchandise Retailer</SelectItem>
                  <SelectItem value="event-organizer">Event Organizer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="font-heading text-sm">
                EMAIL ADDRESS
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="team@racing.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-secondary border-border focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="font-heading text-sm">
                PASSWORD
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-secondary border-border focus:border-primary"
              />
              <p className="text-xs text-muted-foreground font-mono">
                At least 8 characters
              </p>
            </div>
            
            <Button
              type="submit"
              className="w-full font-heading shadow-speed hover:shadow-glow transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ENTERING RACE...
                </>
              ) : (
                "CREATE ACCOUNT 🏁"
              )}
            </Button>
          </form>
          
          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-mono">
                  Already racing?
                </span>
              </div>
            </div>
            
            <Link to="/login">
              <Button variant="outline" className="w-full font-heading border-primary/50 hover:bg-primary/10">
                LOGIN TO DASHBOARD
              </Button>
            </Link>
            
            <div className="text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors font-mono">
                ← Back to home
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Animated Racing Stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-speed-slide" />
    </div>
  );
};

export default Signup;
