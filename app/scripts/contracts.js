import config from "./config";

export default function getContract(web3, jsonFile) {
    return new web3.eth.Contract(
      jsonFile.abi,
      jsonFile.networks[config.networkId].address
    );
}
