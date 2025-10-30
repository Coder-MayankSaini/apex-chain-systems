import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, Contract, JsonRpcSigner } from 'ethers';
import { useToast } from '@/hooks/use-toast';

// Polygon Amoy Testnet Configuration
const AMOY_TESTNET = {
  chainId: '0x13882', // 80002 in hex
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  },
  rpcUrls: ['https://rpc-amoy.polygon.technology/'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/']
};

// Sample ABI for Product Registry Smart Contract
const PRODUCT_REGISTRY_ABI = [
  "function registerProduct(string memory productId, string memory authenticityHash) public returns (uint256)",
  "function transferProduct(uint256 tokenId, address to) public",
  "function verifyProduct(uint256 tokenId) public view returns (bool, string memory, address)",
  "event ProductRegistered(uint256 indexed tokenId, string productId, address owner)",
  "event ProductTransferred(uint256 indexed tokenId, address from, address to)"
];

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  signer: JsonRpcSigner | null;
  provider: BrowserProvider | null;
  contract: Contract | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToAmoy: () => Promise<void>;
  isConnecting: boolean;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Replace with your deployed contract address
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const switchToAmoy = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Not Found! 🚩",
        description: "Please install MetaMask",
        variant: "destructive",
      });
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AMOY_TESTNET.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [AMOY_TESTNET],
          });
          toast({
            title: "Network Added! 🏁",
            description: "Polygon Amoy Testnet added to MetaMask",
          });
        } catch (addError: any) {
          toast({
            title: "Failed to Add Network! 🚩",
            description: addError.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Failed to Switch Network! 🚩",
          description: switchError.message,
          variant: "destructive",
        });
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Not Found! 🚩",
        description: "Please install MetaMask to use blockchain features",
        variant: "destructive",
      });
      setError("MetaMask not installed");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const web3Provider = new BrowserProvider(window.ethereum);
      const accounts = await web3Provider.send("eth_requestAccounts", []);
      const web3Signer = await web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));

      // Initialize contract
      const productContract = new Contract(
        CONTRACT_ADDRESS,
        PRODUCT_REGISTRY_ABI,
        web3Signer
      );
      setContract(productContract);

      // Check if on Amoy testnet
      if (Number(network.chainId) !== 80002) {
        toast({
          title: "Wrong Network! ⚠️",
          description: "Please switch to Polygon Amoy Testnet",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Wallet Connected! 🏁",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)} on Amoy`,
        });
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setError(err.message);
      toast({
        title: "Connection Failed! 🚩",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setSigner(null);
    setProvider(null);
    setContract(null);
    toast({
      title: "Wallet Disconnected! 🏁",
      description: "Successfully disconnected from MetaMask",
    });
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        toast({
          title: "Account Changed! ⚠️",
          description: `Switched to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      toast({
        title: "Network Changed! ⚠️",
        description: `Switched to chain ID ${newChainId}`,
      });
      // Reload to reset state
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        signer,
        provider,
        contract,
        connectWallet,
        disconnectWallet,
        switchToAmoy,
        isConnecting,
        error,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
