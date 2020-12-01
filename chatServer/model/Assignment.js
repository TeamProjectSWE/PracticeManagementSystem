const mariadb = require('mariadb');
const config = require('./config');
const pool = mariadb.createPool(config());

/**
 *강의 전체 과제 확인
 */
const getAssignment = (course_code,req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `SELECT * from coditnator.course_assignment 
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
/**
 * 과제 하나 가지고오기
 */
const getOneAssignment = (assignment_code,req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `SELECT * from coditnator.course_assignment 
                    where code = '${assignment_code}'`
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
 * 과제 생성
 */

const createAssignment = (course_code, package_code, description, path,req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `INSERT INTO coditnator.course_assignment 
                    (code, course_code, package_code, description, path) 
                SELECT concat('ASSI',IFNULL(lpad(substr(max(code),5)+1,6,'0'),'000001')),
                    '${course_code}',
                    '${package_code}',
                    '${description}',
                    '${path}' 
                    FROM coditnator.course_assignment order by code desc`
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
 * 과제 수정
 */

const updateAssignment = (assignment_code, description,req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `UPDATE coditnator.course_assignment 
                    set description = '${description}'
                    where code = '${assignment_code}'`
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
 * 과제 삭제 ㅅㅅ
 */

const deleteAssignment = (assignment_code,req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `DELETE from coditnator.course_assignment 
                    where code = '${assignment_code}'`
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
    getAssignment,
    getOneAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
};
