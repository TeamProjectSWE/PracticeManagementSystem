const mariadb = require('mariadb');
const config = require('./config');
const pool = mariadb.createPool(config());

/* 교수가 수강생 확인 */
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

/* 학생이 자기 과목 출석확인 */
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

/* 강의 시작할때 */
const entranceRoom = (user_code, course_code, room_code, req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `INSERT INTO coditnator.attendance 
                    values(
                        '${user_code}',
                        '${course_code}',
                        '${room_code}',now(),null)`
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

/* 강의 끝날때 */
const exitRoom = (user_code, course_code, room_code, req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `UPDATE coditnator.attendance set exit_time = now()
                    where user_code = '${user_code}'
                    and course_code = '${course_code}'
                    and room_code   = '${room_code}'`
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

/**
 * 출석정보 수정을 위한 삭제 + 출석정보 수정
 */
const updateAttendance = (course_code, room_code, user_code, result,req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                //일단 삭제하고
                conn.query(
                    `DELETE FROM coditnator.attendance 
                    where
                        user_code = '${user_code}'and 
                        course_code = '${course_code}'and
                        room_code = '${room_code}'`
                )
                    .then((rows) => {
                        //정보 수정
                        conn.release();
                        let time = '';
                        if(result === 1){
                            time='close_time';
                        }else{
                            time='open_time';
                        }
                        pool.getConnection()
                        .then((conn) => {
                            conn.query(
                                `
                                INSERT INTO coditnator.attendance
                                (user_code, course_code, room_code, entrance_time, exit_time)
                                SELECT '${user_code}','${course_code}','${room_code}', 
                                r.open_time, ${time}
                                from coditnator.course_room r
                                where code = '${room_code}'
                                and course_code = '${course_code}'
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

module.exports = {
    getCourse_Room,
    getAttendInfo,
    getEnrolCourse_Room,
    getAttendInfo_User,
    entranceRoom,
    exitRoom,
    updateAttendance,
};
