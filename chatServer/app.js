const express=  require('express');
const app = express();
const cors = require('cors');
const http = require('http').createServer(app);
const {user_auth} = require('./router/middleware');
const PORT = process.env.PORT || 4000;
const socketio = require('socket.io')(http);


//채팅서버 시작
const roomManager = require('./chatting/chatManager')(socketio);
roomManager.startChatRoom();
roomManager.checkSaveRoomAndDelete();


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

//인증 middleware 무시하고 API만 받아와서 테스트할수 있게
app.use('/',user_auth);

//이거는 나중에 서버 통합할때 사용
app.use('/course',require('./router/course'));
app.use('/room',require('./router/room'));
app.use('/question',require('./router/question'));
app.use('/attendance',require('./router/attendance'));
app.use('/answer',require('./router/answer'));
app.use('/assignment',require('./router/assignment'));


http.listen(PORT,'',()=>{
    console.log('server start :',PORT);
})