// @format
import React, { Component } from "react";
import styled from "styled-components";
import Web3 from "web3";
import IPFS from "ipfs-api";
import buffer from "buffer";

import getWeb3 from "./getWeb3";
import VandalizeMe from "./VandalizeMe.json";
import CryptoVandals from "../contracts/CryptoVandals.json";

const Wrapper = styled.div`
  width: 100%;
  text-align: left;
`;

const KittenContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Input = styled.input`
  display: block;
`;

const KittyImage = styled.img`
  height: 150px;
  filter: grayscale(100%);
  &: hover {
    filter: grayscale(0%);
  }
`;

class Wallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      kitties: []
    };
    this.vandalize = this.vandalize.bind(this);
  }

  async getKitties(address) {
    let kitties;
    try {
      kitties = await fetch(
        "https://api.cryptokitties.co/kitties/all/" + address
      ).then(res => res.json());
    } catch (err) {
      alert(err);
    }

    return kitties;
  }

  async componentDidMount() {
    const web3 = await getWeb3();
    const account = (await web3.eth.getAccounts())[0];
    const kitties = await this.getKitties(account);
    this.setState({ kitties });
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
    const { kitties } = this.state;
    return (
      <Wrapper>
        <h1>Vandalize your kittens!</h1>
        <KittenContainer>
          {kitties.map((kitty, i) => (
            <KittyImage key={i} src={kitty.image_url} />
          ))}
        </KittenContainer>
      </Wrapper>
    );
  }
}

export default Wallet;
