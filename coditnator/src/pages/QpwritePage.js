import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '../components/common/Button';
import { createQuestion } from '../lib/api/allapi';
const QpwritePageBlock = styled.div``;
const InformBox = styled.div`
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.025);
  padding: 2rem;
  width: 600px;
  height: 580px;
  background: #d7e0fc;
  border-radius: 2px;
`;
const CourseContainerBlock = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background: white;
  /* flex로 내부 내용 중앙 정렬 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const CourseFormBlock = styled.div`
  font-size: 1rem;
  border: none;
  font-weight: bold;
  padding-bottom: 0.5rem;
  outline: none;
  bt {
    position: absolute;

    left: 100px;

    top: 150px;
  }
`;

const QpwritePage = ({ match }) => {
  const course_code = match.params.course_code;
  const user_code = match.params.user_code;
  const code = match.params.code;
  const auth = match.params.auth;
  const [title, setTitle] = useState('');
  const [description, setDesc] = useState('');

  const onChangeTitle = (e) => {
    setTitle(e.target.value);
  };
  const onChangeDesc = (e) => {
    setDesc(e.target.value);
  };
  const onClick = () => {
    if (!title || !description) return alert('모든 필수정보를 입력하세요.');
    let res = createQuestion(code, user_code, title, description);
    res = res.result.result.affectedRows;
    //if (res === '1') {
    //alert('질문등록 완료!');
    //  } else {
    // alert('질문등록 실패!');
    //  }
  };
  if (!user_code) return <div>유저정보 안받아짐</div>;
  if (!course_code) return <div>코스정보 안받아짐</div>;
  if (!code) return <div>과제 정보 안받아짐</div>;
  return (
    <QpwritePageBlock>
      <CourseContainerBlock>
        <InformBox>
          <CourseFormBlock>
            <div>
              <h1>질문 등록</h1>

              <link
                rel="stylesheet"
                href="http://yui.yahooapis.com/pure/0.6.0/pure-min.css"
              />
              <link
                rel="stylesheet"
                href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css"
              />

              <link
                rel="stylesheet"
                href="https://cdn.rawgit.com/dwyl/html-form-send-email-via-google-script-without-server/master/style.css"
              />

              <form id="gform" class="pure-form pure-form-stacked">
                <fieldset class="pure-group">
                  <label for="name">질문 제목</label>
                  <input
                    type="text "
                    id="title"
                    name="title"
                    placeholder="입력하세요."
                    rows="10"
                    cols="100"
                    onChange={onChangeTitle}
                    value={title}
                  />
                </fieldset>

                <fieldset class="pure-group">
                  <label for="definition">질문 내용 </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="10"
                    cols="100"
                    placeholder="입력하세요."
                    onChange={onChangeDesc}
                    value={description}
                  ></textarea>
                </fieldset>

                <Button class="bt" cyan width="100%" onClick={onClick}>
                  등록
                </Button>
              </form>
            </div>
          </CourseFormBlock>
        </InformBox>
      </CourseContainerBlock>
    </QpwritePageBlock>
  );
};
export default QpwritePage;
