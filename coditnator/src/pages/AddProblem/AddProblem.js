import React from 'react';

/* Design Import */
import './AddProblem.scss';
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
import {SelectTags} from "../index";
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

class AddProblem extends React.Component {
  /* State */
  state = {
    problemType: '',
    problemName: '',
    problemDesc: '',
    problemRest: '',
    problemEntry: '',
    problemAnswer: '',
    problemParams: [],
    problemTestCase: [],
    problemTags: [],
    problemChoices: [],
    step: 0,
    selectTagsModal: false
  }

  /* Components */

  /* Method */
  /* Component Did Mount */
  componentDidMount() {
    if(this.isExistCode()) {
      this.setState({ problemType: 'programming' });
    }
  }

  addProblemToDB = () => {
    this.props.close(); // Modal Close
  };
  modifyProblemToDB = () => {
    this.props.close(); // Modal Close
  }

  changeStep = (now) => {
    this.setState({ step: now });
  }

  isExistCode = () => {
    return typeof this.props.code === 'string';
  }

  openSelectTagsModal = () => {
    this.setState({ selectTagsModal: true });
  };
  closeSelectTagsModal = () => {
    this.setState({ selectTagsModal: false });
  };

  setTags = (tags) => {
    this.setState({ problemTags: tags });
  };
  pushParamsRow = () => {
    let copyParams = this.state.problemParams;
    copyParams.push({ type: 'i32', name: '' });
    this.setState({ problemParams: copyParams });
  };
  popParamsRow = () => {
    let copyParams = this.state.problemParams;
    copyParams.pop();
    this.setState({ problemParams: copyParams });
  };
  pushTestCaseRow = () => {
    let copyTestCase = this.state.problemTestCase;
    copyTestCase.push({ input: '', output: '', visible: 1 });
    this.setState({ problemTestCase: copyTestCase });
  };
  popTestCaseRow = () => {
    let copyTestCase = this.state.problemTestCase;
    copyTestCase.pop();
    this.setState({ problemTestCase: copyTestCase });
  };
  pushChoiceRow = () => {
    let copyChoices = this.state.problemChoices;
    copyChoices.push('');
    this.setState({ problemChoices: copyChoices });
  };
  popChoiceRow = () => {
    let copyChoices = this.state.problemChoices;
    copyChoices.pop();
    this.setState({ problemChoices: copyChoices });
  };

  onChangeName = (e) => {
    this.setState({ problemName: e.target.value });
  };
  onChangeDesc = (e) => {
    this.setState({ problemDesc: e.target.value });
  };
  onChangeRest = (e) => {
    this.setState({ problemRest: e.target.value });
  };
  onChangeEntry = (e) => {
    this.setState({ problemEntry: e.target.value });
  };
  onChangeAnswer = (e) => {
    this.setState({ problemAnswer: e.target.value });
  };

  printTypeSelectForm = () => {
    /* Props */
    const { classes } = this.props;

    return (
      <div className={'select_type'}>
        <Button
          onClick={ () => this.setState({ problemType: 'programming' }) }
          classes={{
            root: classes.root, // class name, e.g. `classes-nesting-root-x`
            label: classes.label, // class name, e.g. `classes-nesting-label-x`
          }}
          startIcon={<Icon className="icon" path={ mdiCodeBraces } size={2.0}/>}
          variant="contained"
          color="secondary"
        >
          <em>프로그래밍 문제</em>
        </Button>
        <Button
          onClick={ () => this.setState({ problemType: 'short' }) }
          classes={{
            root: classes.root, // class name, e.g. `classes-nesting-root-x`
            label: classes.label, // class name, e.g. `classes-nesting-label-x`
          }}
          startIcon={<Icon className="icon" path={ mdiLeadPencil } size={2.0}/>}
          variant="contained"
          color="secondary"
        >
          <em>주관식 문제</em>
        </Button>
        <Button
          onClick={ () => this.setState({ problemType: 'multiple' }) }
          classes={{
            root: classes.root, // class name, e.g. `classes-nesting-root-x`
            label: classes.label, // class name, e.g. `classes-nesting-label-x`
          }}
          startIcon={<Icon className="icon" path={ mdiRadioboxMarked } size={2.0}/>}
          variant="contained"
          color="secondary"
        >
          <em>객관식 문제</em>
        </Button>
      </div>
    );
  }

  printProblemForm  = () => {
    switch (this.state.problemType) {
      case 'programming':
        return this.printProgrammingForm();
      case 'short':
        return this.printShortForm();
      case 'multiple':
        return this.printMultipleForm();
      default: return null;
    }
  }

  // 프로그래밍 문제 정보입력
  printProgrammingForm = () => {
    return (
      <div className={'problem_form'}>
        <table>
          {this.state.step === 0 ? this.printNameForm() : null}
          {this.state.step === 1 ? this.printDescForm() : null}
          {this.state.step === 2 ? this.printRestForm() : null}
          {this.state.step === 3 ? this.printEntryForm() : null}
          {this.state.step === 4 ? this.printParamForm() : null}
          {this.state.step === 5 ? this.printTestCaseForm() : null}
          {this.state.step === 6 ? this.printSelectTagForm() : null}
          {this.state.step === 7 ? this.printCompleteBtn() : null}
        </table>
        <div className={'stepper'}>
          <SimpleStepper maxSteps={8} next={this.changeStep} back={this.changeStep} />
        </div>
      </div>
    );
  }

