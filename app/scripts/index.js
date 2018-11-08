// @format
import Web3 from "web3";
import IPFS from "ipfs-api";
import buffer from "buffer";

import getWeb3 from "./getWeb3";
import VandalizeMe from "./VandalizeMe.json";
import CryptoVandals from "./CryptoVandals.json";

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

    const toVandalize = new web3.eth.Contract(VandalizeMe, contractAddress);
    console.log(account, tokenId);
    try {
      const tx = await toVandalize.methods
        .approve(contractAddress, tokenId)
        .send({ from: account });
      console.log(tx);
    } catch (err) {
      console.log(err);
    }

    const tokenURI = {
      name,
      description: "A vandalized image...",
      image
    };

    const res = await ipfs.files.add(Buffer.from(JSON.stringify(tokenURI)));
    const hash = res[0].hash;

    const vandalizer = new web3.eth.Contract(
      CryptoVandals,
      "0x345ca3e014aaf5dca488057592ee47305d9b3e10"
    );
    try {
      console.log(contractAddress, account, "https://ipfs.infura-io/ipfs/"+hash, tokenId);
      const tx2 = await vandalizer.methods
        .mint(
          contractAddress,
          account,
          "https://ipfs.infura.io/ipfs/" + hash,
          tokenId
        )
        .send({ from: account });
    } catch (err) {
      console.log(err);
    }
  };
};
