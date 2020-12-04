import React from 'react'
import PropTypes from "prop-types";

/* Design Import */
import './Assignments.scss';

/* Material Import */
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import {
  Add as AddIcon
} from '@material-ui/icons';

/* Custom Import */
import {
  SimpleTable,
  SimpleModal,
  SimpleDialog,
  SimpleStepper
} from '../../components';
import AddProblem from '../AddProblem';
import {getData, putData, postData, deleteData, getSession} from '../../common'

/* Data Import */
import {SelectPackage} from "../index";

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

class AddAssignment extends React.Component {
  state = {
    package: '',
    title: '',
    description: '',
    step: 0,
    modalFlag: false
  }

  componentDidMount() {

  }

  createAssignment = () => {
    let sendData = {
      package: this.state.package,
      title: this.state.title,
      description: this.state.description
    }

    const courseCode = this.props.course;
    postData(`/api/course/${courseCode}/assignment`, sendData, (res) => {
      setTimeout(() => {
        this.props.close();
      }, 500);
    }, (err) => {

    });
  }

  openModal = () => {
    this.setState({ modalFlag: true });
  }
  closeModal = () => {
    this.setState({ modalFlag: false });
  }

  printNameForm = () => {
    return (
        <tbody>
        <tr>
          <th><em>과제 명칭</em></th>
        </tr>
        <tr>
          <td>
            <input
                type={'text'}
                className={'design_form input_A necessary name'}
                placeholder={'명칭'}
                value={this.state.title}
                onChange={(e) => {
                  this.setState({ title: e.target.value })
                }}
            />
          </td>
        </tr>
        </tbody>
    );
  }

  printDescForm = () => {
    return (
        <tbody>
        <tr>
          <th><em>과제 설명</em></th>
        </tr>
        <tr>
          <td>
            <textarea
                className={'design_form textarea_A necessary description'}
                placeholder={'설명'}
                value={this.state.description}
                onChange={(e) => {
                  this.setState({ description: e.target.value });
                }}
            />
          </td>
        </tr>
        </tbody>
    );
  }

  printSelPacForm = () => {
    const { classes } = this.props;

    return (
        <tbody>
        <tr>
          <td>
            <Button
                onClick={this.openModal}
                classes={{
                  root: classes.root, // class name, e.g. `classes-nesting-root-x`
                  label: classes.label, // class name, e.g. `classes-nesting-label-x`
                }}
                variant="contained"
                color="secondary"
            >
              <em>패키지 선택</em>
            </Button>
          </td>
        </tr>
        <tr>
          <td>
            <em>{ this.state.package }</em>
          </td>
        </tr>
        <tr>
          <td>
            <SimpleModal
                open={this.state.modalFlag}
                close={this.closeModal}
                body={<SelectPackage close={this.closeModal} setPackage={(packageCode) => {
                  this.state.package = packageCode;
                }} />}
            />
          </td>
        </tr>
        </tbody>
    );
  }

  printCompleteForm = () => {
    const { classes } = this.props;

    return (
        <tbody>
        <tr>
          <td>
            <Button
                onClick={this.createAssignment}
                classes={{
                  root: classes.root, // class name, e.g. `classes-nesting-root-x`
                  label: classes.label, // class name, e.g. `classes-nesting-label-x`
                }}
                variant="contained"
                color="secondary"
            >
              <em>{'추가 완료'}</em>
            </Button>
          </td>
        </tr>
        </tbody>
    )
  }

  changeStep = (now) => {
    this.setState({ step: now });
  }

  render() {


    return (
        <div className={'page_modal modal_design add_course'}>
          <table>
            {this.state.step === 0 ? this.printNameForm() : null}
            {this.state.step === 1 ? this.printDescForm() : null}
            {this.state.step === 2 ? this.printSelPacForm() : null}
            {this.state.step === 3 ? this.printCompleteForm() : null}
          </table>
          <div className={'stepper'}>
            <SimpleStepper maxSteps={4} next={this.changeStep} back={this.changeStep} />
          </div>
        </div>
    );
  }
}

