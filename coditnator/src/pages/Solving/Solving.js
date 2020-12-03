import React from 'react';

/* Design Import */
import './Solving.scss';

/* Icon Import */

/* Material Import */
import { withStyles } from '@material-ui/core/styles';
import {
    Button,
    FormControl,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormLabel
} from '@material-ui/core';
import {
    Add as AddIcon
} from '@material-ui/icons';

/* Custom Import */
import { getData, postData } from '../../common'
import {SimpleSelect} from "../../components";
import { solveFile } from '../../common'

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

class Solving extends React.Component {
    /* State */
    state = {
        problemType: '',
        problemName: '',
        problemDesc: '',
        problemRest: '',
        problemEntry: '',
        problemAnswer: '',
        problemTags: [],
        problemChoices: [],
        selectedLanguage: 'python',
        code: '',
        executeResult: ''
    }

    /* Components */

    /* Method */
    async componentDidMount() {
        const { match } = this.props;
        let problemCode = match.params.problem_code;

        await getData(`/api/problem/${problemCode}`, async (res) => {
            const data = res.data.success;
            let parsed = JSON.parse(data.description);

            this.setState({
                problemType: data.type,
                problemName: data.name,
                problemDesc: parsed.text,
                problemRest: data.restriction,
                problemEntry: data.entry,
                problemAnswer: parsed.answer !== 'undefined' ? parsed.answer : '',
                problemTags: data.tags,
                problemChoices: parsed.choices !== 'undefined' ? parsed.choices : [],
            });
            this.getDefaultCodeForm();
        }, (err) => {

        });
    }

    // 테스트 실행
    testStart = () => {
        const { match } = this.props;
        let code = this.state.code.split('\n');
        let srcFile = new File(code, "fileName")
        solveFile(match.params.problem_code, srcFile, this.state.selectedLanguage, (res) => {
            const cases = res.data.success.cases;
            let text = '';

            cases.map((res, index) => {
                text += 'Test case ' + (index+1) + ' : ' + (res.result ? '통과' : '실패') + '\n';
            })
            this.setState({ executeResult: text });
        }, (err) => {

        });
    };

    // 채점 및 제출
    sendResult = () => {
        const { match, history } = this.props;
        const assignmentCode = match.params.assignment_code;
        const problemCode = match.params.problem_code;


        let srcFile = new File(this.state.code.split('\n'), 'test.py');
        let formData = new FormData()
        formData.append('source', srcFile);
        formData.append('language', this.state.selectedLanguage);

        postData(`/api/assignment/${assignmentCode}/submission/${problemCode}`, formData, (res) => {
            history.goBack();
        }, (err) => {

        });
    };

    getLanguageTypes = () => {
        let items = [
            { label: 'Python', value: 'python' }
        ];
        return items;
    }

    getDefaultCodeForm = () => {
        const { match } = this.props;
        getData(`/api/problem/${match.params.problem_code}/signature/${this.state.selectedLanguage}`, (res) => {
            this.setState({ code: res.data.success });
        }, (err) => {
            this.setState({ code: '' });
        });
    }

    onChangeCode = (event) => {
        this.setState({ code: event.target.value });
    }
    onChangeResult = (event) => {
        this.setState({ executeResult: event.target.value });
    }

    printSolvingForm = () => {
        switch(this.state.problemType) {
            case 'programming': // 프로그래밍 문제
                return this.printProgrammingSolvingForm();
            case 'short': // 주관식 문제
                return this.printShortSolvingForm();
            case 'multiple': // 객관식 문제
                return this.printMultipleSolvingForm();
            default:
                return null;
        }
    };

    printProgrammingSolvingForm = () => {
        /* Props */
        const { classes } = this.props;

        const items = this.getLanguageTypes();

        return (
            <div className="page_wrap layout solving">
                <div className="box problem_title flex-align middle">
                    <em>{ this.state.problemName }</em>
                    <span className={'select_language'}>
                        <SimpleSelect
                            title={'Language'}
                            items={items}
                            start={this.state.selectedLanguage}
                            changeEvent={(event) => {
                                this.setState({ selectedLanguage: event.target.value });
                            }}
                        />
                    </span>
                </div>
                <div className="box problem_desc">
                    <em className="title">문제 설명</em>
                    <div className="description">
                        <em>{ this.state.problemDesc }</em>
                    </div>
                    <em className="title">제약조건</em>
                    <div className="description">
                        <em>{ this.state.problemRest }</em>
                    </div>
                </div>
                <div className="box code_title flex-align middle"><em>Solution</em></div>
                <div className="box code">
                    <textarea
                        placeholder={'Code...'}
                        value={this.state.code}
                        onChange={this.onChangeCode}
                    />
                </div>
                <div className="box execute_title flex-align middle"><em>Execute Result</em></div>
                <div className="box result">
                    <textarea
                        placeholder={'Code...'}
                        value={this.state.executeResult}
                        onChange={this.onChangeResult}
                    />
                </div>
                <div className="box buttons flex-align middle">
                    <Button
                        onClick={this.testStart}
                        classes={{
                            root: classes.root, // class name, e.g. `classes-nesting-root-x`
                            label: classes.label, // class name, e.g. `classes-nesting-label-x`
                        }}
                        variant="contained"
                        color="secondary"
                        startIcon={<AddIcon>send</AddIcon>}
                    >
                        테스트 실행
                    </Button>
                    <Button
                        onClick={this.sendResult}
                        classes={{
                            root: classes.root, // class name, e.g. `classes-nesting-root-x`
                            label: classes.label, // class name, e.g. `classes-nesting-label-x`
                        }}
                        variant="contained"
                        color="secondary"
                        startIcon={<AddIcon>send</AddIcon>}
                    >
                        채점 및 제출
                    </Button>
                </div>
            </div>
        );
    };

    printShortSolvingForm = () => {
        const { classes } = this.props;
        return (
            <div className="page_wrap layout solving">
                <div className={'problem_title'}>
                    <em>{ this.state.problemName }</em>
                </div>
                <div className={'problem_desc'}>
                    <em>{ this.state.problemDesc }</em>
                </div>
                <div className={'problem_answer'}>
                    <textarea
                        className={'design_form textarea_A necessary description'}
                        placeholder={'정답'}
                        value={this.state.code}
                        onChange={(e) => {
                            this.setState({ code: e.target.value });
                        }}
                    />
                </div>
                <div className={'problem_send'}>
                    <Button
                        onClick={this.sendResult}
                        classes={{
                            root: classes.root, // class name, e.g. `classes-nesting-root-x`
                            label: classes.label, // class name, e.g. `classes-nesting-label-x`
                        }}
                        variant="contained"
                        color="secondary"
                        startIcon={<AddIcon>send</AddIcon>}
                    >
                        채점 및 제출
                    </Button>
                </div>
            </div>
        );
    };

    printMultipleSolvingForm = () => {
        const { classes } = this.props;
        return (
            <div className="page_wrap layout solving">
                <div className={'problem_title'}>
                    <em>{ this.state.problemName }</em>
                </div>
                <div className={'problem_desc'}>
                    <div>{ this.state.problemDesc }</div>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Gender</FormLabel>
                        <RadioGroup aria-label="gender" name="gender1" value={this.state.code} onChange={(e) => {
                            this.setState({ code: e.target.value })
                        }}>
                            {this.state.problemChoices.map((choice, index) => {
                                return <FormControlLabel value={index} control={<Radio />} label={choice} />
                            })}
                        </RadioGroup>
                    </FormControl>
                </div>
                <div className={'problem_send'}>
                    <Button
                        onClick={this.sendResult}
                        classes={{
                            root: classes.root, // class name, e.g. `classes-nesting-root-x`
                            label: classes.label, // class name, e.g. `classes-nesting-label-x`
                        }}
                        variant="contained"
                        color="secondary"
                        startIcon={<AddIcon>send</AddIcon>}
                    >
                        채점 및 제출
                    </Button>
                </div>
            </div>
        );
    };

    render() {
        return this.state.problemType !== '' ? this.printSolvingForm() : null;
    };
}

export default withStyles(useStyles, { withTheme: true })(Solving);
