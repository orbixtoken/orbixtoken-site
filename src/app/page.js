"use client";
import { useState, useEffect } from "react";
import { FaInfoCircle, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { BrowserProvider, Contract, formatUnits, parseUnits } from "ethers";
import "./globals.css";

const CONTRACT_ADDRESS = "0x6449D2BF7D7464bc4121175ca9C89C6a00fdcCaF"; // Endereço correto do contrato ORBX
const ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }],
    "name": "buyTokens",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
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
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const provider = new BrowserProvider(window.ethereum);
          const balance = await provider.getBalance(accounts[0]);
          setBalance(formatUnits(balance, 18));

          // Atualiza saldo de ORBX
          const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);
          const orbxBal = await contract.balanceOf(accounts[0]);
          setOrbxBalance(formatUnits(orbxBal, 18));
        } catch (error) {
          console.error("Erro ao conectar carteira:", error);
        }
      }
    }
    loadWeb3();
  }, []);

  const handleBuyORBX = async () => {
    if (!window.ethereum) {
      alert("MetaMask não detectado.");
      return;
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Digite uma quantidade válida.");
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

      // Define o valor correto de MATIC a ser enviado
      const maticValue = parseUnits((amount * 0.1).toString(), 18); // Ajuste a taxa de conversão se necessário

      console.log(`Tentando comprar ${amount} ORBX por ${maticValue.toString()} MATIC`);

      const tx = await contract.buyTokens(amount, { value: maticValue });
      await tx.wait();

      alert(`Compra de ${amount} ORBX realizada com sucesso!`);

      // Atualiza saldo de ORBX
      const updatedBalance = await contract.balanceOf(account);
      setOrbxBalance(formatUnits(updatedBalance, 18));
    } catch (error) {
      console.error("Erro na compra:", error);

      // Detecta erro de saldo insuficiente
      if (error.message.includes("insufficient funds")) {
        alert("Erro ao comprar ORBX: saldo insuficiente de MATIC.");
      } else if (error.message.includes("CALL_EXCEPTION")) {
        alert("Erro ao chamar a função no contrato. Verifique se o contrato está correto.");
      } else {
        alert("Erro ao comprar ORBX. Verifique a MetaMask e tente novamente.");
      }
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
        type="number"
        placeholder="Quantidade de ORBX"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="input-field"
      />
      <button className="button" onClick={handleBuyORBX}>Comprar ORBX</button>

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
              A Orbix é uma criptomoeda inovadora na blockchain Polygon, trazendo segurança e valorização para os investidores.
            </p>
            <button className="close-button" onClick={() => setShowModal(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
