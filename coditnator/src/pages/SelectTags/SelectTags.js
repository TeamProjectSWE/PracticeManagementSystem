import React from 'react';
import PropTypes from 'prop-types';

/* Design Import */
import './SelectTags.scss';

/* Icon Import */

/* Material Import */
import {Button} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";

/* Custom Import */
import Tag from "../../components/Tag";

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

class SelectTags extends React.Component {
  /* State */
  state = {
    selectList: []
  }

  /* Components */

  /* Method */
  componentDidMount() {

  }

  selectTag = (tagName) => {
    if(!this.state.selectList.includes(tagName))
      this.setState({ selectList: [...this.state.selectList, tagName] });
  }

  selectComplete = () => {
    this.props.setTags(this.state.selectList);
    this.props.close();
  }

  render () {
    const { classes } = this.props;
    const tagList = ['Python', 'Ruby', 'Go', 'Java', 'JS', 'Kotlin', 'Swift', 'C', 'CPP', 'CS']
    return (
      <div className={'select_tags'}>
        <div className={'tag_icons'}>
          {tagList.map((tagName) => {
            return <button onClick={() => { this.selectTag(tagName) }} className={this.state.selectList.includes(tagName) ? 'tag selected' : 'tag'}>
              <Tag code={tagName} size={1} />
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

SelectTags.propTypes = {
  close: PropTypes.func.isRequired,
  setTags: PropTypes.func.isRequired
};

export default withStyles(useStyles, { withTheme: true })(SelectTags);
