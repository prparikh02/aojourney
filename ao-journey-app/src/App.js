import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from './Home'
import Home2 from './Home2'
import Header from './Header';
import Footer from './Footer';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Header />
          <hr />
          <Switch>
            <Route exact path='/'>
              <Home />
            </Route>
            <Route path='/home'>
              <Home2 />
            </Route>
          </Switch>
          <Footer />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
