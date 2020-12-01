import React from 'react';
import io from 'socket.io-client';
import RoomLayout from '../components/chat/RoomLayout';
import UserInfo from '../components/chat/UserInfo';
import Chat from '../components/chat/Chat';

class MainPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rooms: [],
      isRoomLoaded: false,
      enterRoom: false,
      enterRoomNum: 0,
      course_code: '',
      room_code: '',
      user_code: '',
      chattingMessages: [
        { who: 'system', message: '안녕하세요, 반가워요 ㅎㅎ' },
      ],
      socket: null,
    };
  }
  //소켓 연결하기
  handleConnectSocket = () => {
    const { socket, user_code } = this.state;
    socket.on('connect', () => {
      console.log('연결됬어요;);');
      socket.on('hi', (msg) => {
        //서버에서 보내주는거
        this.handleGetMessageFromServer(msg, true);
      });
      socket.on('chat', (msg) => {
        //사람끼리 이야기하는거
        this.handleGetMessageFromServer(msg, false);
      });
      socket.emit('joinRoom', user_code);
    });
    socket.on('error', (error) => {
      this.handleGetMessageFromServer('서버와의 연결이 되지않습니다.', true);
    });
  };
  //채팅 메시지 보내는거
  handleSendMessageToServer = (message) => {
    const { socket } = this.state;
    const time = new Date().toLocaleTimeString();
    socket.emit(
      'chat',
      JSON.stringify({ email: this.props.email, message, time }),
    );
  };
  //채팅 메시지 받는거
  handleGetMessageFromServer = (msg, signal) => {
    const { chattingMessages } = this.state;
    let messageObj = { who: '', message: '' };

    if (signal) {
      //서버신호 -> 방입장
      messageObj.who = 'system';
      messageObj.message = msg;
      this.setState({
        chattingMessages: chattingMessages.concat(messageObj),
      });
      return;
    }
    //사람신호 -> 채팅
    let { email, message, time } = JSON.parse(msg);
    if (email === this.props.email) {
      messageObj.who = 'me';
    } else {
      messageObj.who = email;
    }
    messageObj.message = message;
    messageObj.time = time;
    this.setState({
      chattingMessages: chattingMessages.concat(messageObj),
    });
  };

  //컴포넌트 마운트 끝나면 서버로부터 정보 가지고오기
  componentDidMount() {
    const url = this.props.location.pathname.split('/');
    const course_code = url[2];
    const room_code = url[3];
    const user_code = url[4];
    const socket = io(`/${course_code}/${room_code}`, {
      transports: ['polling'],
      forceNew: true,
    });
    this.setState(
      {
        socket,
        course_code,
        room_code,
        user_code,
      },
      () => this.handleConnectSocket(),
    );
  }

  render() {
    const { rooms, chattingMessages, isRoomLoaded, user_code } = this.state;
    return (
      <div id="main-wrap" style={{ display: 'flex' }}>
        <RoomLayout rooms={rooms} isRoomLoaded={isRoomLoaded} />

        <div id="rightSide">
          <UserInfo nick={user_code} />
          <Chat
            sendMessage={this.handleSendMessageToServer}
            chattingMessages={chattingMessages}
          />
        </div>
      </div>
    );
  }
}

// const MainPage = ({ match }) => {
//   const course_code = match.params.course_code;
//   const room_code = match.params.room_code;
//   const user_code = match.params.user_code;
//   const [rooms, setRooms] = useState([]);
//   const [isRoomLoaded, setIsRoomLoaded] = useState(false);
//   const [chattingMessages, setChattingMessages] = useState([
//     { who: 'system', message: '채팅을 시작하세요.' },
//   ]);
//   const socket = io.connect(`/${course_code}/${room_code}`, {
//     transports: ['polling'],
//     forceNew: true,
//   })
//   useEffect(()=>{
//     socket.on('hi', (msg) => {
//       //서버에서 보내주는거
//       console.log(msg);
//       handleGetMessageFromServer(msg, true);
//     });
//     socket.on('chat', (msg) => {
//       //사람끼리 이야기하는거
//       console.log(msg);
//       handleGetMessageFromServer(msg, false);
//     });
//     socket.emit('joinRoom', user_code);
//   })

//   // const [socket, setSocket] = useState(
//   //   io(`/${course_code}/${room_code}`, {
//   //     transports: ['polling'],
//   //     forceNew: true,
//   //   }),
//   // );
//   // useEffect(()=>{
//   //   handleConnectSocket(socket);
//   // },[])

//   /* 소캣 변경 */
//   // const handleChangeSocket = () => {
//   //   socket.disconnect();
//   //   setSocket(
//   //     io(`/${course_code}/${room_code}`, {
//   //       transports: ['polling'],
//   //       forceNew: true,
//   //     }),
//   //   );
//   // };

//   // /* 소캣 연결 */
//   // const handleConnectSocket = (socket) => {
//   //   console.log('12345"');
//   //   socket.on('connect', () => {
//   //     console.log('연결됨');
//   //     socket.on('hi', (msg) => {
//   //       //서버에서 보내주는거
//   //       console.log(msg);
//   //       handleGetMessageFromServer(msg, true);
//   //     });
//   //     socket.on('chat', (msg) => {
//   //       //사람끼리 이야기하는거
//   //       console.log(msg);
//   //       handleGetMessageFromServer(msg, false);
//   //     });
//   //     socket.emit('joinRoom', user_code);
//   //   });
//   //   socket.on('error', (error) => {
//   //     handleGetMessageFromServer(`서버 연결이 되지않습니다. "${error}" `, true);
//   //   });
//   // };

//   /* 채팅 메시지 보내기 */
//   const handleSendMessageToServer = (message) => {
//     const time = new Date().toLocaleTimeString();
//     console.log(message);
//     socket.emit(
//       'chat',
//       JSON.stringify({ user_code: user_code, message, time }),
//     );
//   };

//   /* 채팅 메시지 받기 */
//   const handleGetMessageFromServer = (msg, signal) => {
//     let messageObj = { who: '', message: '' };

//     if (signal) {
//       //서버신호 -> 방입장
//       messageObj.who = 'system';
//       messageObj.message = msg;
//       setChattingMessages(chattingMessages.concat(messageObj));
//       return;
//     } else {
//       //사람신호 -> 채팅
//       let { user_code, message, time } = JSON.parse(msg);
//       if (user_code === user_code) {
//         messageObj.who = 'me';
//       } else {
//         messageObj.who = user_code;
//       }
//       messageObj.message = message;
//       messageObj.time = time;
//       setChattingMessages(chattingMessages.concat(messageObj));
//     }
//   };

//   return (
//     <div id="main-wrap" style={{ display: 'flex' }}>
//       <RoomLayout rooms={rooms} isRoomLoaded={isRoomLoaded} />

//       <div id="rightSide">
//         <UserInfo nick={user_code} />
//         <Chat
//           sendMessage={handleSendMessageToServer}
//           chattingMessages={chattingMessages}
//         />
//       </div>
//     </div>
//   );
// };

export default MainPage;
