import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { AuthProvider } from './components/Auth/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import UserDashboard from './components/User/UserDashboard';
import AuthorDashboard from './components/Author/AuthorDashboard';
import SellerDashboard from './components/Seller/SellerDashboard';
import Navigation from './components/Common/Navigation';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navigation />
          <div className="main-container">
            <Switch>
              <Route exact path="/" component={Login} />
              <Route path="/register" component={Register} />
              <PrivateRoute path="/user-dashboard" component={UserDashboard} />
              <PrivateRoute path="/author-dashboard" component={AuthorDashboard} />
              <PrivateRoute path="/seller-dashboard" component={SellerDashboard} />
            </Switch>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Private Route Component
const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useAuth();
  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/", state: { from: props.location } }} />
        )
      }
    />
  );
};

export default App;