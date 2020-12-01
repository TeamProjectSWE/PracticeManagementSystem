const express = require('express');
const router = express.Router();
const Assignment = require('../model/Assignment');
const { isProf } = require('./middleware');

/* 과제 가지고오기
 *  강의 이름으로 모든 과제 리스트 가지고옴
 */
router.get('/:course_code', (req, res) => {
    const course_code = req.params.course_code;
    Assignment.getAssignment(course_code, (err, result) => {
        if (err) {
            res.json({ success: false });
        }
        res.json(result);
    });
});
/**
 * 과제 하나 확인
 */
router.get('/:assignment_code', (req, res) => {
    const assignment_code = req.params.assignment_code;
    Assignment.getOneAssignment(assignment_code, (err, result) => {
        if (err) {
            res.json({ success: false });
        }
        res.json(result);
    });
});

/*과제 생성
 */
router.post('/', (req, res) => {
    const info = req.body;
    Assignment.createAssignment(
        info.course_code,
        info.package_code,
        info.description,
        'testpath',
        (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json({success:true ,result});
        }
    );
});

router.put('/', (req, res) => {
    const info = req.body;
    Assignment.updateAssignment(
        info.assignment_code,
        info.description,
        (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json({success:true ,result});
        }
    );
});

router.delete('/', (req, res) => {
    const info = req.body;
    Assignment.getAssignment(info.assignment_code, (err, result) => {
        if (err) {
            res.json({ success: false });
        }
        res.json({success:true ,result});
    });
});

module.exports = router;
