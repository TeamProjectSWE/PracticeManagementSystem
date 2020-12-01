import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles'
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';


const styles = theme=>({
    gameLayout:{
        display: 'inlineBlock',
        backgroundColor: 'white',
        color: 'white',
        padding: 0,
        margin: 0,
        marginRight: 50,
        border: '1px solid black',
        width: 800,
        height: 720,
        boxShadow: 'grey 2px 2px 3px,grey -2px -2px 3px'
    },
    roomManager:{
        padding: theme.spacing(1),
        backgroundColor: 'black'
    },
    button: {
        background: '#7B68EE',
        border: '2px white solid',
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        color: 'white',
        fontWeight: 600,
        height: 60
    },
});

const GameLayout = ({leaveRoom, GetRoomsInfo,classes})=>{
    const handleLeaveRoom = ()=>{
        leaveRoom();
        GetRoomsInfo();
    }
    return(
        <Paper className={classes.gameLayout}>
            <AppBar className={classes.roomManager}  variant="outlined" position="static">
                <Button className={classes.button} onClick={handleLeaveRoom}>방 나가기</Button>
            </AppBar>
        </Paper>
    )
}

export default withStyles(styles)(GameLayout);