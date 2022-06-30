import React,{useEffect,useState}from "react";
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";
import './styles/App.css';
// const twitterLogo = require('./assets/twitter-logo.svg');
import twitterLogo from "./assets/twitter-logo.svg";
import { ExternalProvider } from "@ethersproject/providers";
declare global { interface Window { ethereum?: ExternalProvider; } }
// Constants
const TWITTER_HANDLE:string = '_buildspace';
const TWITTER_LINK:string = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK:string = '';
const TOTAL_MINT_COUNT:Number = 50;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletConnected = async () => {
     const { ethereum } =  window;
     if(!ethereum){
      console.log("Make sure you have metamask!");
      return;
     }else{
      console.log("We have the ethereum object", ethereum);
     }

     const accounts = await ethereum.request?.({method: 'eth_accounts'});
    //  console.log('accounts',accounts);
     if (accounts.length !== 0) {
      const account:string = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  }
  const connectWallet = async () =>  {
    try{
     const { ethereum } =  window;
     if(!ethereum){
      alert("Get MetaMask!");
      return;
     }
     /*
      * Fancy method to request access to account.
      */
     const accounts = await ethereum.request?.({ method: "eth_requestAccounts" });
      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    }catch(error){
      console.log(error);
    }
  }
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );
  //mintNFT
  const askContractToMintNft = async () => {
     const CONTRACT_ADDRESS:string = process.env.REACT_APP_NFT_CONTRACT?process.env.REACT_APP_NFT_CONTRACT:'';
     try{
          const { ethereum } = window;
          if(ethereum){
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
            console.log("Going to pop wallet now to pay gas...")
          let nftTxn = await connectedContract.makeAnEpicNFT();

          console.log("Mining...please wait.")
          await nftTxn.wait();
          console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        } else {
          console.log("Ethereum object doesn't exist!");
        }
     }catch(error){
       console.log(error)
     }
  }
  useEffect(()=>{
    checkIfWalletConnected();
  },[])
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === ''?(
            renderNotConnectedContainer()
          ):(
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
