"use client";
import { useState, useEffect } from "react";
import { FaInfoCircle, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { BrowserProvider, Contract, formatUnits, parseUnits, parseEther } from "ethers";
import "./globals.css";

// Endereço do contrato na Polygon
const CONTRACT_ADDRESS = "0x6449D2BF7D7464bc4121175ca9C89C6a00fdcCaF";

// ABI do contrato (substitua pela sua ABI correta)
const ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function buyTokens(uint256 amount) payable"
];

export default function Home() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [orbxBalance, setOrbxBalance] = useState("0");
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function loadWeb3() {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const web3Provider = new BrowserProvider(window.ethereum);
          setProvider(web3Provider);

          const signer = await web3Provider.getSigner();
          const contractInstance = new Contract(CONTRACT_ADDRESS, ABI, signer);
          setContract(contractInstance);

          // Carrega os saldos
          const ethBalance = await web3Provider.getBalance(accounts[0]);
          setBalance(formatUnits(ethBalance, 18));

          const tokenBalance = await contractInstance.balanceOf(accounts[0]);
          setOrbxBalance(formatUnits(tokenBalance, 18));

        } catch (error) {
          console.error("Erro ao conectar com MetaMask:", error);
        }
      }
    }
    loadWeb3();
  }, []);

  // Função para verificar se a MetaMask está na rede Polygon
  async function checkNetwork() {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0x89") { // ID da rede Polygon Mainnet
        alert("Por favor, conecte-se à rede Polygon na MetaMask!");
        return false;
      }
      return true;
    }
    alert("MetaMask não detectada.");
    return false;
  }

  // Função para comprar ORBX
  async function handleBuyTokens() {
    if (!contract || !provider) {
      alert("Erro: Contrato não conectado. Verifique sua MetaMask.");
      return;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Insira um valor válido para comprar ORBX.");
      return;
    }

    const isPolygon = await checkNetwork();
    if (!isPolygon) return;

    try {
      const signer = await provider.getSigner();
      const pricePerToken = parseEther("0.01"); // Ajuste o preço por token, se necessário
      const totalCost = pricePerToken * parseFloat(amount);

      // Confirmação antes da compra
      const confirm = window.confirm(`Você deseja comprar ${amount} ORBX por ${totalCost} MATIC?`);
      if (!confirm) return;

      // Enviando transação para o contrato
      const tx = await contract.connect(signer).buyTokens(parseUnits(amount, 18), {
        value: totalCost.toString(),
        gasLimit: 200000
      });

      await tx.wait();
      alert(`Compra de ${amount} ORBX realizada com sucesso na Polygon!`);

      // Atualiza o saldo de ORBX após a compra
      const updatedBalance = await contract.balanceOf(account);
      setOrbxBalance(formatUnits(updatedBalance, 18));

    } catch (error) {
      console.error("Erro ao comprar ORBX na Polygon:", error);
      alert("Erro ao comprar ORBX. Verifique a MetaMask e se há MATIC suficiente para a compra.");
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
              A Orbix é uma criptomoeda inovadora criada na rede Polygon, garantindo segurança, escalabilidade e baixas taxas de transação.
            </p>
            <button className="close-button" onClick={() => setShowModal(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
