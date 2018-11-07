// @format
import Web3 from "web3";
import IPFS from "ipfs-api";
import buffer from "buffer";

import getWeb3 from "./getWeb3";

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
    const contractAddress = document.querySelector(
      "input[name='contractAddress']"
    ).value;
    const tokenId = document.querySelector("input[name='tokenId']").value;
    const url = await upload();

    const contract = new web3.eth.Contract(ABI, contractAddress);
  };
};