AddAssignment.propTypes = {
  close: PropTypes.func.isRequired,
  course: PropTypes.string.isRequired,
  code: PropTypes.string,
  session: {}
};

class Assignments extends React.Component {
  state = {
    modalFlagA: false,
    modalFlagB: false,
    dialogFlag: false,
    selectedAssignment: '',
    heads: [
      { id: 'title',       label: '명칭'},
      { id: 'description', label: '설명'},
    ],
    bodys: [],
    session: {}
  }
  /* Component Did Mount */
  async componentDidMount() {
    let tmp = await getSession(()=>{});
    this.setState({ session: tmp.data });

    await this.setBody();
  }

  setBody = async () => {
    const { match } = this.props;
    const courseCode = match.params.course_code;

    await getData(`/api/course/${courseCode}/assignment`, (res) => {
      this.setState({ bodys: res.data.success });
    }, (err) => {
      this.setState({ bodys: [] });
    });
  }

  openModalA = () => {
    this.setState({ modalFlagA: true });
  }
  closeModalA = () => {
    this.setState({ modalFlagA: false });
    this.setBody();
  }

  openModalB = (assignmentCode) => {
    this.setState({
      selectedAssignment: assignmentCode,
      modalFlagB: true
    });
  }
  closeModalB = () => {
    this.setState({ modalFlagB: false });
    this.setBody();
  }

  openDialog = (assignmentCode) => {
    this.setState({
      selectedAssignment: assignmentCode,
      dialogFlagA: true
    });
  }
  closeDialog = () => {
    this.setState({ dialogFlagB: false });
    this.setBody();
  }

  customEvent = (body) => {
    const { history } = this.props;
    history.push(`/problems/${body.package}/${body.code}`);
  }

  infoEvent = (body) => {
    // 미완
    this.openModalB(body.code);
  };

  deleteEvent = (body) => {
    this.setState({
      dialogFlag: true
    });
  }
  agreeEvent = () => {

  }
  disagreeEvent = () => {

  }

  /* Render */
  render() {
    /* Props */
    const { classes, match } = this.props;

    /* Const */
    const session = this.state.session.success;
    let level = session ? session.auth.level : 1;

    return (
        <div className={'page problems'}>
          {(level >= 2) ? <div className={'content'}>
                <div className={'btn_box'}>
                  <Button
                      onClick={this.openModalA}
                      classes={{
                        root: classes.root, // class name, e.g. `classes-nesting-root-x`
                        label: classes.label, // class name, e.g. `classes-nesting-label-x`
                      }}
                      variant="contained"
                      color="secondary"
                      startIcon={<AddIcon>send</AddIcon>}
                  >
                    과제 추가
                  </Button>
                </div>
              </div> : null}
          <div className={'content package_table'}>
            <SimpleTable
                heads={this.state.heads}
                bodys={this.state.bodys}
                customEvent={(level >= 2) ? null : this.customEvent}
                deleteEvent={(level >= 2) ? this.deleteEvent : null}
                infoEvent={(level >= 2) ? this.infoEvent : null}
                infoModal={
                  <SimpleModal
                      title={'과제 수정'}
                      open={this.state.modalFlagB}
                      close={this.closeModalB}
                      body={
                        <AddAssignment
                            classes={classes}
                            close={this.closeModalB}
                            course={this.props.match.params.course_code}
                            code={this.state.selectedAssignment}
                        />}
                  />
                }
            />
          </div>

          <SimpleModal
              title={'과제 추가'} open={this.state.modalFlagA}
              close={this.closeModalA}
              body={
                <AddAssignment
                    classes={classes}
                    close={this.closeModalA}
                    course={this.props.match.params.course_code}
                />}
          />
          <SimpleDialog
              open={this.state.dialogFlag}
              onClose={this.closeDialog}
              data={{
                title: '과제 삭제',
                content: '선택한 과제를 삭제하시겠습니까?',
                agreeText: 'YES',
                disagreeText: 'NO',
                agreeEvent: this.agreeEvent,
                disagreeEvent: this.disagreeEvent
              }}
          />
        </div>
    );
  }
}

export default withStyles(useStyles, { withTheme: true })(Assignments);
