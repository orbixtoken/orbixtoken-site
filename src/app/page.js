"use client";
import { useState, useEffect } from "react";
import { FaInfoCircle, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import "./globals.css";

const CONTRACT_ADDRESS = "0x6449D2BF7D7464bc4121175ca9C89C6a00fdcCaF"; // Endereço do contrato ORBX na Polygon
const ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "buyOrbix",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function Home() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [orbxBalance, setOrbxBalance] = useState("0");
  const [amount, setAmount] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function loadWeb3() {
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x89" }]
          });

          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const provider = new BrowserProvider(window.ethereum);
          const balance = await provider.getBalance(accounts[0]);
          setBalance(formatEther(balance));

          const signer = await provider.getSigner();
          const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
          const orbxBal = await contract.balanceOf(accounts[0]);
          setOrbxBalance(formatEther(orbxBal));

        } catch (error) {
          console.error("Erro ao conectar:", error);
        }
      }
    }
    loadWeb3();
  }, []);

  async function handleBuyOrbix() {
    if (!window.ethereum) {
      alert("MetaMask não detectada. Por favor, instale a MetaMask.");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Digite uma quantidade válida de ORBX.");
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

      const pricePerOrbix = "0.01";
      const totalCost = parseEther((Number(amount) * Number(pricePerOrbix)).toString());

      const tx = await contract.buyOrbix(amount, { value: totalCost });
      await tx.wait();

      alert(`Compra de ${amount} ORBX realizada com sucesso!`);

      const orbxBal = await contract.balanceOf(account);
      setOrbxBalance(formatEther(orbxBal));

    } catch (error) {
      console.error("Erro na compra:", error);
      alert("Erro ao comprar ORBX. Verifique a MetaMask e o saldo de MATIC.");
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
      <button className="button" onClick={handleBuyOrbix}>Comprar ORBX</button>

      <div className="button-container">
        <button className="button" onClick={() => setShowModal(true)}>
          <FaInfoCircle /> Sobre
        </button>
        <a href="https://x.com/ORBXTOKEN" target="_blank" className="button">
          <FaTwitter /> Twitter
        </a>
        <a href="https://www.instagram.com/orbix_token?igsh=ZjJ6Z2xxdnJrOTlk" target="_blank" className="button">
          <FaInstagram /> Instagram
        </a>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Sobre a Orbix</h2>
            <p>
              A Orbix é uma criptomoeda inovadora, criada para trazer segurança e valorização no mercado financeiro digital.
            </p>
            <button className="close-button" onClick={() => setShowModal(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
