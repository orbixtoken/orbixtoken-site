"use client";
import { useState, useEffect } from "react";
import { FaInfoCircle, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { BrowserProvider, Contract, parseUnits, formatUnits } from "ethers";
import "./globals.css";

// Configurações do contrato
const CONTRACT_ADDRESS = "0x6449D2BF7D7464bc4121175ca9C89C6a00fdcCaF"; // Endereço do contrato ORBX na Polygon
const ABI = [
  // ABI mínima necessária para transferência
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
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
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const provider = new BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(accounts[0]);
        setBalance(formatUnits(balance, 18)); // Converter MATIC para formato legível

        // Obter saldo de ORBX
        const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);
        const orbxBalance = await contract.balanceOf(accounts[0]);
        setOrbxBalance(formatUnits(orbxBalance, 18));
      }
    }
    loadWeb3();
  }, []);

  // Função para comprar ORBX
  const buyOrbx = async () => {
    if (!window.ethereum) return alert("MetaMask não encontrada!");

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

      // Verifica saldo de MATIC antes da compra
      const userBalance = await provider.getBalance(account);
      const requiredMatic = parseUnits("0.1", 18); // Definir taxa de MATIC necessária
      if (userBalance.lt(requiredMatic)) {
        return alert("Saldo de MATIC insuficiente para gas fee!");
      }

      // Executa a compra (envia ORBX para o usuário)
      const tx = await contract.transfer(account, parseUnits(amount, 18));
      await tx.wait();

      alert("Compra realizada com sucesso!");
      window.location.reload(); // Atualiza o saldo
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
              A Orbix é uma criptomoeda inovadora na blockchain da Polygon, oferecendo segurança e valorização no mercado digital.
              Nossa missão é garantir confiabilidade e um futuro sólido para investidores.
            </p>
            <button className="close-button" onClick={() => setShowModal(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
