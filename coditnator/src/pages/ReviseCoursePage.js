import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../components/common/Button';

import { getCourse, reviseCourse } from '../lib/api/allapi';

const ReviseCoursePageBlock = styled.div``;

const ReviseCourseFormBlock = styled.div`
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

const ReviseCoursePage = ({ match }) => {
  const course_code = match.params.course_code;
  const user_code = match.params.user_code;
  const [description, setDescription] = useState('');
  const onChangeDescription = (e) => setDescription(e.target.value);

  const onClick = async (description) => {
    console.log('---------' + course_code);
    console.log('---------' + description);
    console.log('---------' + user_code);
    let res = await reviseCourse(course_code, description, user_code);
    res = res.data.success;
    //if (res === 'true') {
    //수정성공
    // alert('수정 성공!');
    // } else {
    //수정 실패
    // alert('수정 실패!');
    // }
  };
  const renderInform = () => {
    return (
      <div>
        <form id="gform" class="pure-form pure-form-stacked" action="">
          <fieldset class="pure-group">
            <label for="description">강의 설명 </label>
            <textarea
              id="description"
              name="description"
              rows="10"
              cols="100"
              placeholder=""
              onChange={onChangeDescription}
              value={description}
            ></textarea>
          </fieldset>

          <Button
            onClick={() => onClick(description)}
            class="bt"
            cyan
            width="100%"
          >
            수정
          </Button>
        </form>
      </div>
    );
  };
  return (
    <ReviseCoursePageBlock>
      <CourseContainerBlock>
        <InformBox>
          <ReviseCourseFormBlock>
            <div>
              <h1>강의정보 수정</h1>

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
              {renderInform()}
            </div>
          </ReviseCourseFormBlock>
        </InformBox>
      </CourseContainerBlock>
    </ReviseCoursePageBlock>
  );
};
export default ReviseCoursePage;
