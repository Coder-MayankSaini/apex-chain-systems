import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Image, 
  QrCode, 
  Fingerprint, 
  Cloud, 
  Database, 
  Code, 
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp
} from "lucide-react";

const IssueTicket = () => {
  const phases = [
    {
      id: 1,
      name: "Phase 1",
      title: "Smart Contract Development",
      description: "Create MerchandiseNFT.sol ERC-721 contract",
      status: "pending",
      progress: 0,
      tasks: [
        "Design NFT metadata structure",
        "Implement minting function",
        "Add burn mechanism for recalled products",
        "Deploy to Polygon Amoy testnet"
      ]
    },
    {
      id: 2,
      name: "Phase 2",
      title: "Database Schema",
      description: "Setup Supabase tables for NFT tracking",
      status: "pending",
      progress: 0,
      tasks: [
        "Create nft_certificates table",
        "Create verification_logs table",
        "Setup RLS policies",
        "Add indexes for performance"
      ]
    },
    {
      id: 3,
      name: "Phase 3",
      title: "AI Integration",
      description: "Google Cloud Vision API setup",
      status: "pending",
      progress: 0,
      tasks: [
        "Setup Cloud Vision API credentials",
        "Create image analysis endpoint",
        "Implement authenticity scoring algorithm",
        "Add caching layer for results"
      ]
    },
    {
      id: 4,
      name: "Phase 4",
      title: "Product Registration",
      description: "Enhance existing form for multi-image upload",
      status: "pending",
      progress: 0,
      tasks: [
        "Add multi-image upload UI",
        "Integrate with Vision API",
        "Generate QR codes",
        "Link NFT minting process"
      ]
    },
    {
      id: 5,
      name: "Phase 5",
      title: "Public Verification",
      description: "Create /authenticate page",
      status: "pending",
      progress: 0,
      tasks: [
        "Design public verification UI",
        "QR code scanner implementation",
        "Display NFT certificate details",
        "Show authenticity score"
      ]
    },
    {
      id: 6,
      name: "Phase 6",
      title: "NFT Minting Integration",
      description: "Connect NFT minting to product registration",
      status: "pending",
      progress: 0,
      tasks: [
        "Integrate MetaMask for minting",
        "Auto-mint on product registration",
        "Store NFT metadata on IPFS",
        "Update product records with token ID"
      ]
    }
  ];

  const requirements = {
    functional: [
      "Each authentic product receives unique ERC-721 NFT certificate",
      "QR code generation for instant product scanning",
      "Google Cloud Vision API for image analysis",
      "Authenticity scoring system (0-100%)",
      "Public verification without login requirement"
    ],
    technical: [
      "Smart contract on Polygon Amoy network",
      "Supabase backend with new tables",
      "AI verification response < 3 seconds",
      "IPFS for NFT metadata storage",
      "MetaMask integration for minting"
    ],
    deliverables: [
      "Deployed MerchandiseNFT.sol contract",
      "QR codes on all registered products",
      "Public /authenticate verification page",
      "Dashboard analytics for authentications",
      "Complete API documentation"
    ]
  };

  return (
    <div className="w-full space-y-6">
      {/* Issue Header */}
      <Card className="bg-racing-gradient border-none">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-heading flex items-center gap-2">
                <Shield className="h-6 w-6" />
                NFT CERTIFICATES & AI VERIFICATION
              </CardTitle>
              <CardDescription className="text-white/90 mt-2">
                Enhance F1 supply chain with blockchain NFT certificates and AI-powered image verification
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-background/10 text-white border-white/30">
              ACTIVE ISSUE
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono text-muted-foreground">STATUS</span>
            </div>
            <p className="text-2xl font-heading">IN PROGRESS</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono text-muted-foreground">PROGRESS</span>
            </div>
            <p className="text-2xl font-heading">0%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono text-muted-foreground">PHASES</span>
            </div>
            <p className="text-2xl font-heading">0/6</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Code className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono text-muted-foreground">PRIORITY</span>
            </div>
            <p className="text-2xl font-heading text-[hsl(var(--f1-flag-red))]">HIGH</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="font-heading">OVERVIEW</TabsTrigger>
          <TabsTrigger value="phases" className="font-heading">PHASES</TabsTrigger>
          <TabsTrigger value="requirements" className="font-heading">REQUIREMENTS</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">PROJECT CONTEXT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-heading text-sm mb-2">CURRENT STATE</h4>
                <p className="text-sm text-muted-foreground">
                  Existing F1 supply chain application with blockchain product tracking, MetaMask integration, 
                  product registration, and Supabase backend. System is fully operational and tracking products 
                  across the supply chain.
                </p>
              </div>
              <div>
                <h4 className="font-heading text-sm mb-2">ENHANCEMENT REQUIRED</h4>
                <p className="text-sm text-muted-foreground">
                  Add NFT certificates for authentic merchandise with AI-powered image verification to combat 
                  counterfeiting and ensure product authenticity throughout the supply chain.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Fingerprint className="h-5 w-5" />
                KEY FEATURES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h5 className="font-heading text-sm mb-1">NFT CERTIFICATES</h5>
                    <p className="text-xs text-muted-foreground">
                      ERC-721 tokens for each authentic product
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <QrCode className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h5 className="font-heading text-sm mb-1">QR CODE GENERATION</h5>
                    <p className="text-xs text-muted-foreground">
                      Instant scanning for product verification
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Image className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h5 className="font-heading text-sm mb-1">AI IMAGE ANALYSIS</h5>
                    <p className="text-xs text-muted-foreground">
                      Google Cloud Vision API integration
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Cloud className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h5 className="font-heading text-sm mb-1">PUBLIC VERIFICATION</h5>
                    <p className="text-xs text-muted-foreground">
                      No login required for authentication
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          {phases.map((phase) => (
            <Card key={phase.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-lg">
                      {phase.name}: {phase.title}
                    </CardTitle>
                    <CardDescription>{phase.description}</CardDescription>
                  </div>
                  <Badge 
                    variant={phase.status === "completed" ? "default" : "secondary"}
                    className="font-mono"
                  >
                    {phase.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={phase.progress} className="h-2" />
                <div className="space-y-2">
                  {phase.tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {phase.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-[hsl(var(--f1-flag-green))]" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">{task}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">FUNCTIONAL REQUIREMENTS</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {requirements.functional.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">TECHNICAL REQUIREMENTS</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {requirements.technical.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Code className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">DELIVERABLES</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {requirements.deliverables.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Database className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Performance Target:</strong> AI verification must complete in under 3 seconds. 
              Smart contract must be deployed on Polygon Amoy network for fast, low-cost transactions.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IssueTicket;
