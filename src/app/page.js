"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FaInfoCircle, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import "./globals.css";

// Endereço do contrato ORBX na Polygon
const CONTRACT_ADDRESS = "0x6449D2BF7D7464bc4121175ca9C89C6a00fdcCaF";

// ABI mínima para a compra de tokens
const ABI = [
  "function buyTokens(uint256 amount) public payable",
  "function balanceOf(address owner) view returns (uint256)"
];

export default function Home() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [orbxBalance, setOrbxBalance] = useState("0");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    async function loadWeb3() {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          // Carrega o saldo de MATIC
          const balance = await provider.getBalance(accounts[0]);
          setBalance(ethers.formatEther(balance));

          // Carrega o saldo de ORBX
          const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
          const orbxBalance = await contract.balanceOf(accounts[0]);
          setOrbxBalance(ethers.formatUnits(orbxBalance, 18));
        } catch (error) {
          console.error("Erro ao carregar Web3:", error);
        }
      } else {
        alert("Por favor, instale a MetaMask para usar este site.");
      }
    }
    loadWeb3();
  }, []);

  // Função para comprar ORBX
  const buyOrbx = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Digite uma quantidade válida de ORBX.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      // Calcula o valor em WEI (MATIC necessário)
      const maticAmount = ethers.parseUnits("0.1", "ether"); // Defina um valor fixo para o custo do token
      
      const tx = await contract.buyTokens(ethers.parseUnits(amount, 18), { value: maticAmount });
      await tx.wait();
      alert("Compra realizada com sucesso!");
    } catch (error) {
      console.error("Erro na compra:", error);
      alert("Erro ao comprar ORBX. Verifique a MetaMask e tente novamente.");
    }
  };

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
      <button onClick={buyOrbx} className="button">Comprar ORBX</button>

      <div className="button-container">
        <a href="https://x.com/ORBXTOKEN" target="_blank" className="button">
          <FaTwitter /> Twitter
        </a>
        <a href="https://www.instagram.com/orbix_token" target="_blank" className="button">
          <FaInstagram /> Instagram
        </a>
      </div>
    </div>
  );
}
