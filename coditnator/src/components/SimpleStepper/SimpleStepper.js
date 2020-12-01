import React from 'react';
import PropTypes from 'prop-types';

/* Design Import */
import './SimpleStepper.scss';

/* Icon Import */

/* Material Import */
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
  MobileStepper,
  Button
} from '@material-ui/core';
import {
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@material-ui/icons';

/* Custom Import */

const useStyles = makeStyles({
  root: {
    width: '100%',
    backgroundColor: 'white',
    flexGrow: 1,
  },
});

const SimpleStepper = props => {
  /* Props */
  const { maxSteps, back, next } = props;

  /* Const */
  const classes = useStyles();
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);

  /* Components */

  /* Method */
  const handleBack = () => {
    if (typeof back === 'function') {
      back(activeStep - 1);
    }
    setActiveStep((prevActiveStep) => prevActiveStep - 1);

  };
  const handleNext = () => {
    if(typeof next === 'function') {
      next(activeStep + 1);
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };


  return (
    <MobileStepper
      variant="dots"
      steps={maxSteps}
      position="static"
      activeStep={activeStep}
      className={classes.root}
      nextButton={
        <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps-1}>
          Next
          {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
        </Button>
      }
      backButton={
        <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
          {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
          Back
        </Button>
      }
    />
  );
};

SimpleStepper.propTypes = {
  maxSteps: PropTypes.number.isRequired,
  back: PropTypes.func,
  next: PropTypes.func
};

export default SimpleStepper;
