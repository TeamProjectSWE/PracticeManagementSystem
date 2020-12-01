import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = () => ({
  chattingRoom: {
    boxShadow: ' #3e68f1 2px 2px 3px, #3e68f1 -2px -2px 3px',
    display: 'inline-block',
    backgroundColor: 'white',
    margin: 0,
    padding: 10,
    border: '1px solid  #3e68f1',
    width: 400,
    height: 500,
  },
  chattingMessage: {
    overflow: 'auto',
    listStyleType: 'none',
    height: 450,
    width: '100%',
    margin: 0,
    padding: 0,
    marginBottom: 10,
    border: '1px solid  #3e68f1',
  },
  message: {
    width: '100%',
    height: 30,
    fontSize: '2rem',
  },
  systemMsg: {
    border: '1px  #3e68f1 solid',
    padding: 5,
    margin: 10,
    textAlign: 'center',
    backgroundColor: ' #3e68f1',
    color: 'white',
    marginLeft: '10%',
    marginRight: '10%',
    boxShadow: ' #3e68f1 2px 2px 3px, #3e68f1 -2px -2px 3px',
  },
  myMsg: {
    border: '1px  #3e68f1 solid',
    padding: '5px',
    margin: '10px',
    textAlign: 'left',
    borderRadius: 10,
    marginLeft: '30%',
    marginRight: 3,
    boxShadow: 'grey 2px 2px 3px,grey -2px -2px 3px',
  },
  othersMsg: {
    border: '1px  #3e68f1 solid',
    padding: 5,
    margin: 10,
    textAlign: 'left',
    borderRadius: 10,
    marginLeft: 3,
    marginRight: '30%',
    boxShadow: ' #3e68f1 2px 2px 3px, #3e68f1 -2px -2px 3px',
  },
  Msg: {
    fontSize: 20,
  },
});

const Chat = ({ sendMessage, chattingMessages, classes }) => {
  // 메시지 element key
  let num = 0;
  const [message, setMessage] = useState('');
  let messagesEnd = React.createRef();

  const handleMessageInput = (e) => {
    setMessage(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.charCode === 13) {
      handleSendMessage();
    }
  };

  /* 메시지 보내기 */
  const handleSendMessage = () => {
    sendMessage(message);
    setMessage('');
  };
  /* 채팅 메시지 밑으로 내리기 */
  const scrollToBottom = () => {
    messagesEnd.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  });

  /* 메치시 리스트 */
  const chattingList = chattingMessages.map((chatting) => {
    if (chatting.who === 'system') {
      //시스템신호
      return (
        <li key={num++} className={classes.systemMsg}>
          <Paper>{chatting.message}</Paper>
        </li>
      );
    } else if (chatting.who === 'me') {
      //내꺼
      return (
        <li key={num++} className={classes.myMsg}>
          <Box>
            {chatting.who} {chatting.time}
            <br />
            <Box className={classes.Msg}>{chatting.message}</Box>
          </Box>
        </li>
      );
    } else {
      return (
        //남꺼
        <li key={num++} className={classes.othersMsg}>
          <Box>
            {chatting.who} {chatting.time}
            <br />
            <Box className={classes.Msg}>{chatting.message}</Box>
          </Box>
        </li>
      );
    }
  });

  return (
    <Box className={classes.chattingRoom}>
      <ul className={classes.chattingMessage}>
        {chattingList}
        <div
          style={{ float: 'left', clear: 'both' }}
          ref={(el) => {
            messagesEnd = el;
          }}
        ></div>
      </ul>
      <div>
        <input
          className={classes.message}
          name="message"
          autoComplete="off"
          placeholder="입력"
          value={message}
          onChange={handleMessageInput}
          onKeyPress={handleKeyPress}
        />
      </div>
    </Box>
  );
};

export default withStyles(styles)(Chat);
