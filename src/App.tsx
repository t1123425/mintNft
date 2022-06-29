import React,{useEffect}from "react";
import './styles/App.css';
// const twitterLogo = require('./assets/twitter-logo.svg');
import twitterLogo from "./assets/twitter-logo.svg";

// Constants
const TWITTER_HANDLE:String = '_buildspace';
const TWITTER_LINK:string = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK:String = '';
const TOTAL_MINT_COUNT:Number = 50;

const App = () => {
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );
  useEffect(()=>{
    console.log(twitterLogo);
  },[])
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {renderNotConnectedContainer()}
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
