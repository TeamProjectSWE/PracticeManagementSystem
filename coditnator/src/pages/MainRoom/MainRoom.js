import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from "prop-types";

/* Design Import */
import './MainRoom.scss';

/* Icon Import */
import {
    mdiHeadQuestionOutline,
    mdiAccountCheckOutline,
    mdiGoogleClassroom,
    mdiClipboardText ,
    mdiEyeOutline,
    mdiTrashCanOutline
} from '@mdi/js';
import Icon from "@mdi/react";

/* Material Import */
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import {
    Add,
    Add as AddIcon
} from '@material-ui/icons';

/* Custom Import */
import {
    SimpleTable,
    SimpleModal, SimpleSelect
} from '../../components';
import AddProblem from '../AddProblem';
import { getData, putData, postData, deleteData, getSession } from '../../common'
import SimpleDialog from "../../components/SimpleDialog";
import SimpleStepper from "../../components/SimpleStepper";
import {SelectCourse} from "../index";


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

// 강의 추가 Modal
class AddCourse extends React.Component {
    state = {
        name: '',
        desc: ''
    }

    componentDidMount() {
        if(this.props.code) {
           // DB 처리 - 코드에 해당되는 강의 정보 불러오기
        }
    }

    createCourse = async () => {
        let sendData = {
            name: this.state.name,
            description: this.state.desc
        }
        await postData(`/api/course`, sendData, (res) => {
            this.props.close();
        }, (err) => {

        });
    };

    render() {
        const { classes } = this.props;

        return (
            <div className={'page_modal modal_design add_course'}>
                <table>
                    <tr>
                        <th><em>강의 명칭</em></th>
                    </tr>
                    <tr>
                        <td>
                            <input
                                type={'text'}
                                className={'design_form input_A necessary name'}
                                placeholder={'명칭'}
                                value={this.state.name}
                                onChange={(e) => {
                                    this.setState({ name: e.target.value })
                                }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th><em>강의 설명</em></th>
                    </tr>
                    <tr>
                        <td>
                            <textarea
                                className={'design_form textarea_A necessary description'}
                                placeholder={'설명'}
                                value={this.state.desc}
                                onChange={(e) => {
                                    this.setState({ desc: e.target.value });
                                }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <Button
                                onClick={this.createCourse}
                                classes={{
                                    root: classes.root, // class name, e.g. `classes-nesting-root-x`
                                    label: classes.label, // class name, e.g. `classes-nesting-label-x`
                                }}
                                variant="contained"
                                color="secondary"
                            >
                                <em>{ this.props.code ? '강의 수정' : '강의 개설' }</em>
                            </Button>
                        </td>
                    </tr>
                </table>
            </div>
        );
    }
}

AddCourse.propTypes = {
    close: PropTypes.func.isRequired,
    code: PropTypes.string
};


class QuestionManagement extends React.Component {
    state = {
        selectedAssignment: '',
        assignments : [],
        selectedQuestion: '',
        questions: [],
        title: '',
        description: '',
        step: 0,
        session: {}
    }

    async componentDidMount() {
        let tmp = await getSession(()=>{});
        this.setState({ session: tmp.data });

        const { course } = this.props;

        await getData(`/api/course/${course}/assignment`, (res) => {
            let data = [];
            res.data.success.map((assignment) => {
                data.push({
                    label: assignment.title,
                    value: assignment.code
                });
            });
            this.setState({ assignments: data });
        }, (err) => {
            this.setState({ assignments: [] });
        });
    }

    addQuestion = () => {
        let sendData = {
            title: this.state.title,
            description: this.state.description
        };
        postData(`api/assignment/${this.state.selectedAssignment}/question`, sendData, (res) => {
            this.props.close();
        }, (err) => {

        });
    }
    addAnswer = () => {
        let sendData = {
            description: this.state.description
        };
        postData(`/api/answer/${this.state.selectedQuestion}`, sendData, (res) => {
            this.props.close();
        }, (err) => {

        });
    }

    printAssignmentList = () => {
        return (
            <tbody>
            <tr>
                <th><em>과제 선택</em></th>
            </tr>
            <tr>
                <td>
                    <SimpleSelect
                        start={this.state.selectedAssignment}
                        title={'Assignments'}
                        items={this.state.assignments}
                        changeEvent={async (event) => {
                            this.setState({ selectedAssignment: event.target.value });

                            const session = this.state.session.success;
                            if(session && session.auth.level >= 2){ // Professor
                                await getData(`/api/assignment/${event.target.value}/question`, (res) => {
                                    let data = [];
                                    res.data.success.map((question) => {
                                        data.push({
                                            label: question.title,
                                            value: question.code
                                        });
                                    });
                                    this.setState({ questions: data });
                                }, (err) => {
                                    this.setState({ questions: [] });
                                });
                            }
                        }}
                    />
                </td>
            </tr>
            </tbody>
        );
    };

    printQuestionList = () => {
        return (
            <tbody>
            <tr>
                <th><em>질문 선택</em></th>
            </tr>
            <tr>
                <td>
                    <SimpleSelect
                        start={this.state.selectedQuestion}
                        title={'Problems'}
                        items={this.state.questions}
                        changeEvent={(event) => {
                            this.setState({ selectedQuestion: event.target.value });
                        }}
                    />
                </td>
            </tr>
            </tbody>
        );
    }

    printQuestionForm = () => {
        /* Props */
        const { classes } = this.props;

        return (
            <tbody>
            <tr>
                <th><em>질문 등록</em></th>
            </tr>
            <tr>
                <td>
                    <input
                        type={'text'}
                        className={'design_form input_A necessary name'}
                        placeholder={'제목'}
                        value={this.state.title}
                        onChange={(event) => {
                            this.setState({ title: event.target.value })
                        }}
                    />
                </td>
            </tr>
            <tr>
                <td>
                    <textarea
                        className={'design_form textarea_A necessary description'}
                        placeholder={'내용'}
                        value={this.state.description}
                        onChange={(event) => {
                            this.setState({ description: event.target.value })
                        }}
                    />
                </td>
            </tr>
            <tr>
                <td>
                    <Button
                        onClick={this.addQuestion}
                        classes={{
                            root: classes.root, // class name, e.g. `classes-nesting-root-x`
                            label: classes.label, // class name, e.g. `classes-nesting-label-x`
                        }}
                        variant="contained"
                        color="secondary"
                    >
                        <em>등록 완료</em>
                    </Button>
                </td>
            </tr>
            </tbody>
        );
    }

    printAnswerForm = () => {
        /* Props */
        const { classes } = this.props;
        
        return (
            <tbody>
            <tr>
                <th><em>답변 등록</em></th>
            </tr>
            <tr>
                <td>
                    <textarea
                        className={'design_form textarea_A necessary description'}
                        placeholder={'내용'}
                        value={this.state.description}
                        onChange={(event) => {
                            this.setState({ description: event.target.value })
                        }}
                    />
                </td>
            </tr>
            <tr>
                <td>
                    <Button
                        onClick={this.addAnswer}
                        classes={{
                            root: classes.root, // class name, e.g. `classes-nesting-root-x`
                            label: classes.label, // class name, e.g. `classes-nesting-label-x`
                        }}
                        variant="contained"
                        color="secondary"
                    >
                        <em>등록 완료</em>
                    </Button>
                </td>
            </tr>
            </tbody>
        );
    }

    changeStep = (now) => {
        this.setState({ step: now });
    }

    render() {
        const session = this.state.session.success;
        const level = session ? session.auth.level : 1;

        return (
            <div className={'question_form'}>
                <table>
                    {this.state.step === 0 ? this.printAssignmentList() : null}
                    {this.state.step === 1 && (level >= 2) ? this.printQuestionList() : null}
                    {this.state.step === 1 && (level < 2) ? this.printQuestionForm() : null}
                    {this.state.step === 2 ? this.printAnswerForm() : null}
                </table>
                <div className={'stepper'}>
                    <SimpleStepper maxSteps={(level >= 2) ? 3 : 2} next={this.changeStep} back={this.changeStep} />
                </div>
            </div>
        );
    }
}

QuestionManagement.propTypes = {
    close: PropTypes.func.isRequired,
    course: PropTypes.string.isRequired
}

class MainRoom extends React.Component {
  /* State */
  state = {
      session: {},
      courseList: [],
      modalFlagA: false,
      modalFlagB: false,
      modalFlagC: false,
      modalFlagD: false,
      dialogFlag: false,
      selectedCourseCode : ''
  }

  /* Components */

  /* Method */
  async componentDidMount() {
      await this.setBody();
  }

  setBody = async () => {

      let tmp = await getSession(()=>{});
      this.setState({ session: tmp.data });


      await getData('/api/my-course', (res) => {
          this.setState({ courseList: res.data.success });
      }, (err) => {
          this.setState({ courseList: [] });
          console.log('Error ++++++++++');
      });

       /*
      this.setState({
          session: {success:{user: {code: 'USER000005'},auth: {code: 'AUTH000006', level: 2}}},
          courseList: [
              { name: '강의 A', description: '설명설명', code: 'COUR000001' }
          ]
      })
        */
  }

  registCourse = async (courseCode) => {
      await postData(`/api/course/${courseCode}/enroll`, {}, (res) => {
          this.setBody();
      }, (err) => {

      });
  }

  openModalA = () => {
      this.setState({ modalFlagA: true });
  }
  closeModalA = async () => {
      this.setState({ modalFlagA: false });
      await this.setBody();
  }

  openModalB = (courseCode) => {
      this.setState({
          selectedCourseCode: courseCode,
          modalFlagB: true
      });
  }
  closeModalB = () => {
      this.setState({ modalFlagB: false });
  }

  openModalC = () => {
      this.setState({ modalFlagC: true });
  }
  closeModalC = () => {
      this.setState({ modalFlagC: false });
  }

  openModalD = (courseCode) => {
      this.setState({
          selectedCourseCode: courseCode,
          modalFlagD: true
      });
  }
  closeModalD = () => {
      this.setState({ modalFlagD: false });
  }

  openDialog = (courseCode) => {
      this.setState({
          selectedCourseCode: courseCode,
          dialogFlag: true
      });
  }
  closeDialog = () => {
      this.setState({ dialogFlag: false });
  }
  agreeEvent = () => {
      let courseCode = this.state.selectedCourseCode;

      // DB 처리 - 강의 폐강
  }
  disagreeEvent = () => {
      this.closeDialog();
  }

  printCourseCard = (course) => {
      return (
          <span className={'course_card_box'}>
              <span className={'course_card'}>
              <div className={'title'}>
                  <em>{ course.name }</em>
                  <span>
                      <button className={'icon_btn'} onClick={() => { this.openModalB(course.code) }}>
                          <Icon className="icon" path={ mdiEyeOutline} size={0.7}/>
                      </button>
                      <button className={'icon_btn'} onClick={() => { this.openDialog(course.code) }}>
                          <Icon className="icon" path={ mdiTrashCanOutline } size={0.7}/>
                      </button>
                  </span>
              </div>
              <div className={'description'}>{ course.description }</div>
              { this.printIconButtons(course.code) }
          </span>
          </span>
      );
  };
  printIconButtons = (courseCode) => {
      /*
      * 학생: 질문, 미팅룸, 출석, 과제
      * 교수: 질문, 미팅룸, 출석정보 수정, 과제 관리, 강의정보 수정
      * */
      const { classes } = this.props;
      const session = this.state.session.success;

      const userCode = session ? session.user.code : '';
      const authCode = session ? session.auth.code : '';
      const iconSize = 1.0;

      return (
          <div className={'icon_buttons'}>
              <Button
                  onClick={() => {
                      this.openModalD(courseCode);
                  }}
                  classes={{
                      root: classes.root, // class name, e.g. `classes-nesting-root-x`
                      label: classes.label, // class name, e.g. `classes-nesting-label-x`
                  }}
                  variant="contained"
                  color="secondary"
                  startIcon={<Icon className="icon" path={ mdiHeadQuestionOutline } size={iconSize}/>}
              >
                  질문 관리
              </Button>
              <Button
                  onClick={() => {}}
                  classes={{
                      root: classes.root, // class name, e.g. `classes-nesting-root-x`
                      label: classes.label, // class name, e.g. `classes-nesting-label-x`
                  }}
                  variant="contained"
                  color="secondary"
                  startIcon={<Icon className="icon" path={ mdiAccountCheckOutline  } size={iconSize}/>}
              >
                  출석정보 수정
              </Button>
              <Link to={`/roomPage/${courseCode}/${userCode}/${authCode}`}>
                  <Button
                      onClick={() => {}}
                      classes={{
                          root: classes.root, // class name, e.g. `classes-nesting-root-x`
                          label: classes.label, // class name, e.g. `classes-nesting-label-x`
                      }}
                      variant="contained"
                      color="secondary"
                      startIcon={<Icon className="icon" path={ mdiGoogleClassroom  } size={iconSize}/>}
                  >
                      미팅 룸
                  </Button>
              </Link>
              <Link to={`/assignments/${courseCode}`}>
                  <Button
                      onClick={() => {}}
                      classes={{
                          root: classes.root, // class name, e.g. `classes-nesting-root-x`
                          label: classes.label, // class name, e.g. `classes-nesting-label-x`
                      }}
                      variant="contained"
                      color="secondary"
                      startIcon={<Icon className="icon" path={ mdiClipboardText  } size={iconSize}/>}
                  >
                      과제 관리
                  </Button>
              </Link>
          </div>
      );
  };

  render() {
    /* Props */
    const { classes, match } = this.props;

    /* Const */
    const session = this.state.session.success;
    let level = session ? session.auth.level : 1;

    return (
        <div className={'page main_room'}>
          <div className={'content'} >
            <div className={'btn_box'}>
                {level >= 2 ? <Button
                    onClick={this.openModalA}
                    classes={{
                        root: classes.root, // class name, e.g. `classes-nesting-root-x`
                        label: classes.label, // class name, e.g. `classes-nesting-label-x`
                    }}
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon>send</AddIcon>}
                >
                    강의 개설
                </Button> : <Button
                    onClick={this.openModalC}
                    classes={{
                        root: classes.root, // class name, e.g. `classes-nesting-root-x`
                        label: classes.label, // class name, e.g. `classes-nesting-label-x`
                    }}
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon>send</AddIcon>}
                >
                    수강 신청
                </Button>}
            </div>
          </div>
          <div className={'content course_list'}>
              {this.state.courseList.map((course) => {
                  return this.printCourseCard(course);
              })}
          </div>

          <SimpleModal
              title={'강의 개설'} open={this.state.modalFlagA}
              close={this.closeModalA}
              body={<AddCourse classes={classes} close={this.closeModalA}/>}
          />
          <SimpleModal
              title={'강의 수정'} open={this.state.modalFlagB}
              close={this.closeModalB}
              body={<AddCourse classes={classes} close={this.closeModalB} code={this.state.selectedCourseCode}/>}
          />
            <SimpleModal
                title={'수강 신청'} open={this.state.modalFlagC}
                close={this.closeModalC}
                body={<SelectCourse close={this.closeModalC} setCourse={(courseCode) => {
                    this.registCourse(courseCode);
                }}/>}
            />
            <SimpleModal
                title={'질문 관리'} open={this.state.modalFlagD}
                close={this.closeModalD}
                body={<QuestionManagement close={this.closeModalD} course={this.state.selectedCourseCode} classes={classes}/>}
            />
          <SimpleDialog
              open={this.state.dialogFlag}
              onClose={this.closeDialog}
              data={{
                  title: '강의 폐강',
                  content: '선택한 강의를 폐강하시겠습니까?',
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

export default withStyles(useStyles, { withTheme: true })(MainRoom);
