import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Shield, Truck, Ticket, Zap, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import heroRacing from "@/assets/hero-racing.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroRacing} 
            alt="F1 Racing Circuit" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block px-6 py-2 bg-primary/20 rounded-full border border-primary mb-6 animate-racing-pulse">
            <span className="text-primary font-mono text-sm">POLE POSITION IN BLOCKCHAIN SUPPLY CHAIN</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-heading mb-6 tracking-wider">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[hsl(0,96%,44%)] via-[hsl(0,100%,55%)] to-[hsl(0,96%,44%)]">
              F1 RACING CHAIN
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 font-body">
            Premium blockchain platform for F1 teams and automotive brands. 
            Track supply chains, authenticate merchandise, and issue anti-scalping NFT tickets.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/signup">
              <Button size="lg" className="font-heading text-base px-8 shadow-speed hover:shadow-glow transition-all">
                <Zap className="mr-2 h-5 w-5" />
                START YOUR PIT STOP
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="font-heading text-base px-8 border-primary/50 hover:bg-primary/10">
                ENTER DASHBOARD
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { label: "BRANDS ONBOARD", value: "150+" },
              { label: "PRODUCTS TRACKED", value: "2.5M+" },
              { label: "TRANSACTIONS", value: "15M+" }
            ].map((stat) => (
              <Card key={stat.label} className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-4xl font-heading text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-mono">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Animated Racing Stripe */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-speed-slide" />
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading mb-4">
              CHAMPIONSHIP-LEVEL <span className="text-primary">FEATURES</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for F1 teams, automotive manufacturers, and premium brands
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Truck,
                title: "Supply Chain Tracking",
                description: "Real-time blockchain tracking from manufacturer to delivery. Like race telemetry for your products.",
                color: "text-[hsl(var(--f1-flag-green))]"
              },
              {
                icon: Shield,
                title: "Merchandise Authentication",
                description: "AI-powered verification with NFT certificates. Stop counterfeits before they reach the grid.",
                color: "text-[hsl(var(--f1-flag-yellow))]"
              },
              {
                icon: Ticket,
                title: "Anti-Scalping Tickets",
                description: "NFT tickets with built-in price caps. Fair access for true fans, maximum control for teams.",
                color: "text-primary"
              }
            ].map((feature) => (
              <Card key={feature.title} className="bg-card border-border hover:border-primary/50 transition-all group">
                <CardContent className="pt-6">
                  <div className={`inline-flex p-3 rounded-lg bg-secondary mb-4 ${feature.color} group-hover:shadow-racing transition-all`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-heading mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: CheckCircle2, label: "Blockchain Secured" },
              { icon: Shield, label: "AI Verified" },
              { icon: Globe, label: "Global Network" },
              { icon: Zap, label: "Real-Time Tracking" }
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <item.icon className="h-12 w-12 text-primary mb-3" />
                <span className="text-sm font-heading text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <Card className="max-w-4xl mx-auto bg-racing-gradient p-12 border-none text-center">
          <h2 className="text-4xl font-heading mb-4">READY TO RACE?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join the future of F1 supply chain management. Start your free trial today.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="font-heading text-base px-8">
              CREATE BRAND ACCOUNT
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p className="font-mono text-sm">© 2025 F1 Racing Chain. Powered by Blockchain Technology.</p>
          <div className="mt-4 flex justify-center gap-6 text-xs">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Security</a>
            <a href="#" className="hover:text-primary transition-colors">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
