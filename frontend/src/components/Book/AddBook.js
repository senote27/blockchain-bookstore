import React, { useState } from 'react';
import { useAuth } from '../Auth/AuthContext';
import { create } from 'ipfs-http-client';
import './AddBook.css';

const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' });

const AddBook = ({ onClose, onBookAdded }) => {
  const { user, web3, account } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    authorName: '',
    description: '',
    price: '',
    royaltyPercentage: '10',
    pdfFile: null,
    coverImage: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const uploadToIPFS = async (file) => {
    try {
      const added = await ipfs.add(file);
      return added.path;
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload files to IPFS
      const pdfHash = await uploadToIPFS(formData.pdfFile);
      const coverHash = await uploadToIPFS(formData.coverImage);

      // Convert price to Wei
      const priceInWei = web3.utils.toWei(formData.price, 'ether');

      // Add book to smart contract
      const contract = new web3.eth.Contract(BookStoreABI, CONTRACT_ADDRESS);
      await contract.methods.addBook(
        formData.title,
        priceInWei,
        pdfHash,
        coverHash,
        Number(formData.royaltyPercentage),
        formData.authorName
      ).send({ from: account });

      // Add book to backend
      const bookData = {
        title: formData.title,
        authorName: formData.authorName,
        description: formData.description,
        price: priceInWei,
        pdfHash,
        coverHash,
        royaltyPercentage: formData.royaltyPercentage
      };

      await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(bookData)
      });

      onBookAdded();
      onClose();
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="add-book-modal">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Add New Book</h2>
        
        <form onSubmit={handleSubmit} className="add-book-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="authorName">Author Name</label>
            <input
              type="text"
              id="authorName"
              name="authorName"
              value={formData.authorName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price (ETH)</label>
            <input
              type="number"
              id="price"
              name="price"
              step="0.001"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="royaltyPercentage">Author Royalty (%)</label>
            <input
              type="number"
              id="royaltyPercentage"
              name="royaltyPercentage"
              min="0"
              max="100"
              value={formData.royaltyPercentage}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pdfFile">PDF File</label>
            <input
              type="file"
              id="pdfFile"
              name="pdfFile"
              accept=".pdf"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="coverImage">Cover Image</label>
            <input
              type="file"
              id="coverImage"
              name="coverImage"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading}
          >
            {loading ? 'Adding Book...' : 'Add Book'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBook;