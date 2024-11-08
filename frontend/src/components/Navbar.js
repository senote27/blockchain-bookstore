import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@material-ui/core';
import { NavLink } from 'react-router-dom';

const Navbar = () => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" style={{ flexGrow: 1 }}>
        Blockchain Bookstore
      </Typography>
      <Button color="inherit" component={NavLink} to="/" exact>
        Home
      </Button>
      <Button color="inherit" component={NavLink} to="/add-book">
        Add Book
      </Button>
      <Button color="inherit" component={NavLink} to="/purchases">
        My Purchases
      </Button>
    </Toolbar>
  </AppBar>
);

export default Navbar;