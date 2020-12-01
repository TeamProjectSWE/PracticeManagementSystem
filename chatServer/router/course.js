const express = require('express');
const router = express.Router();
const Course = require('../model/Course');
const { isProf, isStudent } = require('./middleware');

router.get('/all',(req,res)=>{
    Course.getAllCourse(
        (err, result) => {
            if (err) {
                return res.json({ success: false });
            }
            res.json(result);
        }
    );
})

/* 학생의 강의 신청 */
router.post('/enrolment', isStudent, (req, res) => {
    const body = req.body;
    Course.enrolCourse(
        body.submitValue.name,
        body.user_code,
        (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json({success:true ,result});
        }
    );
});

/* 강의정보 가지고오기 */
/* 파라미터는 임시로 사용 */
/* 원래는 session or axios방식 json으로  가지고 오기 */
router.get('/:user_code', (req, res) => {
    const user_code = req.params.user_code;
    //학생, 교수 따로
    if (req.auth.level == 1) {
        //학생
        Course.getStudentCourse(user_code, (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json(result);
        });
    } else if (req.auth.level == 2) {
        //교수
        Course.getProfCourse(user_code, (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json(result);
        });
    } else {
        // ㅇㅅㅇ?
        res.json({ success: false });
    }
});


/**강의 정보 받기 */
router.get('/:course_code', (req, res) => {
    const course_code = req.params.course_code;
    Course.getCourse(
        course_code,
        (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json({success:true ,result});
        }
    );
});

/* 강의 개설 */
router.post('/', isProf, (req, res) => {
    const body = req.body;
    Course.createCourse(
        body.user_code,
        body.courseName,
        body.description,
        (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json({success:true ,result});
        }
    );
});

/* 강의 수정 */
router.put('/', isProf, (req, res) => {
    const body = req.body;
    Course.updateCourse(
        body.course_code,
        body.description,
        body.user_code,
        (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json({success:true ,result});
        }
    );
});

/* 강의 폐쇠 */
router.delete('/', isProf, (req, res) => {
    const body = req.body;
    Course.closeCourse(
        body.course_code,
        (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json({success:true ,result});
        }
    );
});

module.exports = router;
