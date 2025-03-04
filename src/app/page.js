"use client";
import { useState, useEffect } from "react";
import { FaInfoCircle, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { BrowserProvider, Contract, formatEther, formatUnits, parseUnits } from "ethers";
import "./globals.css";

// Endereço do contrato ORBX e ABI (deve ser substituído pelo contrato correto)
const CONTRACT_ADDRESS = "0xSEU_CONTRATO_AQUI";
const ABI = [
  // ABI reduzida para interagir com o contrato
  {
    "constant": false,
    "inputs": [{ "name": "_amount", "type": "uint256" }],
    "name": "buyOrbix",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
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
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const provider = new BrowserProvider(window.ethereum);
          const balance = await provider.getBalance(accounts[0]);
          setBalance(formatEther(balance));

          const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);
          const orbxBalance = await contract.balanceOf(accounts[0]);
          setOrbxBalance(formatUnits(orbxBalance, 18));
        } catch (error) {
          console.error("Erro ao conectar:", error);
        }
      }
    }
    loadWeb3();
  }, []);

  async function buyOrbix() {
    if (!window.ethereum) {
      alert("MetaMask não detectada!");
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.buyOrbix(parseUnits(amount, 18), { value: parseUnits("0.01", "ether") });
      await tx.wait();

      alert("Compra realizada com sucesso!");
      window.location.reload();
    } catch (error) {
      console.error("Erro ao comprar ORBX:", error);
      alert("Erro ao comprar ORBX. Verifique a MetaMask.");
    }
  }

  return (
    <div className="container">
      <h1 className="welcome-text">Bem vindo a Orbix</h1>
      <h2 className="subtitle">Orbix Token - A revolução das criptomoedas</h2>

      <p>Conecte sua MetaMask</p>
      <p>Saldo: {balance} ETH</p>
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
        <button className="button" onClick={() => setShowModal(true)}>
          <FaInfoCircle /> Sobre
        </button>
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Sobre a Orbix</h2>
            <p>
              A Orbix é uma criptomoeda inovadora, criada para trazer segurança e valorização no mercado financeiro digital.
              Nosso compromisso é garantir transparência, confiabilidade e um futuro sólido para os investidores.
              Com tecnologia avançada e suporte à blockchain da Polygon, a Orbix se destaca como uma moeda de alto potencial de crescimento.
            </p>
            <button className="close-button" onClick={() => setShowModal(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
