const express = require('express');
const router = express.Router();
const { isProf, isStudent } = require('./middleware');
const Question = require('../model/Question');

/*자기가 쓴 질문들 가지고오기 */
router.get('/my/:user_code',(req,res)=>{
    const user_code = req.params.user_code;
    console.log(user_code);
    Question.getMyQuestion(user_code,
        (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json(result);
        }
    );
})

/* 질문 가지고오기 */
router.get('/:assignment_code',(req,res)=>{
    const assignment_code = req.params.assignment_code;
    Question.getQuestion(assignment_code,
        (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json(result);
        }
    );
})

/* 질문 등록 */
router.post('/',(req,res)=>{
    const body = req.body;
    console.log(body);
    Question.createQuestion(
        body.assignment_code,
        body.user_code,
        body.title,
        body.description,
        'tempPath',
        (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json({success:true ,result});
        }
    );
})

/* 질문 수정 */
router.put('/',(req,res)=>{
    const body = req.body;
    Question.updateQuestion(
        body.question_code,
        body.assignment_code,
        body.title,
        body.description,
        (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json({success:true ,result});
        }
    );
})

/* 질문 삭제 */
router.delete('/',(req,res)=>{
    const body = req.body;
    console.log(body);
    Question.deleteQuestion(
        body.assignment_code,
        body.question_code,
        (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json({success:true ,result});
        }
    );
})

module.exports = router;