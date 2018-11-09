// @format
import Web3 from "web3";
import IPFS from "ipfs-api";
import buffer from "buffer";

import getWeb3 from "./getWeb3";
import VandalizeMe from "./VandalizeMe.json";
import CryptoVandals from "../contracts/CryptoVandals.json";

window.onload = function() {
  const ipfs = IPFS("ipfs.infura.io", "5001", { protocol: "https" });

  function upload() {
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
      const photo = document.querySelector("input[name='image']");
      reader.readAsArrayBuffer(photo.files[0]);
    });
  }
  document.querySelector(".button").onclick = async function() {
    const web3 = await getWeb3();
    const account = (await web3.eth.getAccounts())[0];
    const contractAddress = document.querySelector(
      "input[name='contractAddress']"
    ).value;
    const tokenId = document.querySelector("input[name='tokenId']").value;
    const name = document.querySelector("input[name='name']").value;
    const image = await upload();

    console.log('step 1: make the NFT available to transfer by calling "approve".')
    console.log('        source contract:', contractAddress , 'token id:', tokenId)

    const toVandalize = new web3.eth.Contract(VandalizeMe, contractAddress)
    try {
      const tx = await toVandalize.methods
        .approve(contractAddress, tokenId)
        .send({ from: account });
      console.log(tx);
    } catch (err) {
      console.log(err);
      return
    }

    const tokenURI = {
      name,
      description: "A vandalized image...",
      image
    };

    console.log('step 2: upload new vandalized image to IPFS')
    const res = await ipfs.files.add(Buffer.from(JSON.stringify(tokenURI)))
    const hash = res[0].hash;

    console.log('step 3: "mint" a new token in the CryptoVandals contract.')
    console.log('        contract address:', CryptoVandals.address)
    const vandalizer = new web3.eth.Contract(
      CryptoVandals.abi,
      CryptoVandals.address
    );
    try {
      console.log(contractAddress, account, "https://ipfs.infura-io/ipfs/"+hash, tokenId);
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
      return
    }
  };
};
