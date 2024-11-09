import React, { useState, useEffect } from 'react';

const AuthorDashboard = ({ contract, account, web3 }) => {
    const [royalties, setRoyalties] = useState('0');
    const [authorBooks, setAuthorBooks] = useState([]);

    useEffect(() => {
        loadAuthorData();
    }, [contract, account]);

    const loadAuthorData = async () => {
        try {
            const royaltyAmount = await contract.methods
                .getAuthorRoyalties(account)
                .call();
            setRoyalties(web3.utils.fromWei(royaltyAmount, 'ether'));

            const allBooks = await contract.methods.getAllBooks().call();
            const authorBooks = allBooks.filter(book => 
                book.author.toLowerCase() === account.toLowerCase()
            );
            setAuthorBooks(authorBooks);
        } catch (error) {
            console.error('Error loading author data:', error);
        }
    };

    return (
        <div className="author-dashboard">
            <h2>Author Dashboard</h2>
            <div className="royalties-info">
                <h3>Total Royalties Earned</h3>
                <p>{royalties} ETH</p>
            </div>
            
            <div className="author-books">
                <h3>Your Books</h3>
                <div className="books-grid">
                    {authorBooks.map(book => (
                        <div key={book.id} className="book-item">
                            <img 
                                src={`https://ipfs.io/ipfs/${book.imageHash}`}
                                alt={book.title}
                            />
                            <h4>{book.title}</h4>
                            <p>Price: {web3.utils.fromWei(book.price, 'ether')} ETH</p>
                            <p>Royalty: {book.royaltyPercentage}%</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AuthorDashboard;