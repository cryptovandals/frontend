// @format
import React, { Component } from "react";

import getWeb3 from "./getWeb3";
import CryptoVandals from "../contracts/CryptoVandals.json";

class Gallery extends Component {
  async getEvents() {
    const web3 = await getWeb3();
    const cryptoVandals = getContract(web3, CryptoVandals);

    const transfer = await cryptoVandals.getPastEvents("Transfer");
    console.log(transfer);
  }

  async componentDidMount() {
    const events = await this.getEvents();
  }

  render() {
    return <div>Gallery</div>;
  }
}

export default Gallery;
