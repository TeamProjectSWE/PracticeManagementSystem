const express = require('express');
const router = express.Router();
const Room = require('../model/Room');
const { isProf } = require('./middleware');

/* 방 전체 정보 가지고오기 */
router.get('/all/:course_code', (req, res) => {
    const course_code = req.params.course_code;
    Room.getCourseRoom(course_code, (err, result) => {
        if (err) {
            res.json({ success: false });
        }
        res.json(result);
    });
});

/* 방 정보 가지고오기 */
router.get('/:course_code', (req, res) => {
    const course_code = req.params.course_code;
    Room.getCurrentRoom(course_code, (err, result) => {
        if (err) {
            res.json({ success: false });
        }
        res.json(result);
    });
});



/* 방 생성 */
router.post('/', isProf, (req, res) => {
    const body = req.body;
    Room.createRoom(
        body.course_code,
        body.submitValue.title,
        body.submitValue.description,
        body.submitValue.hour,
        body.submitValue.min,
        (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json({success:true ,result});
        }
    );
});

/* 방 폐쇄 (원래는 자동으로 시간끝나면 안보이게 해준다) */
router.delete('/', isProf, (req, res) => {
    const body = req.body;
    Room.deleteRoom(body.room_code, (err, result) => {
        if (err) {
            res.json({ success: false });
        }
        res.json({success:true ,result});
    });
});

module.exports = router;
