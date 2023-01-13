import React,{useEffect,useState}from "react";
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";
import twitterLogo from "./assets/twitter-logo.svg";
import loadingImg  from './assets/loading.gif';
import previewImage from './assets/spiderman-gwen.gif'
import { ExternalProvider } from "@ethersproject/providers";
import InfoBlock from './components/InfoBlock'
declare global { interface Window { ethereum?: ExternalProvider; } }
// Constants
const TWITTER_HANDLE:string = '_buildspace';
const TWITTER_LINK:string = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS:string = process.env.REACT_APP_NFT_CONTRACT?process.env.REACT_APP_NFT_CONTRACT:'';
type NFTInfo = {
  link:string
}
const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [popStatus,setpopStatus] = useState(false);
  const [NFTData,setNFTData] = useState<NFTInfo>({
    link:''
  })
  const [mintStatus,setMintStatus] = useState("init");
  const [totalMintCount,setTotalMintCount] = useState(0);
  const [leftMintTime,setLeftMintTime] = useState(0);

  const checkIfWalletConnected = async () => {
     const { ethereum } =  window;
     if(!ethereum){
      console.log("Make sure you have metamask!");
      return;
     }else{
      console.log("We have the ethereum object", ethereum);
     }
     const checkETHId = await checkETHChainId(ethereum);
      if(!checkETHId){
        return
      }
     const accounts = await ethereum.request?.({method: 'eth_accounts'});
    //  console.log('accounts',accounts);
     if (accounts.length !== 0) {
      const account:string = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener();
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
     const checkETHId = await checkETHChainId(ethereum);
     if(!checkETHId){
        return
      }
     const accounts = await ethereum.request?.({ method: "eth_requestAccounts" });
      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener();  
    }catch(error){
      console.log(error);
    }
  }

  const checkETHChainId = async (ethereum?: ExternalProvider) => {
    let chainId = await ethereum?.request?.({ method: 'eth_chainId' });
    //console.log("Connected to chain " + chainId);
    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
      return false;
    }else{
      return true;
    }
  }
  //setup listener
  const setupEventListener = async () => {
    try{
      const {ethereum} = window;
      if(ethereum){
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        // if(mintStatus === 'init'){
        //   await connectedContract.getNFTInfo();
        // }
        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("GetTotalNFTMint",(totalNFT,mintTime)=>{
          setTotalMintCount(totalNFT.toNumber());
          setLeftMintTime(mintTime.toNumber());
        })
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          //console.log(from, tokenId.toNumber())
          setNFTData({
            link:`https://rinkeby.rarible.com/token/${CONTRACT_ADDRESS}:${tokenId.toNumber()}`
          })
          toggleWInfoModal(true);
          //alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });
        console.log("Setup event listener!")
      }else{
        console.log("Ethereum object doesn't exist!");
      }

    }catch(error){
      console.error(error);
    }
  }
  //mintNFT
  const askContractToMintNft = async () => {
     try{
          const { ethereum } = window;
          if(ethereum){
            const checkETHId = await checkETHChainId(ethereum);
            if(!checkETHId){
              return
            }
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
            console.log("Going to pop wallet now to pay gas...")
            let nftTxn = await connectedContract.makeAnEpicNFT();
            setMintStatus('minting');
            console.log("Mining...please wait.")
            await nftTxn.wait();
            setMintStatus('minted');
            console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        } else {
          console.log("Ethereum object doesn't exist!");
        }
     }catch(error){
      console.error('ContractError',error);
     }
  }
  //toggleWInfoModal
  const toggleWInfoModal = (status:boolean) =>  {
    setpopStatus(status);
  }
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );
  const renderConnectedContainer = () => {
    return (
      <div className="nftInfoBlock">
          
          {
            mintStatus === 'minting'?
             <div className="loadingBlock">
               <img src={loadingImg} alt="loading"/>
               <p>Minting... Please wait a mins</p>
             </div>
             :
             <>
              <p className="infoText">Click the below "Mint NFT" button get your hero name.</p>
              <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                Mint NFT
              </button>
             </>
          
          }
          {
            mintStatus === 'minted' && <h2>
            {leftMintTime} / {totalMintCount}  NFTs minted so far
          </h2>
          }
      </div>
    )
  }
  useEffect(()=>{
    checkIfWalletConnected();
  },[])
  return (
    <div className="App">
       {
          <InfoBlock link={NFTData.link}  open={popStatus} toggleFunction={toggleWInfoModal} />
        }
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Hero Names NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. This is time to get your HERO NAME NFT today.
          </p>
          <div className="previewBlock">
              <img src={previewImage} alt="preview" />
              <a href="https://testnets.opensea.io/collection/squarenft-cpbtafc8op" className="cta-button opensea-button link-btn" target="_blank" rel="noreferrer">🌊 View Collection on OpenSea</a>
          </div>
          {
            currentAccount === ''?(
              renderNotConnectedContainer()
            ):renderConnectedContainer()
          }
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
