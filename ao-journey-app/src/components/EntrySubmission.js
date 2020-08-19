import React from 'react';
import { Button, TextField } from '@material-ui/core';
import { ClipLoader } from 'react-spinners';

const EntrySubmission = (props) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [entryText, setEntryText] = React.useState('');
  // const [defaultText, setEmptyText] = React.useState('');

  const postEntry = async () => {
    return fetch('https://journal.parthrparikh.com/prod/entries', {
      method: 'POST',
      headers: {
        'Authorization': props.userIdToken,
      },
      body: JSON.stringify({
        entryText: entryText,
      }),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    try {
      await postEntry()
        .then(res => res.text())
        .then(data => console.log(data));
    } catch (e) {
      alert(e);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <form noValidate autoComplete='off'>
        <div>
          <TextField
            id='entry-text-input'
            label='Your entry goes here'
            variant='outlined'
            onChange={(event) => setEntryText(event.target.value)}
          />
          <Button
            type='submit'
            variant='outline'
            color='primary'
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </form>
      <ClipLoader
        size={70}
        color={"#123abc"}
        loading={isLoading}
      />
    </div>
  )
};

export default EntrySubmission;
