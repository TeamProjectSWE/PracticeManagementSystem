import React, { useState } from 'react';
import styled from 'styled-components';
import { postCourse } from '../lib/api/allapi';
import Button from '../components/common/Button';
const OpenCoursePageBlock = styled.div``;
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
const InformBox = styled.div`
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.025);
  padding: 2rem;
  width: 600px;
  height: 580px;
  background: #d7e0fc;
  border-radius: 2px;
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
const OpenCoursePage = ({ match }) => {
  const user_code = match.params.user_code;
  const [name, setName] = useState('');
  const [description, setDesc] = useState('');

  const onChangeName = (e) => {
    setName(e.target.value);
  };
  const onChangeDesc = (e) => {
    setDesc(e.target.value);
  };
  const onClick = async (e) => {
    e.preventdefault();
    let res = await postCourse(user_code, name, description);
    res = res.data.result.affectedRows;
    // if (res === 1) {
    //  alert('강의개설 완료!');
    // } else {
    //  alert('강의개설 실패!');
    //  }
  };
  if (!user_code) return <div>유저정보 안받아짐</div>;
  return (
    <OpenCoursePageBlock>
      <CourseContainerBlock>
        <InformBox>
          <CourseFormBlock>
            <div>
              <h1>강의 개설</h1>

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

              <form id="gform" class="pure-form pure-form-stacked" action="">
                <fieldset class="pure-group">
                  <label for="name">강의 명칭</label>
                  <input
                    type="text "
                    id="name"
                    name="name"
                    placeholder="입력하세요."
                    rows="10"
                    cols="100"
                    onChange={onChangeName}
                    value={name}
                  />
                </fieldset>

                <fieldset class="pure-group">
                  <label for="definition">강의 설명 </label>
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
                  개설
                </Button>
              </form>
            </div>
          </CourseFormBlock>
        </InformBox>
      </CourseContainerBlock>
    </OpenCoursePageBlock>
  );
};
export default OpenCoursePage;
