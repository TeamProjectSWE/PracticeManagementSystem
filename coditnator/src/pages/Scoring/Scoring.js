import React from 'react'

/* Design Import */
import './Scoring.scss';

/* Material Import */
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import {
    Add as AddIcon
} from '@material-ui/icons';

/* Custom Import */
import {
    SimpleTable,
    SimpleModal
} from '../../components';
import AddProblem from '../AddProblem';
import { getData, putData, postData, deleteData } from '../../common'

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

class Scoring extends React.Component {
    state = {
        selectedCode: '',
        selectedType: '',
        addProblemModal: false,
        infoProblemModal: false,
        deleteProblemDialog: false,
        heads: [
            { id: 'name',        label: '명칭'},
            { id: 'description', label: '설명'},
            { id: 'type',        label: '문제 유형'},
            { id: 'tags',        label: '태그' }
        ],
        bodys: []
    }
    /* Component Did Mount */
    componentDidMount() {
        this.setBodys();
    }

    setBodys = async () => {
        // Problem 목록 정보 불러오기
        if(this.isExistPackageCode()){
            const { match } = this.props;
            const packageCode = match.params.package_code;

            await getData(`/api/package/${packageCode}/problem`, (res) => {
                let data = res.data.success;
                data.map((d, index) => {
                    data[index] = this.descriptionParse(d);
                })
                this.setState({ bodys: data });
            }, (err) => {
                this.setState({ bodys: [] });
            });
        }
        else {
            await getData('/api/problem', (res) => {
                let data = res.data.success;
                data.map((d, index) => {
                    data[index] = this.descriptionParse(d);
                })
                this.setState({ bodys: data });
            }, (err) => {
                this.setState({ bodys: [] });
            });
        }
    };

    descriptionParse = (data) => {
        let parsed = JSON.parse(data.description);

        data.description = parsed.text;
        data.answer = parsed.answer;
        data.choices = parsed.choices;

        return data;
    };

    /* Method */
    isExistPackageCode = () => {
        const { match } = this.props;
        return typeof match.params.package_code === 'string';
    }

    openAddProblemModal = () => {
        this.setState({ addProblemModal: true });
    };
    closeAddProblemModal = () => {
        this.setState({ addProblemModal: false });
        this.setBodys();
    };

    openInfoProblemModal = () => {
        this.setState({ infoProblemModal: true });
    };
    closeInfoProblemModal = () => {
        this.setState({ infoProblemModal: false });
        this.setBodys();
    };

    openDeleteProblemDialog = () => {
        this.setState({ deleteProblemDialog: true });
    }
    closeDeleteProblemDialog = () => {
        this.setState({ deleteProblemDialog: false });
    };

    // Package Code is exist event
    deleteEventA = (body) => {
        this.setState({ selectedCode: body.code });
        this.openDeleteProblemDialog();
    };

    // Default event
    deleteEventB = (body) => {
        this.setState({ selectedCode: body.code });
        this.openDeleteProblemDialog();
    };

    deleteAgreeA = () => {
        // Package 에서 Problem 삭제
        const { match } = this.props;

        let packageCode = match.params.package_code;
        let problemCode = this.state.selectedCode;
        deleteData(` /api/package/${packageCode}/problem/${problemCode}`, (res) => {
            // Package 목록 정보 다시 불러오기
            this.setBodys();
            this.closeDeleteProblemDialog();
        }, (err) => {

        });
    };
    deleteAgreeB = () => {
        // Problem 삭제
        const problemCode = this.state.selectedCode;
        deleteData(`/api/problem/${problemCode}`, (res) => {
            // Package 목록 정보 다시 불러오기
            this.setBodys();
            this.closeDeleteProblemDialog();
        }, (err) => {

        });
    };

    deleteDisagree = () => {
        this.closeDeleteProblemDialog();
    };

    infoEvent = (body) => {
        this.setState({ selectedCode: body.code });
        this.setState({ selectedType: body.type });
        this.openInfoProblemModal();
    };

    /* Render */
    render() {
        /* Props */
        const { classes, match } = this.props;

        /* Const */
        const contentPrefix = (this.isExistPackageCode() ? '현재 패키지에서 ' : '');

        return (
            <div className={'page problems'}>
                {this.isExistPackageCode() ?
                    <div className={'content'} ><em>{match.params.package_code}</em></div> : <div className={'content'}>
                        <div className={'search_box'}>

                        </div>
                        <div className={'btn_box'}>
                            <Button
                                onClick={this.openAddProblemModal}
                                classes={{
                                    root: classes.root, // class name, e.g. `classes-nesting-root-x`
                                    label: classes.label, // class name, e.g. `classes-nesting-label-x`
                                }}
                                variant="contained"
                                color="secondary"
                                startIcon={<AddIcon>send</AddIcon>}
                            >
                                문제 추가
                            </Button>
                        </div>
                    </div>}
                <div className={'content package_table'}>
                    <SimpleTable
                        heads={this.state.heads}
                        bodys={this.state.bodys}
                        deleteEvent={this.isExistPackageCode() ? this.deleteEventA : this.deleteEventB}
                        infoEvent={this.isExistPackageCode() ? null : this.infoEvent}
                        infoModal={
                            <SimpleModal
                                title={'문제 수정'}
                                open={this.state.infoProblemModal}
                                close={this.closeInfoProblemModal}
                                body={<AddProblem close={this.closeInfoProblemModal} code={this.state.selectedCode} type={this.state.selectedType} />}
                            />
                        }
                    />
                </div>
            </div>
        );
    }
}

export default withStyles(useStyles, { withTheme: true })(Scoring);
