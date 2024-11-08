import Web3 from 'web3';

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        window.ethereum
          .request({ method: 'eth_requestAccounts' })
          .then(() => resolve(web3))
          .catch((err) => reject(err));
      } catch (error) {
        reject(error);
      }
    } else {
      reject(new Error('MetaMask not found'));
    }
  });

export default getWeb3;