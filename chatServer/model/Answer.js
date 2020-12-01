const mariadb = require('mariadb');
const config = require('./config');
const pool = mariadb.createPool(config());

/* 답변 가지고오기 */
const getAnswer = (question_code,req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                //코드는 어떻게 생성? 무작위?
                conn.query(
                    `SELECT * FROM coditnator.question_answer
                    where question_code = '${question_code}'
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

/* 답변 등록 */
const createAnswer = (question_code, user_code, description,req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                //코드는 어떻게 생성? 무작위?
                conn.query(
                    `INSERT INTO coditnator.question_answer (question_code, idx, user_code, description) 
                    SELECT 
                    '${question_code}',
                    IFNULL(max(idx)+1,0),
                    '${user_code}' ,
                    '${description}'
                    FROM coditnator.question_answer
                    where question_code = '${question_code}'
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

/* 답변 수정 */
const updateAnswer = (question_code, idx, description,req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                //코드는 어떻게 생성? 무작위?
                conn.query(
                    `UPDATE coditnator.question_answer
                    SET description = '${description}'
                    where question_code = '${question_code}' 
                    and idx = ${idx}
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
/* 답변 삭제 */
const deleteAnswer = (question_code, idx,req) =>{
    try {
        pool.getConnection()
            .then((conn) => {
                //코드는 어떻게 생성? 무작위?
                conn.query(
                    `DELETE FROM coditnator.question_answer
                    where question_code = '${question_code}' 
                    and idx = ${idx}
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

module.exports = {
    getAnswer,
    createAnswer,
    updateAnswer,
    deleteAnswer
}