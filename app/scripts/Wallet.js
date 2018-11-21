// @format
import React, { Component } from "react";
import styled from "styled-components";
import Web3 from "web3";
import Utils from "web3-utils";
import IPFS from "ipfs-api";
import buffer from "buffer";
import Spinner from "react-spinkit";

import getWeb3 from "./getWeb3";
import getContract from "./contracts";
import VandalizeMe from "../../deployment/contracts/VandalizeMe.json";
import CryptoVandals from "../../deployment/contracts/CryptoVandals.json";

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
      kitties: [],
      loading: false
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

  async getTokens(web3, address) {
    const contract = await getContract(web3, VandalizeMe);
    const outputs = await contract.getPastEvents("Transfer", {
      fromBlock: 0,
      toBlock: "latest",
      topics: [
        Utils.sha3("Transfer(address,address,uint256)"),
        Utils.padLeft(address, 64),
        null
      ]
    });
    const inputs = await contract.getPastEvents("Transfer", {
      fromBlock: 0,
      toBlock: "latest",
      topics: [
        Utils.sha3("Transfer(address,address,uint256)"),
        null,
        Utils.padLeft(address, 64)
      ]
    });

    for (let i = 0; i < outputs.length; i++) {
      const outputTokenId = outputs[i].returnValues._tokenId;
      for (let j = 0; j < inputs.length; j++) {
        const inputTokenId = inputs[j].returnValues._tokenId;
        if (outputTokenId === inputTokenId) {
          inputs.splice(j, 1);
        }
      }
    }

    const returnValues = inputs.map(event => event.returnValues);
    const tokenURIPromises = returnValues.map(({ _tokenId }) =>
      contract.methods.tokenURI(_tokenId).call()
    );
    let tokenURIs;
    try {
      tokenURIs = await Promise.all(tokenURIPromises);
    } catch (e) {
      // TODO: This isn't the right way to overcome this error. What to do?
      tokenURIs = [];
      for (let promises in tokenURIPromises) {
        tokenURIs.push("https://cantdecodestring.com");
      }
    }

    const tokenNamePromises = returnValues.map(() =>
      contract.methods.name().call()
    );
    const tokenNames = await Promise.all(tokenNamePromises);

    const tokenJSONPromises = tokenURIs.map(uri =>
      fetch(uri)
        .then(res => res.json())
        .catch(err => null)
    );
    const tokenJSON = await Promise.all(tokenJSONPromises);
    for (let i = 0; i < returnValues.length; i++) {
      returnValues[i].image_url = tokenJSON[i] && tokenJSON[i]["image"];
      returnValues[i].name = tokenNames[i];
    }

    return returnValues;
  }

  async componentDidMount() {
    let kitties;
    this.setState({ loading: true });
    const web3 = await getWeb3();
    const networkId = await web3.eth.net.getId();
    const account = (await web3.eth.getAccounts())[0];
    try {
      if (networkId === "1") {
        kitties = await this.getKitties(account);
      } else {
        kitties = await this.getTokens(web3, account);
      }
    } catch (err) {
      console.log(err);
    }
    this.setState({ kitties, loading: false });
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

    const vandalizeMe = await getContract(web3, VandalizeMe);
    try {
      const tx = await vandalizeMe.methods
        .approve(CryptoVandals.networks[config.networkId].address, tokenId)
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
    const cryptoVandals = await getContract(web3, CryptoVandals);
    try {
      const tx2 = await cryptoVandals.methods
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
    const { kitties, loading } = this.state;

    if (loading) {
      return (
        <Wrapper>
          <h1>Vandalize your kittens!</h1>
          <KittenContainer>
            <Spinner name="wave" color="black" />
          </KittenContainer>
        </Wrapper>
      );
    } else {
      return (
        <Wrapper>
          <h1>Vandalize your kittens!</h1>
          <KittenContainer>
            {kitties.map((kitty, i) => (
              <div>
                <KittyImage key={i} src={kitty.image_url} />
                {kitty._tokenId}
              </div>
            ))}
          </KittenContainer>
        </Wrapper>
      );
    }
  }
}

export default Wallet;
