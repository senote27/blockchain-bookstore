import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Web3 from 'web3';

const Login = () => {
  const [account, setAccount] = useState('');
  const history = useHistory();

  const handleLogin = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        history.push('/home');
      } catch (error) {
        console.error("User denied account access");
      }
    } else if (window.web3) {
      const web3 = new Web3(window.web3.currentProvider);
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      history.push('/home');
    } else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleLogin}>Login with MetaMask</button>
    </div>
  );
};

export default Login;