"use client";
import { useState, useEffect } from "react";
import { FaInfoCircle, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { BrowserProvider, Contract, formatUnits, parseEther } from "ethers";
import "./globals.css";

// Endereço do contrato ORBX na Polygon
const CONTRACT_ADDRESS = "0x6449D2BF7D7464bc4121175ca9C89C6a00fdcCaF"; 

// ABI do contrato ORBX
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
    "inputs": [{ "name": "owner", "type": "address" }],
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
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    async function loadWeb3() {
      if (window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          setProvider(provider);

          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const balance = await provider.getBalance(accounts[0]);
          setBalance(formatUnits(balance, 18));

          // Conectar ao contrato
          const signer = await provider.getSigner();
          const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
          setContract(contract);

          // Obter saldo de ORBX
          const orbxBalance = await contract.balanceOf(accounts[0]);
          setOrbxBalance(formatUnits(orbxBalance, 18));

        } catch (error) {
          console.error("Erro ao conectar à MetaMask:", error);
        }
      } else {
        alert("MetaMask não detectada!");
      }
    }
    loadWeb3();
  }, []);

  async function handleBuyTokens() {
    if (!contract) {
      alert("Contrato não conectado. Verifique sua MetaMask.");
      return;
    }

    try {
      const tx = await contract.buyTokens(parseEther(amount), {
        value: parseEther(amount), // Define o valor da transação
      });

      await tx.wait();
      alert(`Compra de ${amount} ORBX realizada com sucesso!`);

      // Atualiza o saldo de ORBX após a compra
      const updatedBalance = await contract.balanceOf(account);
      setOrbxBalance(formatUnits(updatedBalance, 18));

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
      <button className="button" onClick={handleBuyTokens}>Comprar ORBX</button>

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
