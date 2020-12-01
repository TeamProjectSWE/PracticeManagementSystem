import React from 'react';

/* Design Import */
import './AddPackage.scss';
import PropTypes from 'prop-types';

/* Icon Import */
import {
  mdiCodeBraces,
  mdiLeadPencil ,
  mdiRadioboxMarked,
  mdiPlus,
  mdiMinus
} from '@mdi/js';
import Icon from "@mdi/react";

/* Material Import */
import {
  Button,
  Checkbox
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

/* Custom Import */
import {SimpleModal, SimpleSelect, Tag} from "../../components";
import SimpleStepper from "../../components/SimpleStepper";
import {SelectProblems, SelectTags} from "../index";
import {rows} from "../Problems/data";

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

class AddPackage extends React.Component {
  /* State */
  state = {
    packageName: '',
    packageDesc: '',
    packageProblems: [],
    step: 0,
    selectProblemsModal: false
  }

  /* Components */

  /* Method */
  /* Component Did Mount */
  componentDidMount() {
    if(this.isExistCode()) {

    }
  }

  addPackageToDB = () => {
    this.props.close(); // Modal Close
  };
  modifyPackageToDB = () => {
    this.props.close(); // Modal Close
  }

  changeStep = (now) => {
    this.setState({ step: now });
  }

  isExistCode = () => {
    return typeof this.props.code === 'string';
  }

  openSelectProblemsModal = () => {
    this.setState({ selectProblemsModal: true });
  };
  closeSelectProblemsModal = () => {
    this.setState({ selectProblemsModal: false });
  };

  setProblems = (problems) => {
    this.setState({ packageProblems: problems });
  };

  onChangeName = (e) => {
    this.setState({ packageName: e.target.value });
  };
  onChangeDesc = (e) => {
    this.setState({ packageDesc: e.target.value });
  };

  printPackageForm  = () => {
    return (
      <div className={'package_form'}>
        <table>
          {this.state.step === 0 ? this.printNameForm() : null}
          {this.state.step === 1 ? this.printDescForm() : null}
          {this.state.step === 2 && this.isExistCode() ? this.printSelectProblemForm() : null}
          {this.state.step === (this.isExistCode() ? 3 : 2) ? this.printCompleteBtn() : null}
        </table>
        <div className={'stepper'}>
          <SimpleStepper maxSteps={this.isExistCode() ? 4 : 3} next={this.changeStep} back={this.changeStep} />
        </div>
      </div>
    );
  }

  printNameForm = () => {
    return (
      <tbody>
      <tr>
        <th><em>패키지 명칭</em></th>
      </tr>
      <tr>
        <td>
          <input
            type={'text'}
            className={'design_form input_A necessary name'}
            placeholder={'Name'}
            value={this.state.packageName}
            onChange={this.onChangeName}
          />
        </td>
      </tr>
      </tbody>
    );
  };
  printDescForm = () => {
    return (
      <tbody>
      <tr>
        <th><em>문제 설명</em></th>
      </tr>
      <tr>
        <td>
          <textarea
            className={'design_form textarea_A necessary description'}
            placeholder={'Description'}
            value={this.state.packageDesc}
            onChange={this.onChangeDesc}
          />
        </td>
      </tr>
      </tbody>
    );
  };
  printSelectProblemForm = () => {
    /* Props */
    const { classes } = this.props;

    return (
      <tbody>
      <tr>
        <td>
          <Button
            onClick={this.openSelectProblemsModal}
            classes={{
              root: classes.root, // class name, e.g. `classes-nesting-root-x`
              label: classes.label, // class name, e.g. `classes-nesting-label-x`
            }}
            variant="contained"
            color="secondary"
          >
            <em>문제 선택</em>
          </Button>
        </td>
      </tr>
      <tr>
        <td>
          {this.state.packageProblems.map((problem) => {
            return <span className={'problem'}>{ problem.name }</span>;
          })}
        </td>
      </tr>
      <tr>
        <td>
          <SimpleModal
            open={this.state.selectProblemsModal}
            close={this.closeSelectProblemsModal}
            body={<SelectProblems close={this.closeSelectProblemsModal} setProblems={this.setProblems} code={this.props.code} />}
          />
        </td>
      </tr>
      </tbody>
    );
  };
  printCompleteBtn = () => {
    /* Props */
    const { classes } = this.props;

    return (
      <tbody>
      <tr>
        <td>
          <Button
            onClick={this.isExistCode() ? this.modifyPackageToDB : this.addPackageToDB}
            classes={{
              root: classes.root, // class name, e.g. `classes-nesting-root-x`
              label: classes.label, // class name, e.g. `classes-nesting-label-x`
            }}
            variant="contained"
            color="secondary"
          >
            <em>{this.isExistCode() ? '수정 완료' : '추가 완료' }</em>
          </Button>
        </td>
      </tr>
      </tbody>
    );
  }

  render () {

    return (
      <div className={'page_modal add_package_modal'}>
        {this.printPackageForm()}
      </div>
    );
  };
}

AddPackage.propTypes = {
  close: PropTypes.func.isRequired,
  code: PropTypes.string
};

export default withStyles(useStyles, { withTheme: true })(AddPackage);
