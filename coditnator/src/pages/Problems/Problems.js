import React from 'react'

/* Design Import */
import './Problems.scss';

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
import { getData } from '../../common'

/* Data Import */
import { rows } from './data/index';
import SimpleDialog from "../../components/SimpleDialog";

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

class Problems extends React.Component {
  state = {
    selectedCode: '',
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
    /*
    getData('/api/package', [], (res) => {
      this.setState({ bodys: res.data.success });
    }, () => {
      this.setState({ bodys: rows });
    });
     */
    this.setState({ bodys: rows });
  }

  /* Method */
  isExistPackageCode = () => {
    const { match } = this.props;
    return typeof match.params.packageCode === 'string';
  }

  openAddProblemModal = () => {
    this.setState({ addProblemModal: true });
  };
  closeAddProblemModal = () => {
    this.setState({ addProblemModal: false });
  };

  openInfoProblemModal = () => {
    this.setState({ infoProblemModal: true });
  };
  closeInfoProblemModal = () => {
    this.setState({ infoProblemModal: false });
  };

  openDeleteProblemDialog = () => {
    this.setState({ deleteProblemDialog: true });
  }
  closeDeleteProblemDialog = () => {
    this.setState({ deleteProblemDialog: false });
  };

  // Package Code is exist event
  deleteEventA = (code) => {
    this.setState({ selectedCode: code });
    this.openDeleteProblemDialog();
  };

  // Default event
  deleteEventB = (code) => {
    this.setState({ selectedCode: code });
    this.openDeleteProblemDialog();
  };

  deleteAgree = () => {
    if(this.isExistPackageCode) {

    }
    else {

    }

    this.state.bodys.map((body, index) => {
      if(body.code === 'undefined') {
        return null;
      }
      else if(body.code === this.state.selectedCode) {
        let copyBodys = this.state.bodys;
        copyBodys.splice(index, 1);

        this.setState({ bodys: copyBodys });
      }
    });
    this.closeDeleteProblemDialog();
  };

  deleteDisagree = () => {
    this.closeDeleteProblemDialog();
  };
  
  infoEvent = (code) => {
    this.setState({ selectedCode: code })
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
          <div className={'content'} ><em>{match.params.packageCode}</em></div> : <div className={'content'}>
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
                body={<AddProblem close={this.closeInfoProblemModal} code={this.state.selectedCode}/>}
              />
            }
          />
        </div>

        <SimpleModal
          title={'문제 추가'} open={this.state.addProblemModal}
          close={this.closeAddProblemModal}
          body={<AddProblem close={this.closeAddProblemModal}/>}
        />
        <SimpleDialog
          open={this.state.deleteProblemDialog}
          onClose={this.closeDeleteProblemDialog}
          data={{
            title: '문제 삭제',
            content: contentPrefix + this.state.selectedCode + ' 문제를 삭제하시겠습니까?',
            agreeText: 'YES',
            disagreeText: 'NO',
            agreeEvent: this.deleteAgree,
            disagreeEvent: this.deleteDisagree
          }}
        />
      </div>
    );
  }
}

export default withStyles(useStyles, { withTheme: true })(Problems);
