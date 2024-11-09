import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import './AddBook.css';

const AddBook = ({ onClose, onBookAdded }) => {
  const { user, web3, account } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ipfsStatus, setIpfsStatus] = useState('checking');
  const [uploadProgress, setUploadProgress] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    authorName: '',
    description: '',
    price: '',
    royaltyPercentage: '10',
    pdfFile: null,
    coverImage: null
  });

  // IPFS client configuration
  const [ipfs, setIpfs] = useState(null);

  useEffect(() => {
    initializeIPFS();
  }, []);

  const initializeIPFS = async () => {
    try {
      const client = create({
        host: 'localhost',
        port: '5001',
        protocol: 'http',
        timeout: 30000 // 30 second timeout
      });

      // Test connection
      await client.id();
      setIpfs(client);
      setIpfsStatus('connected');
    } catch (error) {
      console.error('IPFS connection error:', error);
      setIpfsStatus('error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      // Reset progress for this file
      setUploadProgress(prev => ({
        ...prev,
        [name]: 0
      }));
    }
  };

  const uploadToIPFS = async (file) => {
    if (!ipfs) {
      throw new Error('IPFS client not initialized');
    }

    if (!file) {
      throw new Error('No file selected');
    }

    try {
      // Create a buffer from the file
      const buffer = await file.arrayBuffer();
      const content = Buffer.from(buffer);

      // Calculate total size for progress tracking
      const totalSize = content.length;
      let loaded = 0;

      // Upload file with progress tracking
      const added = await ipfs.add({
        path: file.name,
        content: content
      }, {
        progress: (bytes) => {
          loaded += bytes;
          const progress = (loaded / totalSize) * 100;
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.min(progress, 100)
          }));
        }
      });

      // Pin the file to make it persistent
      await ipfs.pin.add(added.cid);

      return {
        hash: added.path,
        size: added.size,
        name: file.name
      };
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error(`Failed to upload ${file.name} to IPFS`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (ipfsStatus !== 'connected') {
        throw new Error('IPFS is not connected. Please try again.');
      }

      // Validate form data
      if (!formData.title || !formData.pdfFile || !formData.coverImage) {
        throw new Error('Please fill in all required fields');
      }

      // Upload files to IPFS
      const pdfUpload = await uploadToIPFS(formData.pdfFile);
      const coverUpload = await uploadToIPFS(formData.coverImage);

      // Verify files are pinned
      const isPdfPinned = await verifyPin(pdfUpload.hash);
      const isCoverPinned = await verifyPin(coverUpload.hash);

      if (!isPdfPinned || !isCoverPinned) {
        throw new Error('Failed to verify file pinning');
      }

      // Convert price to Wei
      const priceInWei = ethers.utils.parseEther(formData.price);

      // Create book metadata
      const bookMetadata = {
        title: formData.title,
        authorName: formData.authorName,
        description: formData.description,
        pdfHash: pdfUpload.hash,
        coverHash: coverUpload.hash,
        price: formData.price,
        royaltyPercentage: formData.royaltyPercentage
      };

      // Upload metadata to IPFS
      const metadataUpload = await uploadToIPFS(
        new Blob([JSON.stringify(bookMetadata)], { type: 'application/json' })
      );

      // Add book to smart contract
      const contract = new web3.eth.Contract(BookStoreABI, CONTRACT_ADDRESS);
      const tx = await contract.methods.addBook(
        formData.title,
        priceInWei,
        metadataUpload.hash,
        Number(formData.royaltyPercentage)
      ).send({ from: account });

      // Add book to backend
      await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          ...bookMetadata,
          transactionHash: tx.transactionHash
        })
      });

      onBookAdded();
      onClose();
    } catch (error) {
      console.error('Error adding book:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyPin = async (hash) => {
    try {
      const pins = await ipfs.pin.ls({ paths: [hash] });
      return Array.from(pins).length > 0;
    } catch {
      return false;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="add-book-modal">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Add New Book</h2>

        <div className={`ipfs-status ${ipfsStatus}`}>
          IPFS Status: {ipfsStatus}
          {ipfsStatus === 'error' && (
            <button onClick={initializeIPFS}>Retry Connection</button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="add-book-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
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
            <label htmlFor="authorName">Author Name *</label>
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
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price (ETH) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.001"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="royaltyPercentage">Royalty Percentage *</label>
            <input
              type="number"
              id="royaltyPercentage"
              name="royaltyPercentage"
              value={formData.royaltyPercentage}
              onChange={handleChange}
              min="0"
              max="100"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pdfFile">PDF File *</label>
            <input
              type="file"
              id="pdfFile"
              name="pdfFile"
              onChange={handleFileChange}
              accept=".pdf"
              required
            />
            {uploadProgress[formData.pdfFile?.name] > 0 && (
              <div className="progress-bar">
                <div 
                  className="progress" 
                  style={{width: `${uploadProgress[formData.pdfFile.name]}%`}}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="coverImage">Cover Image *</label>
            <input
              type="file"
              id="coverImage"
              name="coverImage"
              onChange={handleFileChange}
              accept="image/*"
              required
            />
            {uploadProgress[formData.coverImage?.name] > 0 && (
              <div className="progress-bar">
                <div 
                  className="progress" 
                  style={{width: `${uploadProgress[formData.coverImage.name]}%`}}
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              disabled={loading || ipfsStatus !== 'connected'}
              className={loading ? 'loading' : ''}
            >
              {loading ? 'Adding Book...' : 'Add Book'}
            </button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;