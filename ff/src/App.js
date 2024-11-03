import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import "./App.css";
const contractABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_oceanTokenAddress",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "assetCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "dataAssets",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "metadataCID", type: "string", internalType: "string" },
      { name: "dataCID", type: "string", internalType: "string" },
      { name: "price", type: "uint256", internalType: "uint256" },
      { name: "isActive", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDataAsset",
    inputs: [{ name: "_assetId", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "metadataCID", type: "string", internalType: "string" },
      { name: "price", type: "uint256", internalType: "uint256" },
      { name: "isActive", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "oceanToken",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract ERC20" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "publishDataAsset",
    inputs: [
      { name: "_metadataCID", type: "string", internalType: "string" },
      { name: "_dataCID", type: "string", internalType: "string" },
      { name: "_price", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "purchaseDataAsset",
    inputs: [{ name: "_assetId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "toggleDataAsset",
    inputs: [{ name: "_assetId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "AssetPublished",
    inputs: [
      {
        name: "assetId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "metadataCID",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "price",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AssetPurchased",
    inputs: [
      {
        name: "assetId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "buyer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "seller",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "price",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
];

const ipfs = create({ host: "ipfs.infura.io", port: 5001, protocol: "https" });

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    } ${className}`}
  >
    {children}
  </button>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

const TextArea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

const App = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [oceanToken, setOceanToken] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);
  console.log(provider);
  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await web3Provider.send("eth_requestAccounts", []);
          const signer = await web3Provider.getSigner();

          const contractAddress = "";
          const oceanTokenAddress =
            "0xDCe07662CA8EbC241316a15B611c89711414Dd1a";

          const marketplaceContract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );

          const oceanTokenContract = new ethers.Contract(
            oceanTokenAddress,
            [
              "function approve(address spender, uint256 amount) external returns (bool)",
            ],
            signer
          );

          setProvider(web3Provider);
          setContract(marketplaceContract);
          setOceanToken(oceanTokenContract);
          setAccount(accounts[0]);
          console.log(account);

          marketplaceContract.on(
            "AssetPublished",
            (assetId, owner, metadataCID, price, event) => {
              setTransactions((prev) => [
                ...prev,
                {
                  type: "publish",
                  assetId: assetId.toString(),
                  owner,
                  price: ethers.formatEther(price),
                  txHash: event.transactionHash,
                },
              ]);
              loadAssets(marketplaceContract);
            }
          );

          marketplaceContract.on(
            "AssetPurchased",
            (assetId, buyer, seller, price, event) => {
              setTransactions((prev) => [
                ...prev,
                {
                  type: "purchase",
                  assetId: assetId.toString(),
                  buyer,
                  seller,
                  price: ethers.formatEther(price),
                  txHash: event.transactionHash,
                },
              ]);
              loadAssets(marketplaceContract);
            }
          );

          await loadAssets(marketplaceContract);
          setLoading(false);
        } else {
          setError("Please install MetaMask to use this dApp");
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to initialize Web3: " + err.message);
        setLoading(false);
      }
    };
    init();
    return () => {
      if (contract) {
        contract.removeAllListeners("AssetPublished");
        contract.removeAllListeners("AssetPurchased");
      }
    };
  }, []);

  const loadAssets = async (contract) => {
    try {
      const assetCount = await contract.assetCount();
      const loadedAssets = [];

      for (let i = 0; i < assetCount.toNumber(); i++) {
        const asset = await contract.getDataAsset(i);
        if (asset.isActive) {
          try {
            const response = await fetch(
              `https://ipfs.io/ipfs/${asset.metadataCID}`
            );
            const metadata = await response.json();

            loadedAssets.push({
              id: i,
              owner: asset.owner,
              price: asset.price,
              isActive: asset.isActive,
              ...metadata,
            });
          } catch (err) {
            console.error(`Failed to fetch metadata for asset ${i}:`, err);
          }
        }
      }

      setAssets(loadedAssets);
    } catch (err) {
      setError("Failed to load assets: " + err.message);
    }
  };

  const PublishAssetForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      price: "",
      file: null,
    });
    const [publishing, setPublishing] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setPublishing(true);

      try {
        const { name, description, price, file } = formData;
        if (!file || !name || !description || !price) {
          throw new Error("Please fill in all fields");
        }
        const fileBuffer = await file.arrayBuffer();
        const added = await ipfs.add(fileBuffer);
        const dataCID = added.path;
        const metadata = {
          name,
          description,
          dataCID,
          timestamp: Date.now(),
        };

        const metadataAdded = await ipfs.add(JSON.stringify(metadata));
        const metadataCID = metadataAdded.path;

        const priceInWei = ethers.parseEther(price);
        const tx = await contract.publishDataAsset(
          metadataCID,
          dataCID,
          priceInWei
        );
        await tx.wait();

        setFormData({ name: "", description: "", price: "", file: null });
        setPublishing(false);
      } catch (err) {
        setError("Failed to publish asset: " + err.message);
        setPublishing(false);
      }
    };

    return (
      <Card className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Publish New Asset</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Asset Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={publishing}
            />
          </div>
          <div>
            <TextArea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows="4"
              disabled={publishing}
            />
          </div>
          <div>
            <Input
              type="file"
              onChange={(e) =>
                setFormData({ ...formData, file: e.target.files[0] })
              }
              disabled={publishing}
            />
          </div>
          <div>
            <Input
              type="number"
              step="0.01"
              placeholder="Price in OCEAN"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              disabled={publishing}
            />
          </div>
          <Button type="submit" className="w-full" disabled={publishing}>
            {publishing ? "Publishing..." : "Publish Asset"}
          </Button>
        </form>
      </Card>
    );
  };

  const AssetCard = ({ asset }) => {
    const [purchasing, setPurchasing] = useState(false);

    const handlePurchase = async () => {
      try {
        setPurchasing(true);
        const approveTx = await oceanToken.approve(
          contract.address,
          asset.price
        );
        await approveTx.wait();

        const purchaseTx = await contract.purchaseDataAsset(asset.id);
        await purchaseTx.wait();

        setPurchasing(false);
      } catch (err) {
        setError("Failed to purchase asset: " + err.message);
        setPurchasing(false);
      }
    };

    return (
      <Card className="mb-4">
        <h3 className="text-xl font-semibold mb-2">{asset.name}</h3>
        <p className="text-gray-600 mb-4">{asset.description}</p>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-medium">
              {ethers.formatEther(asset.price)} OCEAN
            </span>
            <p className="text-sm text-gray-500">
              Owner: {asset.owner.slice(0, 6)}...{asset.owner.slice(-4)}
            </p>
          </div>
          <Button
            onClick={handlePurchase}
            disabled={purchasing || asset.owner === account}
          >
            {purchasing
              ? "Purchasing..."
              : asset.owner === account
              ? "You own this"
              : "Purchase"}
          </Button>
        </div>
      </Card>
    );
  };

  const TransactionHistory = () => (
    <Card className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
      <div className="space-y-2">
        {transactions.map((tx, index) => (
          <div key={index} className="text-sm text-gray-600">
            {tx.type === "publish" ? " Published:" : " Purchased:"} Asset #
            {tx.assetId}
            <a
              href={`https://etherscan.io/tx/${tx.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline ml-2"
            >
              View Transaction
            </a>
          </div>
        ))}
        {transactions.length === 0 && <p>No recent transactions</p>}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Ocean Protocol Data Marketplace
          </h1>
          <p className="text-gray-600">Connected Account: {account}</p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <PublishAssetForm />

        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Available Assets</h2>
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
          {assets.length === 0 && (
            <p className="text-gray-600">No assets available</p>
          )}
        </div>

        <TransactionHistory />
      </div>
    </div>
  );
};

export default App;
