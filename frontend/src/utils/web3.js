import Web3 from 'web3';
import BookStoreABI from '../contracts/BookStore.json';

export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

let web3Instance = null;

export const initWeb3 = async () => {
  try {
    // Modern dapp browsers
    if (window.ethereum) {
      web3Instance = new Web3(window.ethereum);
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        throw new Error('User denied account access');
      }
    }
    // Legacy dapp browsers
    else if (window.web3) {
      web3Instance = new Web3(window.web3.currentProvider);
    }
    // Non-dapp browsers
    else {
      throw new Error('Non-Ethereum browser detected. Please install MetaMask!');
    }
    return web3Instance;
  } catch (error) {
    console.error('Web3 initialization error:', error);
    throw error;
  }
};

export const getContract = async () => {
  try {
    if (!web3Instance) {
      await initWeb3();
    }
    return new web3Instance.eth.Contract(BookStoreABI.abi, CONTRACT_ADDRESS);
  } catch (error) {
    console.error('Contract initialization error:', error);
    throw error;
  }
};

export const getAccounts = async () => {
  try {
    if (!web3Instance) {
      await initWeb3();
    }
    return await web3Instance.eth.getAccounts();
  } catch (error) {
    console.error('Error getting accounts:', error);
    throw error;
  }
};

export const toWei = (amount) => {
  return web3Instance.utils.toWei(amount.toString(), 'ether');
};

export const fromWei = (amount) => {
  return web3Instance.utils.fromWei(amount.toString(), 'ether');
};

export const listenToEvents = (contract, eventName, callback) => {
  contract.events[eventName]()
    .on('data', event => callback(null, event))
    .on('error', error => callback(error, null));
};