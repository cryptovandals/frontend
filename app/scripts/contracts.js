// @format

export default async function getContract(web3, jsonFile) {
  const networkId = await web3.eth.net.getId();
  return new web3.eth.Contract(
    jsonFile.abi,
    jsonFile.networks[networkId].address
  );
}
