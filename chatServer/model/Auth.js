const mariadb = require('mariadb');
const config = require('./config');
const pool = mariadb.createPool(config());

/* 이 사람이 학생이냐 교육자나 아니면 딴거냐 */
const getAuth = (user_code, req) => {
    try {
        pool.getConnection()
            .then((conn) => {
                conn.query(
                    `SELECT * FROM coditnator.user 
                    WHERE code = '${user_code}'`
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

module.exports = {getAuth}