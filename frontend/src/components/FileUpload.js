import React, { useState } from 'react';
import { create } from 'ipfs-http-client';

const FileUpload = ({ onUploadComplete, web3, contract, account }) => {
    const [uploading, setUploading] = useState(false);
    const [bookData, setBookData] = useState({
        title: '',
        price: '',
        royaltyPercentage: '',
        pdfHash: '',
        imageHash: ''
    });

    const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' });

    const handleFileUpload = async (event, fileType) => {
        try {
            setUploading(true);
            const file = event.target.files[0];
            const added = await ipfs.add(file);
            const hash = added.path;

            setBookData(prev => ({
                ...prev,
                [fileType === 'pdf' ? 'pdfHash' : 'imageHash']: hash
            }));
        } catch (error) {
            console.error('Error uploading to IPFS:', error);
            alert('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleMint = async () => {
        try {
            if (!bookData.pdfHash || !bookData.imageHash) {
                alert('Please upload both PDF and cover image');
                return;
            }

            const priceInWei = web3.utils.toWei(bookData.price, 'ether');
            
            const tx = await contract.methods.addBook(
                bookData.title,
                bookData.pdfHash,
                bookData.imageHash,
                priceInWei,
                account,
                Number(bookData.royaltyPercentage)
            ).send({ from: account });

            onUploadComplete(tx);
            alert('Book minted successfully!');
        } catch (error) {
            console.error('Error minting book:', error);
            alert('Failed to mint book');
        }
    };

    return (
        <div className="upload-container">
            <h2>Add New Book</h2>
            <div className="form-group">
                <label>Book Title:</label>
                <input
                    type="text"
                    value={bookData.title}
                    onChange={(e) => setBookData({...bookData, title: e.target.value})}
                    placeholder="Enter book title"
                />
            </div>

            <div className="form-group">
                <label>PDF File:</label>
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileUpload(e, 'pdf')}
                    disabled={uploading}
                />
                {bookData.pdfHash && <p>PDF uploaded to IPFS</p>}
            </div>

            <div className="form-group">
                <label>Cover Image:</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    disabled={uploading}
                />
                {bookData.imageHash && <p>Image uploaded to IPFS</p>}
            </div>

            <div className="form-group">
                <label>Price (ETH):</label>
                <input
                    type="number"
                    value={bookData.price}
                    onChange={(e) => setBookData({...bookData, price: e.target.value})}
                    step="0.01"
                />
            </div>

            <div className="form-group">
                <label>Royalty Percentage:</label>
                <input
                    type="number"
                    value={bookData.royaltyPercentage}
                    onChange={(e) => setBookData({...bookData, royaltyPercentage: e.target.value})}
                    min="0"
                    max="100"
                />
            </div>

            <button 
                onClick={handleMint}
                disabled={uploading || !bookData.title || !bookData.price}
                className="mint-button"
            >
                Mint Book
            </button>
        </div>
    );
};

export default FileUpload;