const ChatRoom = require('./chatRoom');
const Room = require('../model/Room');
const emitter = require('../chatting/roomEvent');
const roomEmitter = emitter.roomEmitter;

module.exports = (io) => {
    let roomList = []; //방 리스트 변수
    let chatRoomList = []; //socket이 들어있는 각각의 채팅방
    let existRoomNum = 0; //채팅방 구분하려고

    //서버 시작하면 일단 열린 room들 확인후 채팅룸 생성
    const startChatRoom = () => {
        Room.getCurrentAllRoom((err, result) => {
            if (err) {
                console.log(err);
            } else {
                roomList = [...result];
                roomList.forEach((room) => {
                    const newChatRoom = new ChatRoom(
                        room.code,
                        room.course_code,
                        existRoomNum++,
                        io
                    );
                    chatRoomList.push(newChatRoom);
                    console.log(room);
                    console.log(newChatRoom.getInfo());
                });
            }
        });
    };

    //새로운 방 생성됬을때..
    roomEmitter.on('createRoom', (room) => {
        console.log('event', room);
        const newChatRoom = new ChatRoom(
            room.code,
            room.course_code,
            existRoomNum++,
            io
        );
        chatRoomList.push(newChatRoom);
    });

    //5분마다 체크해서 채팅방 지우기
    const checkSaveRoomAndDelete = () => {
        setInterval(() => {
            let numList = [];
            let dieList = [];
            let flag = false;
            //1. 5분마다 남아있는 방 결과를 DB에서 받아와서
            Room.getCurrentAllRoom((err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    roomList = [...result];

                    //2. 지금 메모리에 살아있는 채팅룸 객채랑 비교하고
                    roomList.forEach((existRoom) => {
                        chatRoomList.forEach((existchatRoom) => {
                            let {
                                course_code,
                                room_code,
                                roomNumber,
                            } = existchatRoom.getInfo();
                            if (
                                existRoom.code === room_code &&
                                existRoom.course_code === course_code
                            ) {
                                numList.push(roomNumber);
                            }
                        });
                    });
                    //3. 살아있는 방 num를 제외한 나머지 채팅룸을 지운다.
                    console.log(numList);
                    chatRoomList.forEach((chatRoom) => {
                        let { roomNumber } = chatRoom.getInfo();
                        numList.forEach((num) => {
                            if (roomNumber === num) {
                                flag = true;
                            }
                        });
                        if (flag === false) {
                            dieList.push(roomNumber);
                        }
                        flag = false;
                    });
                    dieList.forEach((dieChatNum) => {
                        const idx = chatRoomList.findIndex((chatroom) => {
                            return chatroom.getInfo().roomNumber === dieChatNum;
                        });
                        if (idx >= 0) {
                            //chatRoomList[idx] = null;
                            chatRoomList.splice(idx, 1);
                        }
                    });
                    console.log('show', chatRoomList);
                }
            });
            //}, );
        }, 5 * 60 * 1000);
    };

    return {
        startChatRoom,
        checkSaveRoomAndDelete,
    };
};
