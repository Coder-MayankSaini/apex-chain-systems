import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Flag, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        toast({
          title: "Green Flag! 🏁",
          description: "Login successful. Entering dashboard...",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Red Flag! 🚩",
        description: error.message || "Login failed. Check your credentials.",
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
              <Flag className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-heading">DRIVER LOGIN</CardTitle>
          <CardDescription className="font-mono">
            Access your racing dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-heading text-sm">
                EMAIL ADDRESS
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="driver@racing-team.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-secondary border-border focus:border-primary"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full font-heading shadow-speed hover:shadow-glow transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ENTERING PIT LANE...
                </>
              ) : (
                "START ENGINE 🏁"
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
                  New to the grid?
                </span>
              </div>
            </div>
            
            <Link to="/signup">
              <Button variant="outline" className="w-full font-heading border-primary/50 hover:bg-primary/10">
                CREATE BRAND ACCOUNT
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

export default Login;
