import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/hooks/useWeb3";
import { Wallet, LogOut, Loader2, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function WalletConnect() {
  const { account, chainId, connectWallet, disconnectWallet, switchToAmoy, isConnecting } = useWeb3();
  
  const isAmoyNetwork = chainId === 80002;

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </div>
        </div>
        {!isAmoyNetwork && (
          <Button
            variant="outline"
            size="sm"
            onClick={switchToAmoy}
            className="font-heading"
          >
            <Network className="h-4 w-4 mr-2" />
            SWITCH TO AMOY
          </Button>
        )}
        {isAmoyNetwork && (
          <Badge variant="outline" className="font-mono text-xs">
            Amoy Testnet
          </Badge>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={disconnectWallet}
          className="font-heading"
        >
          <LogOut className="h-4 w-4 mr-2" />
          DISCONNECT
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="font-heading"
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          CONNECTING...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4 mr-2" />
          CONNECT WALLET
        </>
      )}
    </Button>
  );
}
