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
import { getData, postData, putData, deleteData } from '../../common'

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
    problemReturn: '',
    problemAnswer: '',
    problemParams: [],
    problemTestCases: [],
    problemTags: [],
    problemChoices: [],
    step: 0,
    selectTagsModal: false
  }

  /* Components */

  /* Method */
  /* Component Did Mount */
  async componentDidMount() {
    if(this.isExistCode()) {
      let problemCode = this.props.code;

      await getData(`/api/problem/${problemCode}`, async (res) => {
        const data = res.data.success;
        let parsed = JSON.parse(data.description);

        this.setState({
          problemType: data.type,
          problemName: data.name,
          problemDesc: parsed.text,
          problemRest: data.restriction,
          problemEntry: data.entry,
          problemReturn: JSON.parse(data.return),
          problemAnswer: parsed.answer !== 'undefined' ? parsed.answer : '',
          problemParams: this.parseParams(data),
          problemTestCases: await this.getTestCases(problemCode),
          problemTags: data.tags,
          problemChoices: parsed.choices !== 'undefined' ? parsed.choices : [],
        });
      }, (err) => {

      });
    }
  }

  parseParams = (data) => {
    let params = [];
    let parameters = JSON.parse(data.parameters);
    let parameterNames = JSON.parse(data.parameter_names);

    parameters.map((p, index) => {
      params.push({
        type: parameters[index],
        name: parameterNames[index]
      });
    });

    return params;
  };

  getTestCases = async (problemCode) => {
    let data = [];
    await getData(`/api/problem/${problemCode}/io/~`, (res) => {
      data = res.data.success;
    }, (err) => {

    });
    return data;
  };

  addProblemComplete = () => {
    // Problem 추가
    let sendData = {
      type: this.state.problemType,
      name: this.state.problemName,
      description: '',
      restriction: undefined,
      entry: undefined,
      return: undefined,
      parameters: undefined,
      parameter_names: undefined
    };

    let obj;
    switch(this.state.problemType) {
      case 'programming':
        let parameters = [];
        let parameterNames = [];

        obj = {
          text: this.state.problemDesc
        };

        this.state.problemParams.map((param) => {
          parameters.push(param.type);
          parameterNames.push(param.name);
        });

        sendData.restriction = this.state.problemRest;
        sendData.entry = this.state.problemEntry;
        sendData.return = JSON.stringify(this.state.problemReturn);
        sendData.parameters = JSON.stringify(parameters);
        sendData.parameter_names = JSON.stringify(parameterNames);
        break;
      case 'short':
        obj = {
          text: this.state.problemDesc,
          answer: this.state.problemAnswer
        };
        break;
      case 'multiple':
        obj = {
          text: this.state.problemDesc,
          choices: this.state.problemChoices,
          answer: this.state.problemAnswer
        };
        break;
    }
    sendData.description = JSON.stringify(obj);

    postData('/api/problem', sendData, (res) => {
      let newProblemCode = res.data.success;
      if(this.state.problemType === 'programming') {
        // 테스트 케이스 추가
        this.addNewTestCase(newProblemCode);
        // 태그 추가
        this.state.problemTags.map((tag) => {
          this.addNewTags(newProblemCode, tag);
        });
      }
      setTimeout(() => {
        this.props.close()
      }, 500);
    }, (err) => {

    });

    this.props.close(); // Modal Close
  };
  addNewTestCase = (newProblemCode) => {
    // 테스트 케이스 추가
    let sendData = {
      cases: this.state.problemTestCases
    };


    postData(`/api/problem/${newProblemCode}/io`, sendData, (res) => {

    }, (err) => {

    });
  };
  addNewTags = (newProblemCode, tag) => {
    // 태그 추가
    putData(`/api/problem/${newProblemCode}/tag/${tag}`, {}, (res) => {

    }, (err) => {

    });
  };

  modifyProblemComplete = () => {
    // Problem 수정
    let sendData = {
      type: this.state.problemType,
      name: this.state.problemName,
      description: '',
      restriction: undefined,
      entry: undefined,
      return: undefined,
      parameters: undefined,
      parameter_names: undefined
    };

    let obj;
    switch(this.state.problemType) {
      case 'programming':
        let parameters = [];
        let parameterNames = [];

        obj = {
          text: this.state.problemDesc
        };

        this.state.problemParams.map((param) => {
          parameters.push(param.type);
          parameterNames.push(param.name);
        });

        sendData.restriction = this.state.problemRest;
        sendData.entry = this.state.problemEntry;
        sendData.return = JSON.stringify(this.state.problemReturn);
        sendData.parameters = JSON.stringify(parameters);
        sendData.parameter_names = JSON.stringify(parameterNames);
        break;
      case 'short':
        obj = {
          text: this.state.problemDesc,
          answer: this.state.problemAnswer
        };
        break;
      case 'multiple':
        obj = {
          text: this.state.problemDesc,
          choices: this.state.problemChoices,
          answer: this.state.problemAnswer
        };
        break;
    }
    sendData.description = JSON.stringify(obj);


    const problemCode = this.props.code;
    putData(`/api/problem/${problemCode}`, sendData, (res) => {
      if(this.state.problemType === 'programming') {
        // 테스트 케이스 수정
        this.addNewTestCase(problemCode);
        // 태그 수정 (모든 태그 삭제 후 재추가)
        deleteData(`/api/problem/${problemCode}/tag`, (res) => {
          this.state.problemTags.map((tag) => {
            this.addNewTags(problemCode, tag);
          });
        }, (err) => {

        });
      }
      setTimeout(() => {
        this.props.close()
      }, 500);
    }, (err) => {

    });
  }

  getVariableTypes = () => {
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
    return items;
  }

  changeStep = (now) => {
    this.setState({ step: now });
  }

  isExistCode = () => {
    return typeof this.props.code === 'string';
  }
  isExistType = () => {
    return typeof this.props.type === 'string';
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
    copyParams.push({ type: this.getVariableTypes()[0].value, name: '' });
    this.setState({ problemParams: copyParams });
  };
  popParamsRow = () => {
    let copyParams = this.state.problemParams;
    copyParams.pop();
    this.setState({ problemParams: copyParams });
  };
  pushTestCaseRow = () => {
    let copyTestCase = this.state.problemTestCases;
    copyTestCase.push({ input: '', output: '', visible: true });
    this.setState({ problemTestCases: copyTestCase });
  };
  popTestCaseRow = () => {
    let copyTestCase = this.state.problemTestCases;
    copyTestCase.pop();
    this.setState({ problemTestCases: copyTestCase });
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
          {this.state.step === 4 ? this.printReturnForm() : null}
          {this.state.step === 5 ? this.printParamForm() : null}
          {this.state.step === 6 ? this.printTestCaseForm() : null}
          {this.state.step === 7 ? this.printSelectTagForm() : null}
          {this.state.step === 8 ? this.printCompleteBtn() : null}
        </table>
        <div className={'stepper'}>
          <SimpleStepper maxSteps={9} next={this.changeStep} back={this.changeStep} />
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
  printReturnForm = () => {
    return (
        <tbody>
        <tr>
          <th><em>결과값 자료형</em></th>
        </tr>
        <tr>
          <td>
            { this.printReturnFormSub() }
          </td>
        </tr>
        </tbody>
    );
  };
  printReturnFormSub = () => {
    const items = this.getVariableTypes();
    return (
        <table className={'sub_table return'}>
          <tbody>
          <tr>
            <th><em>Type</em></th>
            <td>
              <SimpleSelect
                  start={this.state.problemReturn}
                  title={'Type'}
                  items={items}
                  changeEvent={(event) => {
                    this.setState({ problemReturn: event.target.value });
                  }}
              />
            </td>
          </tr>
          </tbody>
        </table>
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
    const items = this.getVariableTypes();
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
    console.log(this.state.problemTestCases);
    return (
      <table className={'sub_table test_case'}>
        <tbody>
        {this.state.problemTestCases.map((testCase, index) => {
          return (
            <tr>
              <th><em>Input</em></th>
              <td>
                <input
                  type={'text'}
                  className={'design_form input_A necessary name'}
                  placeholder={'Input'}
                  value={this.state.problemTestCases[index].input}
                  onChange={(event) => {
                    let copyTestCase = this.state.problemTestCases;
                    testCase.input = event.target.value;
                    copyTestCase[index] = testCase;

                    this.setState({ problemTestCases: copyTestCase });
                  }}
                />
              </td>
              <th><em>Output</em></th>
              <td>
                <input
                  type={'text'}
                  className={'design_form input_A necessary name'}
                  placeholder={'Output'}
                  value={this.state.problemTestCases[index].output}
                  onChange={(event) => {
                    let copyTestCase = this.state.problemTestCases;
                    testCase.output = event.target.value;
                    copyTestCase[index] = testCase;

                    this.setState({ problemTestCases: copyTestCase });
                  }}
                />
              </td>
              <th><em>Visible</em></th>
              <td>
                <Checkbox
                  inputProps={{ 'aria-label': 'uncontrolled-checkbox' }}
                  checked={this.state.problemTestCases[index].visible}
                  onChange={(event) => {
                    let copyTestCase = this.state.problemTestCases;
                    testCase.visible = event.target.checked ? 1 : 0;
                    copyTestCase[index] = testCase;

                    this.setState({ problemTestCases: copyTestCase });
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
            onClick={this.isExistCode() ? this.modifyProblemComplete : this.addProblemComplete}
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
  code: PropTypes.string,
  type: PropTypes.string
};

export default withStyles(useStyles, { withTheme: true })(AddProblem);
