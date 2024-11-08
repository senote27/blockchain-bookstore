import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import getWeb3 from './utils/getWeb3';
import BookStoreContract from './contracts/BookStore.json';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AddBook from './components/AddBook';
import Purchases from './components/Purchases';

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState(null);

  useEffect(() => {
    initWeb3();
    // eslint-disable-next-line
  }, []);

  const initWeb3 = async () => {
    try {
      const web3Instance = await getWeb3();
      const userAccounts = await web3Instance.eth.getAccounts();
      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = BookStoreContract.networks[networkId];
      const instance = new web3Instance.eth.Contract(
        BookStoreContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      setWeb3(web3Instance);
      setAccounts(userAccounts);
      setContract(instance);
    } catch (error) {
      alert('Failed to load web3, accounts, or contract.');
      console.error(error);
    }
  };

  return (
    <Router>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <Switch>
          <Route path="/" exact>
            <Home contract={contract} accounts={accounts} />
          </Route>
          <Route path="/add-book">
            <AddBook accounts={accounts} />
          </Route>
          <Route path="/purchases">
            <Purchases contract={contract} accounts={accounts} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;