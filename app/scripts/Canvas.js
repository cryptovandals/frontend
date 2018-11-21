// @format
import React, { Component } from "react";
import LC from "literallycanvas";
import LiterallyCanvas from "literallycanvas/lib/js/core/LiterallyCanvas";
import defaultOptions from "literallycanvas/lib/js/core/defaultOptions";
import "literallycanvas/lib/css/literallycanvas.css";
import IPFS from "ipfs-api";
import buffer from "buffer";
import dataUriToBuffer from "data-uri-to-buffer";

import getWeb3 from "./getWeb3";
import getContract from "./contracts";
import VandalizeMe from "../../deployment/contracts/VandalizeMe.json";
import CryptoVandals from "../../deployment/contracts/CryptoVandals.json";

class DrawCanvas extends Component {
  constructor(props) {
    super(props);
    defaultOptions.imageURLPrefix = "/lib/img";
    defaultOptions.backgroundColor = "white";
    defaultOptions.toolbarPosition = "top";
    defaultOptions.imageSize = { width: 500, height: 500 };

    this.lc = new LiterallyCanvas(defaultOptions);
    var newImage = new Image();
    newImage.crossOrigin = "Anonymous";
    newImage.src = props.kitty.image_url;
    this.lc.saveShape(
      LC.createShape("Image", { x: 0, y: 0, image: newImage, scale: 1 })
    );
    this.vandalize = this.vandalize.bind(this);
  }

  upload(image) {
    const ipfs = IPFS("ipfs.infura.io", "5001", { protocol: "https" });
    return new Promise(resolve => {
      image = dataUriToBuffer(image);
      ipfs.files.add(image, (err, result) => {
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

  async vandalize() {
    const ipfs = IPFS("ipfs.infura.io", "5001", { protocol: "https" });
    const web3 = await getWeb3();
    const account = (await web3.eth.getAccounts())[0];
    const networkId = await web3.eth.net.getId();
    const contractAddress = VandalizeMe.networks[networkId].address;
    const tokenId = parseInt(this.props.kitty._tokenId, 10);
    const name = "vandalized";
    const imageSrc = this.lc.getImage();
    console.log(imageSrc.toDataURL());
    const image = await this.upload(imageSrc.toDataURL());

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
  }
  render() {
    return (
      <div>
        <button onClick={this.vandalize}>vandalize</button>
        <LC.LiterallyCanvasReactComponent lc={this.lc} />
      </div>
    );
  }
}
export default DrawCanvas;
