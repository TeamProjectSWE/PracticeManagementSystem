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
    Course.getStudentCourse(user_code, (err, result) => {
        if (err) {
            res.json({ success: false });
        }
        res.json(result);
    });
});


module.exports = router;
