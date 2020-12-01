import React from 'react';
import Paper from '@material-ui/core/Paper';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = (theme) => ({
  room: {
    width: '96%',
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    background: '#7B68EE',
    border: '2px white solid',
    boxShadow: '0 3px 5px 2px grey',
    color: 'white',
    fontWeight: 600,
    '&:hover': {
      backgroundColor: 'black',
    },
  },
});

const Room = ({ roomNumber, numOfPlayer, roomName, enterRoom, classes }) => {
  const handleEnterRoom = () => {
    enterRoom(roomNumber);
  };

  return (
    <Paper className={classes.room} onClick={handleEnterRoom} elevation={3}>
      <div className="roomNumber">{roomNumber}</div>
      <div className="noomName">{roomName}</div>
      <div className="numOfPlayer">{numOfPlayer} / 4</div>
    </Paper>
  );
};

// class Room extends React.Component{
//     handleEnterRoom = ()=>{
//         const {roomNumber, enterRoom} =this.props;
//         enterRoom(roomNumber);
//     }
//     render(){
//         const {roomNumber, roomName, numOfPlayer,classes} =  this.props;
//         return(
//             <Paper className={classes.room} onClick={this.handleEnterRoom} elevation={3} >
//                 <div className="roomNumber">
//                     {roomNumber}
//                 </div>
//                 <div className="noomName">
//                     {roomName}
//                 </div>
//                 <div className="numOfPlayer">
//                     {numOfPlayer} / 4
//                 </div>
//             </Paper>
//         )
//     }
// }

export default withStyles(styles)(Room);
