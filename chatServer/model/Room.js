const mariadb = require('mariadb');
const config = require('./config');
const pool = mariadb.createPool(config());
const emitter = require('../chatting/roomEvent');
const roomEmitter = emitter.roomEmitter;


roomEmitter.addListener('createRoom',(data)=>{
})

/* 지금 방 정보 가지고오기 */
const getCurrentRoom = (course_code, req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `SELECT * FROM coditnator.course_room 
                            where course_code = '${course_code}' and close_time > now()`
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

/**지금 열려있는 방 전부 가지고오기 */
const getCurrentAllRoom = (req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `SELECT * FROM coditnator.course_room 
                            where close_time > now()`
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

/* 출석확인 위해서 전체 방 정보 가지고오기 */
const getCourseRoom = (course_code, req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `SELECT * FROM coditnator.course_room 
                            where course_code = '${course_code}'`
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

const createRoom = (
    course_code,
    room_name,
    room_description,
    hours,
    minutes,
    req
) => {
    try {
        pool.getConnection()
            .then((conn) => {
                //일단 방 생성
                conn.query(
                    `INSERT INTO coditnator.course_room (code, course_code, name, description, open_time, close_time) 
                    SELECT concat('ROOM',IFNULL(lpad(substr(max(code),5)+1,6,'0'),'000001')),
                    '${course_code}',
                    '${room_name}',
                    '${room_description}'
                                    ,now(),date_add(now(), interval "${hours} ${minutes}" HOUR_MINUTE) 
                                    FROM coditnator.course_room 
                                    where course_code = '${course_code}' order by code desc`
                )
                    .then((rows) => {
                        conn.release();
                        pool.getConnection()
                            .then((conn)=>{
                                conn.query(
                                    `
                                    SELECT * FROM coditnator.course_room
                                    where course_code = '${course_code}'
                                    order by code desc
                                    `)
                                    .then((rows) => {
                                        conn.release();
                                        roomEmitter.emit('createRoom',rows[0]);
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

const deleteRoom = (room_code,req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `DELETE FROM coditnator.course_room 
                            where code = '${room_code}'`
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

module.exports = {
    getCurrentRoom,
    getCurrentAllRoom,
    getCourseRoom,
    createRoom,
    deleteRoom,
};
