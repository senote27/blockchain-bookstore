import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@material-ui/core';
import ipfs from '../utils/ipfs';
import axios from 'axios';

const AddBook = ({ accounts }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handlePdfUpload = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const handleImageUpload = (event) => {
    setImageFile(event.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Upload PDF file to IPFS
      const addedPdf = await ipfs.add(pdfFile);
      const pdfHash = addedPdf.path;

      // Upload image file to IPFS
      const addedImage = await ipfs.add(imageFile);
      const imageHash = addedImage.path;

      // Send data to backend
      await axios.post('http://localhost:5000/addBook', {
        title: title,
        pdfHash: pdfHash,
        imageHash: imageHash,
        price: window.web3.utils.toWei(price, 'ether'),
        authorAddress: accounts[0],
        sellerAddress: accounts[0],
      });

      alert('Book added successfully!');
      // Reset form fields
      setTitle('');
      setPrice('');
      setPdfFile(null);
      setImageFile(null);
    } catch (error) {
      console.error('Error uploading files to IPFS:', error);
      alert('Failed to add book.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Add New Book
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Book Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Price in ETH"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <div style={{ marginTop: '20px' }}>
          <Typography variant="subtitle1">Upload PDF File</Typography>
          <input type="file" accept=".pdf" onChange={handlePdfUpload} required />
        </div>
        <div style={{ marginTop: '20px' }}>
          <Typography variant="subtitle1">Upload Cover Image</Typography>
          <input type="file" accept="image/*" onChange={handleImageUpload} required />
        </div>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          style={{ marginTop: '20px' }}
        >
          Add Book
        </Button>
      </form>
    </Container>
  );
};

export default AddBook;