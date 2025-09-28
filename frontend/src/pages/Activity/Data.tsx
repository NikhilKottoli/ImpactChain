import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'react-toastify';
import { walletConnection } from '@/utils/wallet';
import { CONTRACT_CONFIG } from '@/utils/contract';

import { 
    createDataset, 
    getClaimableRoyaltiesAmount, 
    getDataCoinBalance, 
    claimRoyalties 
} from '@/utils/dataDAOContract';

const CANDIDATE_LABELS = [
  "community service", "volunteering", "environmental conservation", "animal welfare",
  "education", "health and wellness", "fundraising", "charity", "humanitarian aid",
  "social activism", "community building", "tree planting", "recycling", "food drive", "mentorship",
];

const DataPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentAccount, setCurrentAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Dataset Creator state
  const [photoIDs, setPhotoIDs] = useState<number[]>([]);
  const [signature, setSignature] = useState('');
  const [isValdating, setIsValidating] = useState(false);
  const [isFetchingTokens, setIsFetchingTokens] = useState(false);

  // Royalty Claimant state
  const [claimableAmount, setClaimableAmount] = useState('0'); // <-- New state for claimable
  const [walletBalance, setWalletBalance] = useState('0'); // <-- Renamed for clarity
  const [isClaiming, setIsClaiming] = useState(false);

  // Minting state
  const [mintAddress, setMintAddress] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [isMinting, setIsMinting] = useState(false);

  const fetchBalances = useCallback(async (account: string) => {
    try {
      // --- USAGE: Calling the imported functions ---
      const claimable = await getClaimableRoyaltiesAmount(account);
      const balance = await getDataCoinBalance(account);
      setClaimableAmount(claimable);
      setWalletBalance(balance);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const account = await walletConnection.getCurrentAccount();
        if (account) {
          const daoOwner = "0xf05143E93eA268b5740a04eA9C93CCE4935bD83A";
          setCurrentAccount(account);
          setIsOwner(account.toLowerCase() === daoOwner.toLowerCase());
          await fetchBalances(account);
        }
      } catch (error: any) {
        toast.error(`Wallet connection failed: ${error.message}`);
      }
    };
    init();
  }, [fetchBalances]);

  const handleFetchTokensByLabel = async (label: string) => {
    if (!label) return;
    setIsFetchingTokens(true);
    setPhotoIDs([]);
    setSignature('');
    toast.info(`Fetching all photos for the "${label}" category...`);
    try {
      const response = await fetch(`http://localhost:3000/api/datadao/tokens-by-label/${label}`);
      if (!response.ok) throw new Error('Failed to fetch token IDs.');
      const tokenIds: number[] = await response.json();
      if (tokenIds.length === 0) {
        toast.warn(`No photos found for the "${label}" category.`);
        setPhotoIDs([]);
      } else {
        setPhotoIDs(tokenIds);
        toast.success(`Found ${tokenIds.length} photos. Ready for validation.`);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsFetchingTokens(false);
    }
  };

  const handleValidateDataset = async () => {
    if (photoIDs.length === 0) {
      toast.error("No photos in the current dataset to validate.");
      return;
    }
    setIsValidating(true);
    toast.info("Requesting validation from the server...");
    try {
      // CORRECTED: The endpoint is /api/datadao/validate, not /api/datasets/validate
      const response = await fetch('http://localhost:3000/api/datadao/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoIDs }), // The backend expects 'photoIDs'
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Validation failed. Check server logs.');
      }
      // CORRECTED: The backend returns 'apiSignature', not 'signature'
      const { apiSignature } = await response.json();
      setSignature(apiSignature);
      toast.success("Dataset validated successfully! You can now create the dataset.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCreateDataset = async () => {
    if (!signature) {
      toast.error("You must validate the dataset before creating it.");
      return;
    }
    setLoading(true);
    try {
      // --- USAGE: Calling the imported createDataset function ---
      // This function now handles the approve-and-call logic correctly.
      await createDataset(photoIDs, signature);

      // Custom component for the success toast
      const SuccessToast = () => (
        <div>
          <p className="font-semibold">Purchase Successful!</p>
          <p className="text-sm">Dataset NFT minted to your wallet.</p>
          <Button 
            size="sm" 
            className="mt-2 w-full bg-white text-black hover:bg-gray-200" 
            onClick={() => navigate('/my-datasets')}
          >
            View My Datasets
          </Button>
        </div>
      );

      // Display the custom toast
      toast.success(<SuccessToast />, {
        autoClose: 6000, // Keep toast open a bit longer
        closeOnClick: false,
      });

      setSignature('');
      setPhotoIDs([]);
    } catch (error: any) {
      toast.error(error.message || "Transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRoyalties = async () => {
    setIsClaiming(true);
    try {
      // --- USAGE: Calling the imported claimRoyalties function ---
      await claimRoyalties();
      toast.success("Royalties claimed successfully! Your wallet balance will update shortly.");
      await fetchBalances(currentAccount); // Refresh both balances
    } catch (error: any) {
      toast.error(error.message || "Failed to claim royalties.");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleMintTokens = async () => {
    if (!mintAddress || !mintAmount) {
      toast.error("Please provide both a recipient address and an amount.");
      return;
    }
    setIsMinting(true);
    toast.info(`Minting ${mintAmount} SIT for ${mintAddress}...`);
    try {
      const response = await fetch('http://localhost:3000/api/datadao/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: mintAddress, amount: mintAmount }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Minting failed.');
      toast.success(result.message);
      setMintAddress('');
      setMintAmount('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">DataDAO Marketplace</h1>
        <p className="text-gray-600">Create datasets from social impact posts and manage your contributor royalties.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create and Purchase Dataset by Label</CardTitle>
          <CardDescription>Select a category to create a dataset, validate it, and purchase access.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleFetchTokensByLabel} disabled={isFetchingTokens || isValdating || loading}>
            <SelectTrigger><SelectValue placeholder="1. Select a category..." /></SelectTrigger>
            <SelectContent>
              {CANDIDATE_LABELS.map(label => (
                <SelectItem key={label} value={label}>{label.charAt(0).toUpperCase() + label.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {photoIDs.length > 0 && !signature && (
            <div className="p-2 mt-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
              Found {photoIDs.length} photos. Ready for validation.
            </div>
          )}
          {signature && (
            <div className="p-2 mt-4 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
              Validation successful. Ready to create.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button onClick={handleValidateDataset} disabled={isValdating || loading || photoIDs.length === 0 || !!signature}>
            {isValdating ? 'Validating...' : '2. Validate Dataset'}
          </Button>
          <Button onClick={handleCreateDataset} disabled={loading || !signature}>
            {loading ? 'Purchasing...' : '3. Create & Purchase'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Contributor Royalties</CardTitle>
          <CardDescription>Claim your revenue share from purchased datasets. Royalties are paid in DataCoin (SIT).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-lg">Claimable Amount:</p>
                <p className="font-bold text-xl text-blue-600">{parseFloat(claimableAmount).toFixed(4)} SIT</p>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
                <p>Your Current Wallet Balance:</p>
                <p>{parseFloat(walletBalance).toFixed(4)} SIT</p>
            </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleClaimRoyalties} disabled={isClaiming || parseFloat(claimableAmount) === 0}>
            {isClaiming ? 'Claiming...' : 'Claim Royalties'}
          </Button>
        </CardFooter>
      </Card>

      {isOwner && (
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle>Admin: Mint DataCoin (SIT)</CardTitle>
            <CardDescription>As the contract owner, you can mint new SIT tokens to any address.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Recipient Address (e.g., 0x...)" value={mintAddress} onChange={(e) => setMintAddress(e.target.value)} disabled={isMinting} />
            <Input type="number" placeholder="Amount to Mint (e.g., 1000)" value={mintAmount} onChange={(e) => setMintAmount(e.target.value)} disabled={isMinting} />
          </CardContent>
          <CardFooter>
            <Button onClick={handleMintTokens} disabled={isMinting || !mintAddress || !mintAmount} className="w-full">
              {isMinting ? 'Minting...' : 'Mint Tokens'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default DataPage;