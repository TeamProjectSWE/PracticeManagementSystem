import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../common/Button';
import axios from 'axios';

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

const ReviseCourseForm = () => {
  const [CourseInformation, setCourseInform] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [usercode, setCode] = useState('');
  const onChangeName = (e) => setName(e.target.value);
  const onChangeDescription = (e) => setDescription(e.target.value);

  useEffect(() => {
    getData();
  });

  const getData = async () => {
    const res = await axios.get('/auth/session');
    setCode(res.user.code);
    const URL = '/course/:' + { usercode };
    const response = await axios.get(URL);
    setCourseInform(response.data);
  };
  const onClick = async () => {
    const put = await axios.put('/course', { usercode, name, description });
    this.setState({
      name: '',
      description: '',
    });
    console.log(put);
  };
  const renderInform = () => {
    return (
      CourseInformation &&
      CourseInformation.map(({ name, description }) => {
        return (
          <form
            id="gform"
            method="POST"
            class="pure-form pure-form-stacked"
            action=""
          >
            <fieldset class="pure-group">
              <label for="name">강의 명칭</label>
              <input
                type="text "
                id="name"
                name="name"
                placeholder={name}
                rows="10"
                cols="100"
                onChange={onChangeName}
                value={name}
              />
            </fieldset>

            <fieldset class="pure-group">
              <label for="definition">강의 설명 </label>
              <textarea
                id="definition"
                name="definition"
                rows="10"
                cols="100"
                placeholder={description}
                onChange={onChangeDescription}
                value={description}
              ></textarea>
            </fieldset>

            <Button onclick={onClick} class="bt" cyan width="100%">
              수정
            </Button>
          </form>
        );
      })
    );
  };
  return (
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
  );
};
export default ReviseCourseForm;
