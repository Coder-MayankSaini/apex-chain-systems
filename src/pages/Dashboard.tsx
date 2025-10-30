import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import IssueTicket from "@/components/IssueTicket";
import { 
  LayoutDashboard, 
  Truck, 
  Shield, 
  Ticket, 
  TrendingUp, 
  LogOut, 
  Package, 
  CheckCircle2, 
  Clock,
  AlertCircle,
<<<<<<< HEAD
  QrCode 
=======
  QrCode,
  Search 
>>>>>>> 5534f50e146b09b82280452e28755909134377a6
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userMetadata, setUserMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showIssueTicket, setShowIssueTicket] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
        setUserMetadata(session.user.user_metadata);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Checkered Flag! 🏁",
      description: "Logged out successfully",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="font-mono text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "PRODUCTS TRACKED", value: "1,245", icon: Package, color: "text-[hsl(var(--f1-flag-green))]" },
    { label: "IN TRANSIT", value: "87", icon: Truck, color: "text-[hsl(var(--f1-flag-yellow))]" },
    { label: "VERIFIED", value: "1,158", icon: CheckCircle2, color: "text-[hsl(var(--f1-flag-green))]" },
    { label: "PENDING", value: "12", icon: Clock, color: "text-[hsl(var(--f1-flag-yellow))]" },
  ];

  const recentActivity = [
    { 
      id: 1, 
      product: "F1 Racing Jacket #RF-2024-001", 
      status: "Delivered", 
      location: "Monaco", 
      time: "2 min ago",
      statusColor: "text-[hsl(var(--f1-flag-green))]"
    },
    { 
      id: 2, 
      product: "Team Cap Collection #TC-2024-045", 
      status: "In Transit", 
      location: "Singapore", 
      time: "15 min ago",
      statusColor: "text-[hsl(var(--f1-flag-yellow))]"
    },
    { 
      id: 3, 
      product: "Signed Helmet #SH-2024-003", 
      status: "Verification Pending", 
      location: "Milan", 
      time: "1 hour ago",
      statusColor: "text-[hsl(var(--f1-flag-yellow))]"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-heading">F1 RACING CHAIN</h1>
          </div>
          
          <div className="flex items-center gap-4">
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
          {/* Welcome Section */}
          <Card className="bg-racing-gradient border-none">
            <CardContent className="pt-6">
              <h2 className="text-3xl font-heading mb-2">WELCOME TO PIT LANE</h2>
              <p className="text-lg opacity-90">Your supply chain command center is ready for action.</p>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card border-border hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    <div className={`text-3xl font-heading ${stat.color}`}>{stat.value}</div>
                  </div>
                  <p className="text-sm font-mono text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card className="lg:col-span-2 bg-card border-border">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  LIVE RACE TRACKING
                </CardTitle>
                <CardDescription className="font-mono">
                  Real-time product movement updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-heading text-sm mb-1">{activity.product}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                          <span className={activity.statusColor}>{activity.status}</span>
                          <span>•</span>
                          <span>{activity.location}</span>
                          <span>•</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                      <CheckCircle2 className={`h-5 w-5 ${activity.statusColor}`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions - Conditional based on account type */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-heading">QUICK ACTIONS</CardTitle>
                <CardDescription className="font-mono">
                  {userMetadata?.brand_type === "scanner" 
                    ? "Scan and verify products" 
                    : "Start your race operations"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
<<<<<<< HEAD
                <Button 
                  className="w-full justify-start font-heading" 
                  variant="outline"
                  onClick={() => navigate("/supply-chain")}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Track Shipment
                </Button>
                <Button 
                  className="w-full justify-start font-heading" 
                  variant="outline"
                  onClick={() => navigate("/supply-chain")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Product
                </Button>
                <Button 
                  className="w-full justify-start font-heading" 
                  variant="outline"
                  onClick={() => setShowIssueTicket(true)}
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  Issue Ticket
                </Button>
                <Button 
                  className="w-full justify-start font-heading" 
                  variant="outline"
                  onClick={() => navigate("/supply-chain")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
                <Button 
                  className="w-full justify-start font-heading" 
                  variant="outline"
                  onClick={() => navigate("/authenticate")}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Public Verify
                </Button>
=======
                {userMetadata?.brand_type === "scanner" ? (
                  // Scanner Account Actions
                  <>
                    <Button 
                      className="w-full justify-start font-heading" 
                      variant="outline"
                      onClick={() => navigate("/scanner")}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Scan Product
                    </Button>
                    <Button 
                      className="w-full justify-start font-heading" 
                      variant="outline"
                      onClick={() => navigate("/scanner")}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search Products
                    </Button>
                    <Button 
                      className="w-full justify-start font-heading" 
                      variant="outline"
                      onClick={() => navigate("/scanner")}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Verify Authenticity
                    </Button>
                    <Button 
                      className="w-full justify-start font-heading" 
                      variant="outline"
                      onClick={() => navigate("/analytics")}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </>
                ) : (
                  // Business Account Actions
                  <>
                    <Button 
                      className="w-full justify-start font-heading" 
                      variant="outline"
                      onClick={() => navigate("/supply-chain")}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Track Shipment
                    </Button>
                    <Button 
                      className="w-full justify-start font-heading" 
                      variant="outline"
                      onClick={() => navigate("/supply-chain")}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Verify Product
                    </Button>
                    <Button className="w-full justify-start font-heading" variant="outline">
                      <Ticket className="h-4 w-4 mr-2" />
                      Issue Ticket
                    </Button>
                    <Button 
                      className="w-full justify-start font-heading" 
                      variant="outline"
                      onClick={() => navigate("/supply-chain")}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </>
                )}
>>>>>>> 5534f50e146b09b82280452e28755909134377a6
              </CardContent>
            </Card>
          </div>

          {/* Supply Chain Feature Highlight */}
          <Card className="bg-secondary/50 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg mb-2">SUPPLY CHAIN TRACKING ACTIVE</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your blockchain supply chain network is monitoring {stats[0].value} products across 
                    45 countries. All systems operational. Ready for the next lap.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="font-heading"
                      onClick={() => navigate(
                        userMetadata?.brand_type === "scanner" ? "/scanner" : "/supply-chain"
                      )}
                    >
                      {userMetadata?.brand_type === "scanner" ? "SCAN PRODUCTS" : "VIEW FULL CHAIN"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="font-heading border-primary/50"
                      onClick={() => navigate("/analytics")}
                    >
                      ANALYTICS
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Issue Ticket Dialog */}
      <Dialog open={showIssueTicket} onOpenChange={setShowIssueTicket}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">ISSUE TRACKING</DialogTitle>
          </DialogHeader>
          <IssueTicket />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
