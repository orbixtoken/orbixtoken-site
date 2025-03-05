"use client";
import { useState, useEffect } from "react";
import { FaInfoCircle, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { BrowserProvider, Contract, formatUnits, parseUnits } from "ethers";
import "./globals.css";

const CONTRACT_ADDRESS = "0x6449D2BF7D7464bc4121175ca9C89C6a00fdcCaF";
const ABI = [
  {
    "constant": false,
    "inputs": [{ "name": "amount", "type": "uint256" }],
    "name": "buyTokens",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function Home() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [orbxBalance, setOrbxBalance] = useState("0");
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    async function loadWeb3() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const provider = new BrowserProvider(window.ethereum);
        setProvider(provider);

        const balance = await provider.getBalance(accounts[0]);
        setBalance(formatUnits(balance, "ether"));

        const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);
        const orbxBalance = await contract.balanceOf(accounts[0]);
        setOrbxBalance(formatUnits(orbxBalance, "ether"));
      }
    }
    loadWeb3();
  }, []);

  async function buyOrbix() {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Digite um valor válido para comprar ORBX.");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
      const value = parseUnits(amount, "ether");
      
      const tx = await contract.buyTokens(value, { value: value });
      await tx.wait();

      alert("Compra de ORBX realizada com sucesso!");
      window.location.reload();
    } catch (error) {
      console.error("Erro na compra:", error);
      alert("Erro ao comprar ORBX. Verifique a MetaMask e tente novamente.");
    }
  }

  return (
    <div className="container">
      <h1 className="welcome-text">Bem vindo a Orbix</h1>
      <h2 className="subtitle">Orbix Token - A revolução das criptomoedas</h2>

      <p>Conecte sua MetaMask</p>
      <p>Saldo: {balance} MATIC</p>
      <p>Saldo ORBX: {orbxBalance} ORBX</p>

      <input
        type="text"
        placeholder="Quantidade de ORBX"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="input-field"
      />
      <button className="button" onClick={buyOrbix}>Comprar ORBX</button>

      <div className="button-container">
        <a href="https://www.facebook.com/seuFacebook" target="_blank" className="button">
          <FaFacebook /> Facebook
        </a>
        <a href="https://x.com/ORBXTOKEN" target="_blank" className="button">
          <FaTwitter /> Twitter
        </a>
        <a href="https://www.instagram.com/orbix_token?igsh=ZjJ6Z2xxdnJrOTlk" target="_blank" className="button">
          <FaInstagram /> Instagram
        </a>
      </div>
    </div>
  );
}