  // 주관식 문제 정보입력
  printShortForm = () => {
    /* Props */
    const { classes } = this.props;

    return (
      <div className={'problem_form'}>
        <table>
          {this.state.step === 0 ? this.printNameForm() : null}
          {this.state.step === 1 ? this.printDescForm() : null}
          {this.state.step === 2 ? this.printAnswerForm() : null}
          {this.state.step === 3 ? this.printCompleteBtn() : null}
        </table>
        <div className={'stepper'}>
          <SimpleStepper maxSteps={4} next={this.changeStep} back={this.changeStep} />
        </div>
      </div>
    );
  }

  // 객관식 문제 정보입력
  printMultipleForm = () => {
    return (
      <div className={'problem_form'}>
        <table>
          {this.state.step === 0 ? this.printNameForm() : null}
          {this.state.step === 1 ? this.printDescForm() : null}
          {this.state.step === 2 ? this.printChoiceForm() : null}
          {this.state.step === 3 ? this.printAnswerForm() : null}
          {this.state.step === 4 ? this.printCompleteBtn() : null}
        </table>
        <div className={'stepper'}>
          <SimpleStepper maxSteps={5} next={this.changeStep} back={this.changeStep} />
        </div>
      </div>
    );
  }
  
  printNameForm = () => {
    return (
      <tbody>
      <tr>
        <th><em>문제 명칭</em></th>
      </tr>
      <tr>
        <td>
          <input
            type={'text'}
            className={'design_form input_A necessary name'}
            placeholder={'Name'}
            value={this.state.problemName}
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
            value={this.state.problemDesc}
            onChange={this.onChangeDesc}
          />
        </td>
      </tr>
      </tbody>
    );
  };
  printRestForm = () => {
    return (
      <tbody>
      <tr>
        <th><em>제한사항</em></th>
      </tr>
      <tr>
        <td>
          <textarea
            className={'design_form textarea_A necessary description'}
            placeholder={'Restriction'}
            value={this.state.problemRest}
            onChange={this.onChangeRest}
          />
        </td>
      </tr>
      </tbody>
    );
  };
  printEntryForm = () => {
    return (
      <tbody>
      <tr>
        <th><em>실행함수 명칭</em></th>
      </tr>
      <tr>
        <td>
          <input
            type={'text'}
            className={'design_form input_A necessary name'}
            placeholder={'Entry Function Name'}
            value={this.state.problemEntry}
            onChange={this.onChangeEntry}
          />
        </td>
      </tr>
      </tbody>
    );
  };
  printParamForm = () => {
    return (
      <tbody>
      <tr>
        <th>
          <em>실행함수 파라미터</em>
          <button className={'icon_btn'} onClick={this.pushParamsRow}><Icon path={ mdiPlus } size={0.5}/></button>
          <button className={'icon_btn'} onClick={this.popParamsRow}><Icon path={ mdiMinus } size={0.5}/></button>
        </th>
      </tr>
      <tr>
        <td>
          { this.printParamFormSub() }
        </td>
      </tr>
      </tbody>
    );
  };
  printParamFormSub = () => {
    const items = [
      { label: 'Int32', value: 'i32' },
      { label: 'Int64', value: 'i64' },
      { label: 'Float32', value: 'f32' },
      { label: 'Float64', value: 'f64' },
      { label: 'String', value: 'str' },

      { label: 'Int32 Array', value: '[i32]' },
      { label: 'Int64 Array', value: '[i64]' },
      { label: 'Float32 Array', value: '[f32]' },
      { label: 'Float64 Array', value: '[f64]' },
      { label: 'String Array', value: '[str]' },
    ];
    return (
      <table className={'sub_table params'}>
        <tbody>
        {this.state.problemParams.map((param, index) => {
          return (
            <tr>
              <th><em>Type</em></th>
              <td>
                <SimpleSelect
                  start={this.state.problemParams[index].type}
                  title={'Type'}
                  items={items}
                  changeEvent={(event) => {
                    let copyParams = this.state.problemParams;
                    param.type = event.target.value;
                    copyParams[index] = param;

                    this.setState({ problemParams: copyParams });
                  }}
                />
              </td>
              <th><em>Name</em></th>
              <td>
                <input
                  type={'text'}
                  className={'design_form input_A necessary name'}
                  placeholder={'Name'}
                  value={this.state.problemParams[index].name}
                  onChange={(event) => {
                    let copyParams = this.state.problemParams;
                    param.name = event.target.value;
                    copyParams[index] = param;

                    this.setState({ problemParams: copyParams });
                  }}
                />
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>
    );
  };
  printSelectTagForm = () => {
    /* Props */
    const { classes } = this.props;

    return (
      <tbody>
      <tr>
        <td>
          <Button
            onClick={this.openSelectTagsModal}
            classes={{
              root: classes.root, // class name, e.g. `classes-nesting-root-x`
              label: classes.label, // class name, e.g. `classes-nesting-label-x`
            }}
            variant="contained"
            color="secondary"
          >
            <em>태그 선택</em>
          </Button>
        </td>
      </tr>
      <tr>
        <td>
          {this.state.problemTags.map((tagName) => {
            return <Tag code={tagName} size={1} />;
          })}
        </td>
      </tr>
      <tr>
        <td>
          <SimpleModal
            open={this.state.selectTagsModal}
            close={this.closeSelectTagsModal}
            body={<SelectTags close={this.closeSelectTagsModal} setTags={this.setTags} />}
          />
        </td>
      </tr>
      </tbody>
    );
  };
  printTestCaseForm = () => {
    return (
      <tbody>
      <tr>
        <th>
          <em>테스트 케이스</em>
          <button className={'icon_btn'} onClick={this.pushTestCaseRow}><Icon path={ mdiPlus } size={0.5}/></button>
          <button className={'icon_btn'} onClick={this.popTestCaseRow}><Icon path={ mdiMinus } size={0.5}/></button>
        </th>
      </tr>
      <tr>
        <td>
          { this.printTestCaseFormSub() }
        </td>
      </tr>
      </tbody>
    );
  };
  printTestCaseFormSub = () => {
    return (
      <table className={'sub_table test_case'}>
        <tbody>
        {this.state.problemTestCase.map((testCase, index) => {
          return (
            <tr>
              <th><em>Input</em></th>
              <td>
                <input
                  type={'text'}
                  className={'design_form input_A necessary name'}
                  placeholder={'Input'}
                  value={this.state.problemTestCase[index].input}
                  onChange={(event) => {
                    let copyTestCase = this.state.problemTestCase;
                    testCase.input = event.target.value;
                    copyTestCase[index] = testCase;

                    this.setState({ problemTestCase: copyTestCase });
                  }}
                />
              </td>
              <th><em>Output</em></th>
              <td>
                <input
                  type={'text'}
                  className={'design_form input_A necessary name'}
                  placeholder={'Output'}
                  value={this.state.problemTestCase[index].output}
                  onChange={(event) => {
                    let copyTestCase = this.state.problemTestCase;
                    testCase.output = event.target.value;
                    copyTestCase[index] = testCase;

                    this.setState({ problemTestCase: copyTestCase });
                  }}
                />
              </td>
              <th><em>Visible</em></th>
              <td>
                <Checkbox
                  inputProps={{ 'aria-label': 'uncontrolled-checkbox' }}
                  checked={this.state.problemTestCase[index].visible}
                  onChange={(event) => {
                    let copyTestCase = this.state.problemTestCase;
                    testCase.visible = event.target.checked ? 1 : 0;
                    copyTestCase[index] = testCase;

                    this.setState({ problemTestCase: copyTestCase });
                  }}
                />
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>
    );
  };
  printAnswerForm = () => {
    return (
      <tbody>
      <tr>
        <th><em>정답</em></th>
      </tr>
      <tr>
        <td>
          <input
            type={'text'}
            className={'design_form input_A necessary name'}
            placeholder={'Answer'}
            value={this.state.problemAnswer}
            onChange={this.onChangeAnswer}
          />
        </td>
      </tr>
      </tbody>
    );
  };
  printChoiceForm = () => {
    return (
      <tbody>
      <tr>
        <th>
          <em>보기</em>
          <button className={'icon_btn'} onClick={this.pushChoiceRow}><Icon path={ mdiPlus } size={0.5}/></button>
          <button className={'icon_btn'} onClick={this.popChoiceRow}><Icon path={ mdiMinus } size={0.5}/></button>
        </th>
      </tr>
      <tr>
        <td>
          { this.printChoiceFormSub() }
        </td>
      </tr>
      </tbody>
    );
  };
  printChoiceFormSub = () => {
    return (
      <table className={'sub_table choices'}>
        <tbody>
        {this.state.problemChoices.map((choice, index) => {
          return (
            <tr>
              <th><em>보기 {index+1}</em></th>
              <td>
                <input
                  type={'text'}
                  className={'design_form input_A necessary name'}
                  placeholder={'Choice'}
                  value={this.state.problemChoices[index]}
                  onChange={(event) => {
                    let copyChoices = this.state.problemChoices;
                    copyChoices[index] = event.target.value;

                    this.setState({ problemChoices: copyChoices });
                  }}
                />
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>
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
            onClick={this.isExistCode() ? this.modifyProblemToDB : this.addProblemToDB}
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
      <div className={'page_modal add_problem_modal'}>
        { this.state.problemType === '' ? this.printTypeSelectForm() : this.printProblemForm() }
      </div>
    );
  };
}

AddProblem.propTypes = {
  close: PropTypes.func.isRequired,
  code: PropTypes.string
};

export default withStyles(useStyles, { withTheme: true })(AddProblem);
