const Attendance = require('../model/Attendance');
const Auth = require('../model/Auth');
module.exports = class Room {
    constructor(room_code, course_code, roomNumber, io) {
        console.log(room_code, course_code, 'start!');

        this.room_user = [];
        this.room_code = room_code;
        this.course_code = course_code;
        this.roomNumber = roomNumber;
        this.clientNum = 0;

        const nsp = io.of(`/${course_code}/${room_code}`);

        nsp.on('connection', (socket) => {
            console.log('누가 연결됬음', socket.id);
            socket.on('joinRoom', (user_code) => {
                this.clientNum = this.clientNum + 1;

                this.room_user.push({
                    room: room_code,
                    userId: socket.id,
                    user_code,
                });

                //console.log(this.room_user);
                //console.log(user_code, '입장확인');
                //출석//
                Auth.getAuth(user_code, (err, user_auth) => {
                    if (err) {
                        return console.log(err);
                    } else {
                        console.log(user_auth);
                        if (user_auth[0].authority_code === 'AUTH000001') {
                            console.log('출석(입장) :', user_code);
                            Attendance.entranceRoom(
                                user_code,
                                course_code,
                                room_code,
                                (err, result) => {
                                    if (err) {
                                        console.log('출석확인 에러');
                                    } else {
                                        console.log('출석(입장) 완료');
                                    }
                                }
                            );
                        } else {
                            console.log('교수 혹은 관리자 :', user_code);
                        }
                    }
                });
            });

            socket.on('chat', (msg) => {
                console.log(`${room_code}번 방에서 채팅`);
                nsp.emit('chat', msg);
            });

            socket.on('disconnect', () => {
                this.clientNum = this.clientNum - 1;

                const idx = this.room_user.findIndex((user) => {
                    return user.userId === socket.id;
                });
                if (idx >= 0) {
                    const user = this.room_user[idx];
                    Auth.getAuth(user.user_code, (err, user_auth) => {
                        if (err) {
                            return console.log(err);
                        } else {
                            //console.log(user_auth);
                            if (user_auth[0].authority_code === 'AUTH000001') {
                                console.log('출석(퇴장) :', user.user_code);
                                //퇴장
                                Attendance.exitRoom(
                                    user.user_code,
                                    course_code,
                                    room_code,
                                    (err, result) => {
                                        if (err) {
                                            console.log('퇴장 에러');
                                        } else {
                                            console.log(
                                                '출석(퇴장), 출석정보 저장 :',
                                                user.user_code
                                            );
                                        }
                                    }
                                );
                            } else {
                                console.log(
                                    '교수 혹은 관리자 :',
                                    user.user_code
                                );
                            }
                        }
                    });

                    this.room_user.splice(idx, 1);
                    //console.log('after out', user, this.room_user);
                }
            });
        });
    }
    getInfo = () => {
        return {
            course_code: this.course_code,
            room_code: this.room_code,
            roomNumber: this.roomNumber,
            clientNum: this.clientNum,
        };
    };
};
