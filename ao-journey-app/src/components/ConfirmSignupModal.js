import React from 'react';
import Modal from 'react-modal';
import ClipLoader from "react-spinners/ClipLoader";
import { Button, TextField } from '@material-ui/core';
import { CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import config from '../config';

const ConfirmSignupModal = (props) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [confirmationCode, setConfirmationCode] = React.useState('');

  if (!props.isVisible) {
    // Short-circuit
    return null;
  }

  const requestClose = () => {
    props.onClose();
  };

  const confirmSignup = async () => {
    const userPool = new CognitoUserPool({
      UserPoolId: config.cognito.USER_POOL_ID,
      ClientId: config.cognito.APP_CLIENT_ID,
    });
    const user = new CognitoUser({ Username: props.email, Pool: userPool });
    user.confirmRegistration(confirmationCode, true, (err, result) => {
      if (err) {
        alert(err.message || JSON.stringify(err));
          return;
      }
      console.log('call result: ' + result);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    await confirmSignup();
    setIsLoading(false);

    requestClose();
  }

  return (
    <Modal
        isOpen={props.isVisible}
        onRequestClose={props.onClose}
        contentLabel="Confirmation Modal"
    >
      <form noValidate autoComplete='off'>
        <div>
          <TextField
            required
            id='confirmation-code-input'
            defaultValue='ConfirmationCode'
            onChange={(event) => setConfirmationCode(event.target.value)}
          />
        </div>
        <Button
          type='submit'
          variant='contained'
          color='primary'
          onClick={handleSubmit}
        >
          Confirm
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

export default ConfirmSignupModal;
