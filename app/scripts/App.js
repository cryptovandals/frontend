//@format
import React, { Component } from "react";
import Web3 from "web3";
import IPFS from "ipfs-api";
import buffer from "buffer";

import getWeb3 from "./getWeb3";
import VandalizeMe from "./VandalizeMe.json";
import CryptoVandals from "../contracts/CryptoVandals.json";
import logo from "../../assets/cryptovandals-logo.png";

class App extends Component {
  constructor(props) {
    super(props);
    this.vandalize = this.vandalize.bind(this);
  }

  upload() {
    const ipfs = IPFS("ipfs.infura.io", "5001", { protocol: "https" });
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = function() {
        const buf = buffer.Buffer(reader.result); // Convert data into buffer
        ipfs.files.add(buf, (err, result) => {
          // Upload buffer to IPFS
          if (err) {
            console.error(err);
            return;
          }
          let url = `https://ipfs.io/ipfs/${result[0].hash}`;
          resolve(url);
        });
      };
      const photo = this.refs.image;
      reader.readAsArrayBuffer(photo.files[0]);
    });
  }
  async vandalize() {
    const ipfs = IPFS("ipfs.infura.io", "5001", { protocol: "https" });
    const web3 = await getWeb3();
    const account = (await web3.eth.getAccounts())[0];
    const contractAddress = this.refs.contractAddress.value;
    const tokenId = parseInt(this.refs.tokenId.value, 10);
    const name = this.refs.name.value;
    const image = await this.upload();

    console.log(
      'step 1: make the NFT available to transfer by calling "approve".'
    );
    console.log(
      "        source contract:",
      contractAddress,
      "token id:",
      tokenId
    );

    const toVandalize = new web3.eth.Contract(VandalizeMe, contractAddress);
    try {
      const tx = await toVandalize.methods
        .approve(CryptoVandals.address, tokenId)
        .send({ from: account });
      console.log(tx);
    } catch (err) {
      console.log(err);
      return;
    }

    const tokenURI = {
      name,
      description: "A vandalized image...",
      image
    };

    console.log("step 2: upload new vandalized image to IPFS");
    const res = await ipfs.files.add(Buffer.from(JSON.stringify(tokenURI)));
    const hash = res[0].hash;

    console.log('step 3: "mint" a new token in the CryptoVandals contract.');
    console.log("        contract address:", CryptoVandals.address);
    const vandalizer = new web3.eth.Contract(
      CryptoVandals.abi,
      CryptoVandals.address
    );
    try {
      const tx2 = await vandalizer.methods
        .mint(
          account,
          contractAddress,
          "https://ipfs.infura.io/ipfs/" + hash,
          tokenId
        )
        .send({ from: account });
    } catch (err) {
      console.log(err);
      return;
    }
  }

  render() {
    return (
      <div>
        <h1>Vandalize Cryptokitty</h1>
        <img src={logo} />
        <br />
        <input type="text" ref="name" placeholder="new name" />
        <input
          type="text"
          ref="contractAddress"
          placeholder="contract address"
        />
        <input type="text" ref="tokenId" placeholder="tokenId" />
        <input type="file" ref="image" accept="image/png, image/jpeg" />
        <input
          type="submit"
          class="button"
          onClick={this.vandalize}
          value="Send Request"
        />
      </div>
    );
  }
}

export default App;
