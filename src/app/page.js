"use client";
import { useState, useEffect } from "react";
import { FaInfoCircle, FaTwitter, FaInstagram } from "react-icons/fa";
import { BrowserProvider, Contract, parseUnits, formatUnits } from "ethers";
import "./globals.css";

// Configuração do contrato ORBX na Polygon
const CONTRACT_ADDRESS = "0x6449D2BF7D7464bc4121175ca9C89C6a00fdcCaF";
const ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
];

export default function Home() {
  const [account, setAccount] = useState("");
  const [maticBalance, setMaticBalance] = useState("0");
  const [orbxBalance, setOrbxBalance] = useState("0");
  const [amount, setAmount] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function loadBlockchainData() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const provider = new BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(accounts[0]);
        setMaticBalance(formatUnits(balance, 18));

        // Obtém saldo de ORBX
        const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);
        const orbxBalance = await contract.balanceOf(accounts[0]);
        setOrbxBalance(formatUnits(orbxBalance, 18));
      }
    }
    loadBlockchainData();
  }, []);

  // Função para comprar ORBX
  const buyOrbx = async () => {
    if (!window.ethereum) return alert("MetaMask não encontrada!");

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

      const userBalance = await provider.getBalance(account);
      const requiredMatic = parseUnits("0.1", 18); // Taxa mínima para gas

      if (userBalance.lt(requiredMatic)) {
        return alert("Saldo de MATIC insuficiente para gas fee!");
      }

      const tx = await contract.transfer(account, parseUnits(amount, 18));
      await tx.wait();

      alert("Compra realizada com sucesso!");
      window.location.reload(); // Atualiza a página para mostrar saldo atualizado
    } catch (error) {
      console.error("Erro na compra:", error);
      alert("Erro ao comprar ORBX. Verifique a MetaMask e tente novamente.");
    }
  };

  return (
    <div className="container">
      <h1 className="welcome-text">Bem-vindo à Orbix</h1>
      <h2 className="subtitle">Orbix Token - A revolução das criptomoedas</h2>

      <p>Conecte sua MetaMask</p>
      <p>Saldo: {maticBalance} MATIC</p>
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
              A Orbix é uma criptomoeda na blockchain da Polygon, garantindo segurança e valorização no mercado digital.
              Nossa missão é garantir confiabilidade e um futuro sólido para investidores.
            </p>
            <button className="close-button" onClick={() => setShowModal(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
