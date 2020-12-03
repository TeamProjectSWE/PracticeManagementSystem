import React from 'react';

import './Home.scss';
import Logo from '../../images/logo/logo.png';
import {Link} from "react-router-dom";
import {Add as AddIcon} from "@material-ui/icons";
import {Button} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";

/* Const */
const useStyles = (thema) => ({
    root: {
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        borderRadius: 3,
        border: 0,
        color: 'white',
        padding: '5px 10px',
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    },
    label: {
        textTransform: 'capitalize',
    },
});

class Home extends React.Component {

  render() {
      const { classes } = this.props;
      return (
          <div className={'page home'}>
              <div>
                  <img className={'home_logo'} src={Logo} alt={''} />
              </div>
              <div>
                  <Link to={'/auth/login'}>
                      <Button
                          onClick={() => {}}
                          classes={{
                              root: classes.root, // class name, e.g. `classes-nesting-root-x`
                              label: classes.label, // class name, e.g. `classes-nesting-label-x`
                          }}
                          variant="contained"
                          color="secondary"
                      >
                          로그인
                      </Button>
                  </Link>
              </div>
          </div>
      );
  }
}

export default withStyles(useStyles, { withTheme: true })(Home);
