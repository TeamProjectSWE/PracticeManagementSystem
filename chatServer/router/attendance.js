const express = require('express');
const router = express.Router();
const Attendance = require('../model/Attendance');

/* 출석 확인 교수*/

/* 출석확인 위해서 전체 방 정보 가지고오기 */
router.get('/:course_code', (req, res) => {
    const course_code = req.params.course_code;
    Attendance.getCourse_Room(course_code, (err, result1) => {
        if(err){
            res.json({ success: false });
        }
        let rooms = [...result1];
        Attendance.getAttendInfo(course_code,(err,result2)=>{
            if(err){
                res.json({ success: false });
            }
            let infos = [...result2];
            let time = 0;
            let flag1;
            rooms.forEach(room=>{
                flag = false;
                flag1 = false;
                infos.forEach(attend=>{
                    if(room.code === attend.room_code && room.user_code === attend.user_code){
                        flag = true;
                        time = attend.attend_time;
                        if(time >room.class_time*0.9){
                            flag1 = true;
                        }
                    }
                })
                if(flag === true){
                    room.attend_time = time;
                    if(flag1 === true){
                        room.attend = true;
                    }else{
                        room.attend = false;
                    }
                }else{
                    room.attend_time = 0;
                    room.attend = false;
                }
            });
            res.json(rooms);
        })
    });
});

/* 출석 확인 학생*/
router.get('/student/:user_code/:course_code', (req, res) => {
    const { user_code, course_code } = req.params;
    Attendance.getEnrolCourse_Room(course_code,user_code,(err,result1)=>{
        if(err){
            res.json({ success: false });
        }
        const rooms = [...result1];
        Attendance.getAttendInfo_User(course_code,user_code,(err,result2)=>{
            if(err){
                res.json({ success: false });
            }
            let infos = [...result2];
            let time = 0;
            let flag1;
            rooms.forEach(room=>{
                flag = false;
                flag1 = false;
                infos.forEach(attend=>{
                    if(room.code === attend.room_code && room.user_code === attend.user_code){
                        flag = true;
                        time = attend.attend_time;
                        if(time >room.class_time*0.9){
                            flag1 = true;
                        }
                    }
                })
                if(flag === true){
                    room.attend_time = time;
                    if(flag1 === true){
                        room.attend = true;
                    }else{
                        room.attend = false;
                    }
                }else{
                    room.attend_time = 0;
                    room.attend = false;
                }
            });
            res.json(rooms);
        })
    })
});

//출석 정보 수정
router.put('/', (req, res) => {
    const body = req.body;
    Attendance.updateAttendance(
        body.course_code,
        body.submitValue.title,
        body.submitValue.id,
        body.submitValue.attendance,
        (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json({ success: true, result });
        }
    );
});

module.exports = router;
