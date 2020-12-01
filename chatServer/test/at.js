const mariadb = require('mariadb');
const config = require('../model/config');
const pool = mariadb.createPool(config());

const getCourse_Room = (course_code, req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `select  e.user_code,r.code,
                    timestampdiff(minute,open_time,close_time) as class_time
                    from coditnator.course_room r, coditnator.course_enrolment e
                    where r.course_code = '${course_code}'
                    and e.course_code = '${course_code}' order by e.user_code`
                )
                    .then((rows) => {
                        conn.release();
                        req(false, rows);
                    })
                    .catch((err) => {
                        conn.release();
                        console.error(err);
                        req(true);
                    });
            })
            .catch((err) => {
                console.error(err);
                req(true);
            });
    } catch (err) {
        console.error(err);
        req(true);
    }
};

const getAttendInfo = (course_code, req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `
                    SELECT user_code,room_code
                    ,timestampdiff(minute,min(entrance_time),max(exit_time)) as attend_time
                    from coditnator.attendance
                    where course_code = '${course_code}'
                        group by user_code, course_code, room_code
                     `
                )
                    .then((rows) => {
                        conn.release();
                        req(false, rows);
                    })
                    .catch((err) => {
                        conn.release();
                        console.error(err);
                        req(true);
                    });
            })
            .catch((err) => {
                console.error(err);
                req(true);
            });
    } catch (err) {
        console.error(err);
        req(true);
    }
};

//교수
getCourse_Room('COUR000001', (err, result1) => {
    let rooms = [...result1];
    getAttendInfo('COUR000001',(err,result2)=>{
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
                }
            }else{
                room.attend_time = 0;
                room.attend = false;
            }
        });
        console.log(rooms);
    })
});

const getEnrolCourse_Room = (course_code, user_code,req)=>{
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `
                    select  e.user_code,r.code,
                    timestampdiff(minute,open_time,close_time) as class_time
                    from coditnator.course_room r, coditnator.course_enrolment e
                    where r.course_code = '${course_code}'
                    and e.user_code = '${user_code}'
                    and e.course_code = '${course_code}' order by e.user_code
                    `
                )
                    .then((rows) => {
                        conn.release();
                        req(false, rows);
                    })
                    .catch((err) => {
                        conn.release();
                        console.error(err);
                        req(true);
                    });
            })
            .catch((err) => {
                console.error(err);
                req(true);
            });
    } catch (err) {
        console.error(err);
        req(true);
    }
}

const getAttendInfo_User = (course_code, user_code,req)=>{
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `
                    SELECT user_code,room_code
                    ,timestampdiff(minute,min(entrance_time),max(exit_time)) as attend_time
                    from coditnator.attendance
                    where course_code = '${course_code}'
                    and user_code = '${user_code}'
                        group by user_code, course_code, room_code
                    `
                )
                    .then((rows) => {
                        conn.release();
                        req(false, rows);
                    })
                    .catch((err) => {
                        conn.release();
                        console.error(err);
                        req(true);
                    });
            })
            .catch((err) => {
                console.error(err);
                req(true);
            });
    } catch (err) {
        console.error(err);
        req(true);
    }
}

getEnrolCourse_Room('COUR000001','USER000009',(err,result1)=>{
    const rooms = [...result1];
    getAttendInfo_User('COUR000001','USER000009',(err,result2)=>{
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
                }
            }else{
                room.attend_time = 0;
                room.attend = false;
            }
        });
        console.log(rooms);

    })
})