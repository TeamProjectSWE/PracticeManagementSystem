import React from 'react';
import Paper from '@material-ui/core/Paper';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = {
  userInfo: {
    border: '1px solid  #3e68f1',
    background: 'white',
    margin: 0,
    marginBottom: 10,
    //padding: 10,
    width: 400,
    height: 165,
    boxShadow: ' #3e68f1 2px 2px 3px, #3e68f1 -2px -2px 3px',
  },
};

const UserInfo = ({ nick, classes }) => {
  return (
    <Paper className={classes.userInfo}>
      <div>접속 아이디 : {nick}</div>
      <div>어서오세요.</div>
    </Paper>
  );
};

export default withStyles(styles)(UserInfo);
