const express = require('express');
const router = express.Router();
const Answer = require('../model/Answer');

/* 질문에 달린 답변들 가지고오기 */
router.get('/:question_code', (req, res) => {
    const question_code = req.params.question_code;
    Answer.getAnswer(question_code, (err, result) => {
        if (err) {
            res.json({ success: false });
        }
        res.json(result);
    });
});

/* 답변 작성 */
router.post('/', (req, res) => {
    const body = req.body;
    Answer.createAnswer(
        body.question_code,
        body.user_code,
        body.description,
        (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json(result);
        }
    );
});

/* 답변 수정 */
router.put('/', (req, res) => {
    const body = req.body;
    Answer.updateAnswer(
        body.question_code,
        body.idx,
        body.description,
        (err, result) => {
            if (err) {
                res.json({ success: false });
            }
            res.json(result);
        }
    );
});

/* 답변 삭제 */
router.delete('/', (req, res) => {
    const body = req.body;
    Answer.deleteAnswer(body.question_code, body.idx, (err, result) => {
        if (err) {
            res.json({ success: false });
        }
        res.json(result);
    });
});

module.exports = router;
