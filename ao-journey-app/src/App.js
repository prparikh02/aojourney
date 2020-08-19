import React, { Component } from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';
import Home from './Home'
import AppliedRoute from './components/AppliedRoutes';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <AppliedRoute path='/' exact component={Home} props={{}} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
