import React from 'react';
import Modal from 'react-modal';
import ClipLoader from "react-spinners/ClipLoader";
import { Button, TextField } from '@material-ui/core';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import ConfirmSignupModal from './ConfirmSignupModal';
import config from '../config';

const SignupModal = (props) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [newUser, setNewUser] = React.useState(null);

  if (!props.isVisible) {
    // Short-circuit
    return null;
  }

  const requestClose = () => {
    const nextModalToOpen = ConfirmSignupModal.name;
    props.onClose(nextModalToOpen);
  };

  const signup = async () => {
    const userPool = new CognitoUserPool({
      UserPoolId: config.cognito.USER_POOL_ID,
      ClientId: config.cognito.APP_CLIENT_ID,
    });
    return new Promise((resolve, reject) =>
      userPool.signUp(email, password, [], null, function(err, result) {
        if (err) {
            // alert(err.message || JSON.stringify(err));
            console.log(err.message || JSON.stringify(err));
            reject(err);
        }
        var user = result.user;
        console.log('user name is ' + user.getUsername());
        resolve(user);
      })
    );
    // return fetch('https://cognito-idp.us-east-1.amazonaws.com', {
    //   method: 'POST',
    //   headers: {
    //     'X-Amz-Target': 'AWSCognitoIdentityProviderService.SignUp',
    //     'Content-Type': 'application/x-amz-json-1.1', 
    //   },
    //   body: {
    //     'Username': email,
    //     'Password': password,
    //     'ClientId': config.cognito.APP_CLIENT_ID,
    //   }
    // })
    // .then(res => {
    //   console.log(res);
    //   return res.user;
    // });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    // TODO: Confirm passwords are equal
    try {
      const newUser = await signup(email, password);
      setNewUser(newUser);
    } catch (e) {
      // alert(e);
      console.log(e);
    }
    setIsLoading(false);

    requestClose();
  }

  return (
    <Modal
        isOpen={props.isVisible}
        onRequestClose={props.onClose}
        contentLabel="Signup Modal"
    >
      <form noValidate autoComplete='off'>
        <div>
          <TextField
            required
            id='username-input'
            label='Required'
            defaultValue='Username'
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            id='password-input'
            label='Password'
            type='password'
            autoComplete='current-password'
            onChange={(event) => setPassword(event.target.value)}
          />
          <TextField
            id='password-input'
            label='Confirm Password'
            type='password'
            autoComplete='current-password'
            onChange={(event) => setConfirmPassword(event.target.value)}
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
};

Modal.setAppElement('body');

export default SignupModal;
