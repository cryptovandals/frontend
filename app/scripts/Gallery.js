// @format
import React, { Component } from "react";
import styled from "styled-components";
import Spinner from "react-spinkit";

import getWeb3 from "./getWeb3";
import CryptoVandals from "../../build/contracts/CryptoVandals.json";
import getContract from "./contracts";

const Wrapper = styled.div`
  width: 100%;
  text-align: left;
`;

const GalleryImage = styled.img`
  height: 150px;
  width: 150px;
`;

const GalleryContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

class Gallery extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      tokens: []
    };
  }
  async getEvents() {
    this.setState({ loading: true });
    const web3 = await getWeb3();
    const cryptoVandals = getContract(web3, CryptoVandals);

    let events;
    try {
      events = await cryptoVandals.getPastEvents("allEvents", {
        fromBlock: 0,
        toBlock: "latest"
      });
    } catch (err) {
      alert(err);
    }
    // NOTE: Get all events where tokens are being generated from the 0x0
    // address
    events = events.filter(
      event =>
        event.returnValues._from ===
        "0x0000000000000000000000000000000000000000"
    );

    const tokenIds = events.map(event => event.returnValues._tokenId);

    const tokenURIs = await Promise.all(
      tokenIds.map(tokenId => cryptoVandals.methods.tokenURI(tokenId).call())
    );

    // NOTE: Because Promise.all is shit:
    // https://stackoverflow.com/a/52376500/1263876
    const tokenPromises = tokenURIs.map(async tokenURI => {
      try {
        return await fetch(tokenURI).then(res => res.json());
      } catch (e) {
        console.log(e);
      }
    });

    var tokens = await Promise.all(tokenPromises);
    this.setState({ tokens, loading: false });
  }

  async componentDidMount() {
    const events = await this.getEvents();
  }

  render() {
    const { tokens, loading } = this.state;

    if (loading) {
      return (
        <GalleryContainer>
          <Spinner name="wave" />
        </GalleryContainer>
      );
    } else {
      return (
        <Wrapper>
          <h1>Vandalized Gallery</h1>
          <GalleryContainer>
            {tokens.map(token => (
              <GalleryImage src={token && token.image} />
            ))}
          </GalleryContainer>
        </Wrapper>
      );
    }
  }
}

export default Gallery;
