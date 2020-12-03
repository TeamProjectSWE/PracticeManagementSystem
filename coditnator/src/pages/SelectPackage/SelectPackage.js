import React from 'react';
import PropTypes from 'prop-types';

/* Design Import */
import './SelectPackage.scss';

/* Icon Import */

/* Material Import */
import {Button} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import {getData} from "../../common";

/* Custom Import */

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

class SelectPackage extends React.Component {
  /* State */
  state = {
    packList: []
  }

  /* Components */

  /* Method */
  async componentDidMount() {
    await getData('/api/package', (res) => {
      this.setState({ packList: res.data.success });
    }, (err) => {
      this.setState({ packList: [] });
      console.log('Error ++++++++++');
    });
  }

  select = (packageCode) => {
    this.props.setPackage(packageCode);
    this.props.close();
  }

  render () {
    const { classes } = this.props;
    const packList = this.state.packList;
    return (
      <div className={'select_tags'}>
        <div className={'tag_icons'}>
          {packList.map((pack) => {
            return <button onClick={() => { this.select(pack.code) }} className={'tag'}>
              <em>{ pack.name }</em>
            </button>
          })}
        </div>
      </div>
    );
  }
}

SelectPackage.propTypes = {
  close: PropTypes.func.isRequired,
  setPackage: PropTypes.func.isRequired
};

export default withStyles(useStyles, { withTheme: true })(SelectPackage);
