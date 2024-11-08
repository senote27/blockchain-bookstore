import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid } from '@material-ui/core';
import BookCard from '../components/BookCard';

const Home = ({ contract, accounts }) => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    loadBooks();
    // eslint-disable-next-line
  }, []);

  const loadBooks = async () => {
    const response = await axios.get('http://localhost:5000/getBooks');
    setBooks(response.data);
  };

  const buyBook = async (bookId, price) => {
    try {
      await contract.methods.buyBook(bookId).send({
        from: accounts[0],
        value: price,
      });
      alert('Book purchased successfully!');
    } catch (error) {
      alert('Purchase failed.');
    }
  };

  return (
    <Grid container spacing={3}>
      {books.map((book) => (
        <Grid item xs={12} sm={6} md={4} key={book.id}>
          <BookCard book={book} buyBook={buyBook} />
        </Grid>
      ))}
    </Grid>
  );
};

export default Home;