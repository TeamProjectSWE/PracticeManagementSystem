import React from 'react';
import PropTypes from 'prop-types';

/* Design Import */
import './SimpleDialog.scss';

/* Icon Import */

/* Material Import */
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core';

/* Custom Import */

const SimpleDialog = props => {
  /* Props */
  const { open, onClose, data } = props;

  /* Const */

  /* Components */

  /* Method */

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{data.title !== 'undefined' ? data.title : null}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {data.content !== 'undefined' ? data.content : null}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={data.disagreeEvent !== 'undefined' ? data.disagreeEvent : onClose()} color="primary">
          {data.disagreeText !== 'undefined' ? data.disagreeText : null}
        </Button>
        <Button onClick={data.agreeEvent !== 'undefined' ? data.agreeEvent : onClose()} color="primary" autoFocus>
          {data.agreeText !== 'undefined' ? data.agreeText : null}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

SimpleDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

export default SimpleDialog;
