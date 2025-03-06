"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FaInfoCircle, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import "./globals.css";

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
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setAccount(accounts[0]);

          const provider = new ethers.BrowserProvider(window.ethereum);
          const balance = await provider.getBalance(accounts[0]);
          setBalance(ethers.formatEther(balance));

          const contract = new ethers.Contract(ORBX_CONTRACT, ORBX_ABI, provider);
          const orbxBal = await contract.balanceOf(accounts[0]);
          setOrbxBalance(ethers.formatEther(orbxBal));
        } catch (error) {
          console.error("Erro ao conectar carteira", error);
        }
      }
    };
    loadWallet();
  }, []);

  const buyOrbx = async () => {
    if (!account || !amount) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ORBX_CONTRACT, ORBX_ABI, signer);
      const tx = await contract.transfer(account, ethers.parseEther(amount));
      await tx.wait();
      alert("Compra de ORBX realizada com sucesso!");
    } catch (error) {
      console.error("Erro na compra", error);
      alert("Erro ao comprar ORBX. Verifique sua MetaMask e tente novamente.");
    }
  };

  return (
    <div className="container">
      <h1 className="title">Bem-vindo à Orbix</h1>
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
      <button className="button" onClick={buyOrbx}>Comprar ORBX</button>

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
