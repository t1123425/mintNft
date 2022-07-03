import React from "react";
import heyMyname from '../../assets/eminem-hey.gif';
interface infoData{
    link?:string,
    open:boolean,
    toggleFunction:(status:boolean) => void
}

const InfoModalBlock:React.FC<infoData> = (props) => {
    const closeWrap = () => {
        props.toggleFunction(false);
    }
    return (
        <div className={"modalWrap "+(props.open?'active':'')}>
            <div className="infoBlock">
                <span className="closeBtn" onClick={closeWrap}>X</span>
                <img src={heyMyname}  alt="Hi my name is .." />
                <h1>Hey there!</h1>
                <p>We've minted your NFT and sent it to your wallet. It may be blank right now. you can click the link below and check the NFT Metadata on Rarible:</p>
                <a href={props.link} target="_blank" rel="noreferrer" >Link of Your HERO NAME NFT.</a>
            </div>
        </div>
    )
} 

export default InfoModalBlock;