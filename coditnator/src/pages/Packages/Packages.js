import React from 'react'

/* Design Import */
import './Packages.scss';

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
import AddPackage from '../AddPackage';
import { getData, deleteData } from '../../common'

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

class Packages extends React.Component {
  state = {
    selectedCode: '',
    addPackageModal: false,
    infoPackageModal: false,
    deletePackageDialog: false,
    heads: [
      { id: 'name',        label: '명칭'},
      { id: 'description', label: '설명'},
      { id: 'count',       label: '문제 개수'},
    ],
    bodys: []
  }
  /* Component Did Mount */
  componentDidMount() {
    this.setBodys();
  }

  /* Method */
  setBodys = async () => {
    // Package 목록 정보 불러오기
    await getData('/api/package', (res) => {
      this.setState({ bodys: res.data.success });
    }, (err) => {
      this.setState({ bodys: [] });
      console.log('Error ++++++++++');
    });
  };

  openAddPackageModal = () => {
    this.setState({ addPackageModal: true });
  };
  closeAddPackageModal = () => {
    this.setState({ addPackageModal: false });
    this.setBodys();
  };

  openInfoPackageModal = () => {
    this.setState({ infoPackageModal: true });
  };
  closeInfoPackageModal = () => {
    this.setState({ infoPackageModal: false });
    this.setBodys();
  };

  openDeletePackageDialog = () => {
    this.setState({ deletePackageDialog: true });
  }
  closeDeletePackageDialog = () => {
    this.setState({ deletePackageDialog: false });
  };

  customEvent = (body) => {
    const { history } = this.props;
    history.push('/problems/' + body.code);
  }

  deleteEvent = (body) => {
    this.setState({ selectedCode: body.code });
    this.openDeletePackageDialog();
  };

  deleteAgree = () => {
    // Package 삭제
    const packageCode = this.state.selectedCode;
    deleteData(`/api/package/${packageCode}`, (res) => {
      // Package 목록 정보 다시 불러오기
      this.setBodys();
      this.closeDeletePackageDialog();
    }, (err) => {

    });
  };

  deleteDisagree = () => {
    this.closeDeletePackageDialog();
  };

  infoEvent = (body) => {
    this.setState({ selectedCode: body.code })
    this.openInfoPackageModal();
  };

  /* Render */
  render() {
    /* Props */
    const { classes, history } = this.props;

    return (
      <div className={'page packages'}>
        <div className={'content'}>
          <div className={'search_box'}>

          </div>
          <div className={'btn_box'}>
            <Button
              onClick={this.openAddPackageModal}
              classes={{
                root: classes.root, // class name, e.g. `classes-nesting-root-x`
                label: classes.label, // class name, e.g. `classes-nesting-label-x`
              }}
              variant="contained"
              color="secondary"
              startIcon={<AddIcon>send</AddIcon>}
            >
              패키지 추가
            </Button>
          </div>
        </div>
        <div className={'content package_table'}>
          <SimpleTable
            heads={this.state.heads}
            bodys={this.state.bodys}
            customEvent={this.customEvent}
            deleteEvent={this.deleteEvent}
            infoEvent={this.infoEvent}
            infoModal={
              <SimpleModal
                title={'패키지 수정'}
                open={this.state.infoPackageModal}
                close={this.closeInfoPackageModal}
                body={<AddPackage close={this.closeInfoPackageModal} code={this.state.selectedCode}/>}
              />
            }
          />
        </div>

        <SimpleModal
          title={'패키지 추가'} open={this.state.addPackageModal}
          close={this.closeAddPackageModal}
          body={<AddPackage close={this.closeAddPackageModal}/>}
        />
        <SimpleDialog
          open={this.state.deletePackageDialog}
          onClose={this.closeDeletePackageDialog}
          data={{
            title: '패키지 삭제',
            content: this.state.selectedCode + ' 패키지를 삭제하시겠습니까?',
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

export default withStyles(useStyles, { withTheme: true })(Packages);
