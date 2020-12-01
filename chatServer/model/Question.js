const mariadb = require('mariadb');
const config = require('./config');
const pool = mariadb.createPool(config());

/* 질문 보기*/
const getQuestion = (assignment_code, req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `SELECT * FROM coditnator.assignment_question 
                    WHERE assignment_code = '${assignment_code}'`
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

/* 자신이 쓴 질문들 보기*/
const getMyQuestion = (user_code, req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `SELECT * FROM coditnator.assignment_question 
                    WHERE user_code = '${user_code}'`
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

/* 질문 등록 */
const createQuestion = (
    assignment_code,
    user_code,
    title,
    description,
    path,
    req
) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `INSERT INTO coditnator.assignment_question 
                (code, assignment_code, user_code, title,description, path) 
                SELECT concat('QUES',IFNULL(lpad(substr(max(code),5)+1,6,'0'),'000001')),
                '${assignment_code}',
                '${user_code}',
                '${title}',
                '${description}',
                '${path}' 
                FROM coditnator.assignment_question order by code desc`
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

/* 질문 수정 */
const updateQuestion = (
    question_code,
    assignment_code,
    title,
    description,
    req
) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `UPDATE coditnator.assignment_question 
                    set title = '${title}' , description = '${description}'
                    where assignment_code = '${assignment_code}' 
                    and code = '${question_code}'
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

/* 질문 삭제 */
const deleteQuestion = (assignment_code, question_code, req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `DELETE FROM coditnator.assignment_question 
                where assignment_code = '${assignment_code}' 
                and code = '${question_code}'`
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
    getQuestion,
    getMyQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
};
