import React, { Component } from 'react';
import Cookies from 'universal-cookie';
import { Button } from '@material-ui/core';
import LoginModal from './components/LoginModal'
import SignupModal from './components/SignupModal'
import ConfirmSignupModal from './components/ConfirmSignupModal';
import EntrySubmission from './components/EntrySubmission';

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoginModalVisible: false,
      isSignupModalVisible: false,
      userIdToken: null,
      hasUserAuthenticated: false,
      modalVisibility: null,
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.checkUserAuthenticated = this.checkUserAuthenticated.bind(this);
  }

  componentDidMount() {
    this.checkUserAuthenticated();  // Call immediately on the first time
    this.userAuthenticationTimer = setInterval(
      () => this.checkUserAuthenticated(),
      10000
    );
  }

  componentWillUnmount() {
    clearInterval(this.userAuthenticationTimer);
  }

  checkUserAuthenticated() {
    const userIdToken = new Cookies().get('cognito-auth');
    this.setState({
      hasUserAuthenticated: userIdToken != null,
      userIdToken: userIdToken,
    });
  }

  openModal(modalType) {
    this.setState({ modalVisibility: modalType });
  }

  closeModal(nextModalToOpen = null) {
    this.openModal(nextModalToOpen);
    this.checkUserAuthenticated();
  }

  render() {
    return (
      <div className="Home">
        <div className="lander">
          <h1>Sup</h1>
          <p>Hardly working.</p>

          <Button onClick={() => this.openModal(LoginModal.name)}>
            Open Login Modal
          </Button>
          <Button onClick={() => this.openModal(SignupModal.name)}>
            Open Signup Modal
          </Button>
        </div>

        <div>
          {this.state.modalVisibility === LoginModal.name &&
            <LoginModal
              isVisible={true}
              onClose={this.closeModal}
            />
          }
          <SignupModal
            isVisible={this.state.modalVisibility === SignupModal.name}
            onClose={this.closeModal}
          />
          <ConfirmSignupModal
            isVisible={this.state.modalVisibility === ConfirmSignupModal.name}
            email='TODO: Remove this'
            onClose={this.closeModal}
          />
        </div>

        <div>
          {this.state.hasUserAuthenticated
            ? <EntrySubmission userIdToken={this.state.userIdToken} />
            : <div>Go sign in!</div>
          }
        </div>
      </div>
    );
  }
}

export default Home;
