const mariadb = require('mariadb');
const config = require('./config');
const pool = mariadb.createPool(config());

/* 수강신청위해 전체 강의 정보 가지고오기 */
const getAllCourse = (req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(`SELECT * FROM coditnator.course `)
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

/* 학생의 강의 정보 가지고오기 */
const getStudentCourse = (user_code, req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `SELECT * FROM coditnator.course c 
                WHERE EXISTS 
                (SELECT 'o' FROM coditnator.course_enrolment ce 
                    WHERE ce.user_code = '${user_code}' 
                    AND ce.course_code = c.code)`
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

/* 교수의 강의 정보 가지고오기 */
const getProfCourse = (user_code, req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `SELECT * from coditnator.course 
                    where user_code = '${user_code}'`
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

const getCourse = (course_code)=>{
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `SELECT * from coditnator.course 
                    where code = '${course_code}'                    
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

/* 교수의 강의 생성 */
const createCourse = async (user_code, courseName, description, req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `INSERT INTO coditnator.course (code, name, description, user_code) 
                    SELECT concat('COUR',IFNULL(lpad(substr(max(code),5)+1,6,'0'),'000001')),
                    '${courseName}',
                    '${description}',
                    '${user_code}' 
                    FROM coditnator.course order by code desc`
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

/* 교수의 강의 폐쇠 */
const closeCourse = (course_code, req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                //코드는 어떻게 생성? 무작위?
                conn.query(
                    `DELETE FROM coditnator.course 
                            where code = '${course_code}'
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

/* 교수의 강의 description 수정 */
const updateCourse = (course_code, description, user_code, req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                //코드는 어떻게 생성? 무작위?
                conn.query(
                    `UPDATE coditnator.course 
                    SET description = '${description}'
                    where code = '${course_code}' 
                    and user_code = '${user_code}'
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

/* 학생 강의 신청 */
const enrolCourse = (course_code, user_code, req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `INSERT INTO coditnator.course_enrolment VALUES(
                    '${course_code}',
                    '${user_code}')
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
module.exports = {
    getCourse,
    getAllCourse,
    getStudentCourse,
    getProfCourse,
    createCourse,
    closeCourse,
    updateCourse,
    enrolCourse,
};
