"use client";
import { useState, useEffect } from "react";
import { FaInfoCircle, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { BrowserProvider, formatEther } from "ethers";
import "./globals.css";

export default function Home() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [orbxBalance, setOrbxBalance] = useState("0");
  const [amount, setAmount] = useState("");
  const [showModal, setShowModal] = useState(false); // Estado para exibir o modal

  useEffect(() => {
    async function loadWeb3() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const provider = new BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(accounts[0]);
        setBalance(formatEther(balance));
      }
    }
    loadWeb3();
  }, []);

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
      <button className="button">Comprar ORBX</button>

      <div className="button-container">
        {/* Botão Sobre agora exibe o modal */}
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

      {/* Modal com informações sobre a Orbix */}
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
