import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Web3 from 'web3';
import BookStoreContract from './contracts/BookStore.json';
import Navbar from './components/Navbar';
import UserDashboard from './components/UserDashboard';
import AuthorDashboard from './components/AuthorDashboard';
import FileUpload from './components/FileUpload';
import './App.css';

function App() {
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        initWeb3();
    }, []);

    const initWeb3 = async () => {
        try {
            // Modern dapp browsers
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                await window.ethereum.enable();
                
                const accounts = await web3Instance.eth.getAccounts();
                const networkId = await web3Instance.eth.net.getId();
                const deployedNetwork = BookStoreContract.networks[networkId];
                
                const contractInstance = new web3Instance.eth.Contract(
                    BookStoreContract.abi,
                    deployedNetwork && deployedNetwork.address,
                );

                setWeb3(web3Instance);
                setAccount(accounts[0]);
                setContract(contractInstance);

                // Listen for account changes
                window.ethereum.on('accountsChanged', (accounts) => {
                    setAccount(accounts[0]);
                });
            } 
            else {
                alert('Please install MetaMask to use this dApp!');
            }
        } catch (error) {
            console.error("Error initializing Web3:", error);
            alert('Failed to load web3 or contract. Check console for details.');
        }
    };

    if (!web3) {
        return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
        <Router>
            <div className="app">
                <Navbar account={account} userRole={userRole} />
                <div className="container">
                    <Switch>
                        <Route exact path="/">
                            <UserDashboard 
                                contract={contract} 
                                account={account}
                                web3={web3}
                            />
                        </Route>
                        <Route path="/author">
                            <AuthorDashboard 
                                contract={contract} 
                                account={account}
                                web3={web3}
                            />
                        </Route>
                        <Route path="/upload">
                            <FileUpload 
                                contract={contract}
                                account={account}
                                web3={web3}
                            />
                        </Route>
                    </Switch>
                </div>
            </div>
        </Router>
    );
}

export default App;