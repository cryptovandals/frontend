// @format
import React, { Component } from "react";
import IPFS from "ipfs-api";
import buffer from "buffer";
import dataUriToBuffer from "data-uri-to-buffer";
import styled from "styled-components";

import getWeb3 from "./getWeb3";
import getContract from "./contracts";
import VandalizeMe from "../../deployment/contracts/VandalizeMe.json";
import CryptoVandals from "../../deployment/contracts/CryptoVandals.json";

const Wrapper = styled.div`
  color: black;
`;

class Vandalizer extends Component {
  constructor(props) {
    super(props);

    this.vandalize = this.vandalize.bind(this);
    this.onUpload = this.onUpload.bind(this);
    this.state = {};
  }

  upload(imageBuffer) {
    const ipfs = IPFS("ipfs.infura.io", "5001", { protocol: "https" });
    return new Promise(resolve => {
      ipfs.files.add(imageBuffer, (err, result) => {
        // Upload buffer to IPFS
        if (err) {
          console.error(err);
          return;
        }
        let url = `https://ipfs.io/ipfs/${result[0].hash}`;
        resolve(url);
      });
    });
  }

  onUpload() {
    const reader = new FileReader();
    const image = this.refs.image;
    reader.onloadend = () => {
      const imageBuffer = buffer.Buffer(reader.result);
      this.vandalize(imageBuffer);
    };
    reader.readAsArrayBuffer(image.files[0]);
  }

  async vandalize(imageBuffer) {
    const ipfs = IPFS("ipfs.infura.io", "5001", { protocol: "https" });
    const web3 = await getWeb3();
    const account = (await web3.eth.getAccounts())[0];
    const networkId = await web3.eth.net.getId();
    const contractAddress = VandalizeMe.networks[networkId].address;
    const tokenId = parseInt(this.props.kitty._tokenId, 10);
    const name = "vandalized";
    const image = await this.upload(imageBuffer);

    console.log(
      'step 1: make the NFT available to transfer by calling "approve".'
    );
    console.log(
      "        source contract:",
      contractAddress,
      "token id:",
      tokenId
    );

    const vandalizeMe = await getContract(web3, VandalizeMe);
    try {
      const tx = await vandalizeMe.methods
        .approve(CryptoVandals.networks[networkId].address, tokenId)
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
    const res = await ipfs.files.add(Buffer.from(JSON.stringify(tokenURI)), {
      pin: true
    });
    const hash = res[0].hash;

    console.log('step 3: "mint" a new token in the CryptoVandals contract.');
    console.log("        contract address:", CryptoVandals.address);
    const cryptoVandals = await getContract(web3, CryptoVandals);
    try {
      const tx2 = await cryptoVandals.methods
        .mint(
          account,
          contractAddress,
          tokenId,
          0,
          0,
          "https://ipfs.infura.io/ipfs/" + hash
        )
        .send({ from: account });
    } catch (err) {
      console.log(err);
      return;
    }
    this.toggleModal();
  }

  render() {
    return (
      <Wrapper>
        <h1>Todos</h1>
        <h1>1. Download your original Cryptokitty</h1>
        <h1>2. Vandalize it!</h1>
        <h1>3. Reupload it to create a new collectible.!</h1>
        <input ref="image" type="file" onChange={this.onUpload} />
      </Wrapper>
    );
  }
}

export default DrawCanvas;
