import React from 'react';
import PropTypes from 'prop-types';

/* Design Import */
import './SelectProblems.scss';

/* Icon Import */

/* Material Import */
import {Button} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";

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

class SelectProblems extends React.Component {
  /* State */
  state = {
    selectList: []
  }

  /* Components */

  /* Method */
  componentDidMount() {

  }

  getProblemList = () => {
    return [
      {code: 'PROB000001', name: '문제 1'},
      {code: 'PROB000002', name: '문제 2'},
      {code: 'PROB000003', name: '문제 3'},
      {code: 'PROB000004', name: '문제 4'},
      {code: 'PROB000005', name: '문제 5'},
    ];
  }

  isSelected = (problem) => {
    let isExist = false;
    this.state.selectList.map((p) => {
      if(problem.code === p.code && problem.name === p.name)
        isExist = true;
    });
    return isExist;
  }

  selectProblem = (problem) => {
    if(!this.isSelected(problem))
      this.setState({ selectList: [...this.state.selectList, problem] });
  }

  selectComplete = () => {
    this.props.setProblems(this.state.selectList);
    this.props.close();
  }

  render () {
    const { classes } = this.props;
    const problemList = this.getProblemList();
    return (
      <div className={'select_problems'}>
        <div className={'problem_icons'}>
          {problemList.map((problem) => {
            return <button onClick={() => { this.selectProblem(problem) }} className={this.isSelected(problem) ? 'problem selected' : 'problem'}>
              <em>{problem.name}</em>
            </button>
          })}
        </div>
        <div className={'btn_box'}>
          <Button
            onClick={this.selectComplete}
            classes={{
              root: classes.root, // class name, e.g. `classes-nesting-root-x`
              label: classes.label, // class name, e.g. `classes-nesting-label-x`
            }}
            variant="contained"
            color="secondary"
          >
            <em>선택 완료</em>
          </Button>
        </div>
      </div>
    );
  }
}

SelectProblems.propTypes = {
  close: PropTypes.func.isRequired,
  setProblems: PropTypes.func.isRequired,
  code: PropTypes.string.isRequired
};

export default withStyles(useStyles, { withTheme: true })(SelectProblems);
