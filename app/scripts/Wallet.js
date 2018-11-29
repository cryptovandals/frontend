// @format
import React, { Component } from "react";
import styled from "styled-components";
import Web3 from "web3";
import Utils from "web3-utils";
import Spinner from "react-spinkit";
import Modal from "react-modal";

import Canvas from "./Canvas";
import getWeb3 from "./getWeb3";
import getContract from "./contracts";
import VandalizeMe from "../../deployment/contracts/VandalizeMe.json";

const Wrapper = styled.div`
  width: 100%;
  text-align: center;
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

const H1 = styled.h1`
  margin-bottom: 1.5em;
`;

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    width: "100%",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)"
  }
};

class Wallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      kitties: [],
      loading: false,
      modals: {}
    };
    this.toggleModal = this.toggleModal.bind(this);
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

  toggleModal(id) {
    return () => {
      const { modals } = this.state;
      modals[id] = !modals[id];
      this.setState({ modals });
    };
  }

  render() {
    const { kitties, loading, modals } = this.state;

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
          <H1>Vandalize your kittens!</H1>
          <KittenContainer>
            {kitties.map((kitty, i) => (
              <div key={i}>
                <KittyImage
                  onClick={this.toggleModal(i)}
                  src={kitty.image_url}
                />
                <Modal
                  isOpen={modals[i]}
                  onRequestClose={this.toggleModal(i)}
                  style={customStyles}
                  ariaHideApp={false}
                >
                  <Canvas kitty={kitty} />
                </Modal>
              </div>
            ))}
          </KittenContainer>
        </Wrapper>
      );
    }
  }
}

export default Wallet;
