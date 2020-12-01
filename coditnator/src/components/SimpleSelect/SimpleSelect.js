import React from 'react';
import PropTypes from 'prop-types';

/* Design Import */
import './SimpleSelect.scss';

/* Icon Import */

/* Material Import */
import { makeStyles, withStyles } from '@material-ui/core/styles';
import {
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  InputBase
} from '@material-ui/core';

/* Custom Import */

const BootstrapInput = withStyles((theme) => ({
  root: {
    'label + &': {
      marginTop: theme.spacing(3),
    },
  },
  input: {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #ced4da',
    fontSize: 13,
    padding: '10px 15px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:focus': {
      borderRadius: 4,
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
    },
  },
}))(InputBase);

const useStyles = makeStyles((theme) => ({
  size: {
    width: '100%',
  },
}));

/* *** Change Event ***
const handleChange = (event) => {
  setAge(event.target.value);
};
*/

const SimpleSelect = props => {
  /* Props */
  const { title, items, start, changeEvent } = props;

  /* Const */
  const classes = useStyles();

  /* Components */

  /* Method */
  const printMenuItem = () => {
    return items.map((item) => {
      if(item.value === undefined || typeof item.value !== 'string')
        return null;
      else if(item.label === undefined || typeof item.value !== 'string')
        return null;
      return <MenuItem value={ item.value }>{ item.label }</MenuItem>
    });
  };

  return (
    <FormControl className={classes.size}>
      <Select
        labelId="demo-customized-select-label"
        id="demo-customized-select"
        onChange={changeEvent}
        value={start}
        input={<BootstrapInput />}
      >
        { printMenuItem() }
      </Select>
    </FormControl>
  );
};

SimpleSelect.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  start: PropTypes.any.isRequired,
  changeEvent: PropTypes.func.isRequired
};

export default SimpleSelect;
