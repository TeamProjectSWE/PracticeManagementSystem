const express=  require('express');
const app = express();
const cors = require('cors');
const http = require('http').createServer(app);
const {user_auth} = require('./router/middleware');
//const PORT = process.env.PORT || 4000;
const socketio = require('socket.io')(http);


//채팅서버 시작
const roomManager = require('./chatting/chatManager')(socketio);
roomManager.startChatRoom();
roomManager.checkSaveRoomAndDelete();


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

/**
 * session 안받고 미리 확인하기
 * -> course 부분은 사용 X
 * -> course API주소만 조금 바뀜
 * -> (교수) 강의수정, 개설, 폐쇠, 가르치는 강의 리스트 -> /testCourseProf/... 로 연결
 * -> (학생) 강의리스트확인, 강의신청, 수강강의 리스트 ->  /testCourseStud/ ... 로 연결
 */

//인증 middleware 무시하고 API만 받아와서 테스트할수 있게
app.use('/',user_auth);

//이거는 나중에 서버 통합할때 사용
//app.use('/course',require('./router/course'));

app.use('/room',require('./router/room'));
app.use('/question',require('./router/question'));
app.use('/attendance',require('./router/attendance'));
app.use('/answer',require('./router/answer'));
app.use('/assignment',require('./router/assignment'));

//이부분은 학생, 교수 인증 무시하고 API만 받아와서 테스트할수 있게
app.use('/testCourseStud',require('./router/testCourseStudent'));
app.use('/testCourseProf',require('./router/testCourseProf'));

/*
http.listen(PORT,()=>{
  console.log('server start');
})
*/

module.exports = app;