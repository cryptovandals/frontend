//@format
import React, { Component } from "react";
import styled, { createGlobalStyle } from "styled-components";

import logo from "../../assets/cryptovandals-logo.png";
import Manifesto from "./Manifesto";
import Wallet from "./Wallet";
import Gallery from "./Gallery";
import DrawCanvas from "./Canvas";

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'IBM Plex Mono', monospace;
    background-color: black;
    color: white;
  }
`;

const Section = styled.section`
  background-color: ${props => props.backgroundColor};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70%;
  padding-left: 15%;
  padding-right: 15%;
  min-height: ${props => props.height};
`;

const Image = styled.img`
  max-height: 350px;
`;

const App = () => (
  <div>
    <GlobalStyle />
    <Section backgroundColor="black" color="white" height="65vh">
      <Image src={logo} />
    </Section>
    <Section backgroundColor="white" color="black" height="100vh">
      <Manifesto />
    </Section>
    <Section backgroundColor="black" color="white" height="65vh">
      <Gallery />
    </Section>
    <Section backgroundColor="white" color="black" height="65vh">
      <Wallet />
    </Section>
  </div>
);

export default App;
