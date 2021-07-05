import React from 'react';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';

const Home2 = (props) => {
  const [value, setValue] = React.useState('');
  const handleChange = (event) => {
    setValue(event.target.value);
  };

  // TODO: Remove
  function createData(timestamp, blurb) {
    return { timestamp, blurb };
  }

  // TODO: Remove
  const rows = [
    createData('2020.10.29 @ 12:00 UTC', 'Hello, Parikh'),
    createData('2020.10.29 @ 11:00 UTC', 'Hello, Parth'),
  ];

  return (
    <Container component='main' maxWidth='sm'>
      <form noValidate autoComplete='off'>
        <div>
          <TextField
            id='filled-multiline-flexible'
            label='Blurb'
            multiline
            style={{width: '100%'}}
            rowsMax={1}
            value={value}
            onChange={handleChange}
            variant='filled'
          />
        </div>
      </form>

      <div>&nbsp;</div>

      <TableContainer component={Paper}>
      <Table size='small' aria-label='a dense table'>
        <TableHead>
          <TableRow>
            <TableCell align='left'>Timestamp</TableCell>
            <TableCell align='left'>Blurb</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell align='left'>{row.timestamp}</TableCell>
              <TableCell align='left'>{row.blurb}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Container>
  );
}

export default Home2;
