import React from 'react';
import PropTypes from 'prop-types';

/* Design Import */
import './SelectCourse.scss';

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

class SelectCourse extends React.Component {
  /* State */
  state = {
    courseList: []
  }

  /* Components */

  /* Method */
  async componentDidMount() {
    await getData('/api/course', (res) => {
      this.setState({ courseList: res.data.success });
    }, (err) => {
      this.setState({ courseList: [] });
      console.log('Error ++++++++++');
    });
  }

  select = (courseCode) => {
    this.props.setCourse(courseCode);
    this.props.close();
  }

  render () {
    const { classes } = this.props;
    const courseList = this.state.courseList;
    return (
      <div className={'select_tags'}>
        <div className={'tag_icons'}>
          {courseList.map((cour) => {
            return <button onClick={() => { this.select(cour.code) }} className={'tag'}>
              <em>{ cour.name }</em>
            </button>
          })}
        </div>
      </div>
    );
  }
}

SelectCourse.propTypes = {
  close: PropTypes.func.isRequired,
  setCourse: PropTypes.func.isRequired
};

export default withStyles(useStyles, { withTheme: true })(SelectCourse);
