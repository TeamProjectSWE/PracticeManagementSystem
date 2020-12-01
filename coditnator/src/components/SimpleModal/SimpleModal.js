import React from 'react';
import PropTypes from 'prop-types';

/* Design Import */
import './SimpleModal.scss';

/* Icon Import */

/* Material Import */
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';

const getModalStyle = () => {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
};
const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 'content-box',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
  },
}));

const SimpleModal = props => {
  /* Props */
  const { title, open, close, body } = props;

  /* Const */
  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);

  /* Components */

  /* Method */

  return (
    <Modal
      open={open}
      onClose={close}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <div style={modalStyle} className={classes.paper}>
        {typeof title === 'string' ? <div className={'modal_title'}>
          { title }
        </div> : null}
        <div className={'modal_body'}>
          { body }
        </div>
      </div>
    </Modal>
  );
};

SimpleModal.propTypes = {
  title: PropTypes.string,
  open: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  body: PropTypes.element.isRequired
};

export default SimpleModal;
