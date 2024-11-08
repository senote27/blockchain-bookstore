import React, { useState, useEffect } from 'react';
import { Typography, Grid, Card, CardContent, Button, Container } from '@material-ui/core';

const Purchases = ({ contract, accounts }) => {
  const [purchasedBooks, setPurchasedBooks] = useState([]);

  useEffect(() => {
    if (contract && accounts) {
      loadPurchases();
    }
    // eslint-disable-next-line
  }, [contract, accounts]);

  const loadPurchases = async () => {
    const purchases = await contract.methods.getPurchases(accounts[0]).call();
    const books = await Promise.all(
      purchases.map((id) => contract.methods.books(id).call())
    );
    setPurchasedBooks(books);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        My Purchases
      </Typography>
      <Grid container spacing={3}>
        {purchasedBooks.map((book) => (
          <Grid item xs={12} sm={6} md={4} key={book.id}>
            <Card>
              <CardContent>
                <Typography variant="h5">{book.title}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  href={`https://ipfs.io/ipfs/${book.pdfHash}`}
                  target="_blank"
                >
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Purchases;