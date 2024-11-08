import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
} from '@material-ui/core';

const BookCard = ({ book, buyBook }) => {
  const imageUrl = `https://ipfs.io/ipfs/${book.imageHash}`;

  return (
    <Card>
      <CardMedia
        component="img"
        alt={book.title}
        height="200"
        image={imageUrl}
        title={book.title}
      />
      <CardContent>
        <Typography gutterBottom variant="h5">
          {book.title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Price: {window.web3.utils.fromWei(book.price.toString(), 'ether')} ETH
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => buyBook(book.id, book.price)}
        >
          Buy Book
        </Button>
      </CardContent>
    </Card>
  );
};

export default BookCard;