import React from 'react';
import Modal from 'react-modal';
import ClipLoader from "react-spinners/ClipLoader";
import Cookies from 'universal-cookie';
import { Button, TextField } from '@material-ui/core';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';
import config from '../config';

const LoginModal = (props) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  if (!props.isVisible) {
    // Short-circuit
    return null;
  }

  const requestClose = () => {
    props.onClose();
  };

  const login = () => {
    const userPool = new CognitoUserPool({
      UserPoolId: config.cognito.USER_POOL_ID,
      ClientId: config.cognito.APP_CLIENT_ID,
    });
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authenticationData = { Username: email, Password: password };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    return new Promise((resolve, reject) =>
      user.authenticateUser(authenticationDetails, {
        onSuccess: result => resolve(result),
        onFailure: err => reject(err)
      })
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    try {
      const cookies = new Cookies();
      await login()
        .then((res) => {
          cookies.set('cognito-auth', res.idToken.jwtToken, {
            path: '/',
            secure: true,
            httpOnly: false,
          });
        });
      console.log('Ayy we\'re in');
      fetch('https://journal.parthrparikh.com/prod/entries', {
        method: 'GET',
        headers: {
          'Authorization': cookies.get('cognito-auth'),
        },
      })
      .then(res => res.text())
      .then(data => console.log(data));
    } catch (e) {
      alert(e);
    }
    setIsLoading(false);

    requestClose();
  };

  return (
    <Modal
        isOpen={props.isVisible}
        onRequestClose={props.onClose}
        contentLabel="Login Modal"
    >
      <form noValidate autoComplete='off'>
        <div>
          <TextField
            id='username-input'
            label='Email'
            required
            variant='outlined'
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            id='password-input'
            label='Password'
            required
            type='password'
            variant='outlined'
            autoComplete='current-password'
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <Button
          type='submit'
          variant='contained'
          color='primary'
          onClick={handleSubmit}
        >
          Login
        </Button>
      </form>
      <ClipLoader
        size={70}
        color={"#123abc"}
        loading={isLoading}
      />
    </Modal>
  )
}

Modal.setAppElement('body');

export default LoginModal;
