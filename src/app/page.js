"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const ORBX_CONTRACT = "0x6449D2BF7D7464bc4121175ca9C89C6a00fdcCaF";
const ORBX_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

export default function Home() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [orbxBalance, setOrbxBalance] = useState("0");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const loadWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setAccount(accounts[0]);

          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();

          const balance = await provider.getBalance(accounts[0]);
          setBalance(ethers.formatEther(balance));

          const contract = new ethers.Contract(ORBX_CONTRACT, ORBX_ABI, provider);
          const orbxBal = await contract.balanceOf(accounts[0]);
          setOrbxBalance(ethers.formatEther(orbxBal));
        } catch (error) {
          console.error("Wallet connection failed", error);
        }
      }
    };
    loadWallet();
  }, []);

  const buyOrbx = async () => {
    if (!account || !amount) {
      alert("Por favor, insira uma quantidade válida de ORBX.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ORBX_CONTRACT, ORBX_ABI, signer);
      
      const tx = await contract.transfer(account, ethers.parseEther(amount));
      await tx.wait();
      alert("Compra de ORBX realizada com sucesso!");
    } catch (error) {
      console.error("Erro na compra", error);
      alert("Erro ao comprar ORBX. Verifique a MetaMask e tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <header className="w-full py-4 bg-gray-800 text-center text-lg font-bold shadow-lg">
        Orbix Token - A revolução das criptomoedas
      </header>

      <main className="flex flex-col items-center justify-center mt-8">
        <h1 className="text-4xl font-bold mb-4">Bem-vindo à Orbix</h1>
        <p className="text-lg">
          {account ? `Sua carteira: ${account}` : "Conecte sua MetaMask"}
        </p>
        <p className="mt-2 text-lg">Saldo: {balance} MATIC</p>
        <p className="mt-2 text-lg">Saldo ORBX: {orbxBalance} ORBX</p>

        <input
          type="text"
          placeholder="Quantidade de ORBX"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 mt-4 border rounded bg-gray-800 text-white"
        />

        <button
          onClick={buyOrbx}
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-800 text-white rounded-lg shadow-md"
        >
          Comprar ORBX
        </button>
      </main>
    </div>
  );
}
