import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import NativeSelect from '@material-ui/core/NativeSelect';
import FormLabel from '@material-ui/core/FormLabel';

const DeleteCourseBlock = styled.div`
  margin: 0 auto;

  border: none;
  padding: 1rem;
  @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap');

  body {
    font-family: 'Quicksand', sans-serif;
    display: flex;
    justify-content: center;
    padding: 0;
    color: #4d4d4d;
  }

  #title {
    margin-top: 1px;
    margin-left: 200px;
  }

  #room {
    border-collapse: collapse;
    border: 3px solid #ddd;
  }

  #room td,
  #room th {
    border: 1px solid #ddd;
    padding: 12px;
  }

  #room tr:hover {
    background-color: #ddd;
  }

  #room th {
    padding: 10px;
    text-align: center;
    background-color: #3e68f1;
    color: white;
  }

  .opration {
    text-align: center;
  }

  .button {
    border: none;
    outline: none;
    font-size: 11px;
    font-family: 'Quicksand', sans-serif;
    color: #f44336;
    padding: 3px 10px;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid #f44336;
    background-color: transparent;
  }

  .button:active {
    border: 1px solid blue;
  }
`;

const DeleteCoursePage = () => {
  const [courseItem, setList] = useState([]);
  const [usercode, setUserCode] = useState([]);
  const [title, setTitle] = useState();

  useEffect(() => {
    getData();
    getCourse();
  });

  const setTitleText = (e) => {
    setTitle(e.target.value);
  };

  const getData = () => {
    const response = axios.get('/auth/session');
    setUserCode(response.user);
  };
  const getCourse = () => {
    const URL = '/course' + { usercode };
    const response = axios.get(URL);
    setList(response.user.code);
  };
  const save = (e) => {
    e.preventDefault();
    const submitValue = {
      title: title,
    };

    axios.delete('/course', { usercode, submitValue }).then((res) => {
      if (res.success === 'true') {
        alert('강의폐강 성공');
      }
    });
  };

  return (
    <DeleteCourseBlock>
      <>
        <br />
        <br />
        <h1 id="title">폐강</h1>
        <div style={{ margin: '200px' }}>
          <form
            onSubmit={save}
            style={{ marginTop: '1px', marginLeft: '200px' }}
          >
            <FormLabel htmlFor="title">주차</FormLabel>
            <NativeSelect id="title" name="title" onChange={setTitleText}>
              <option value={title}></option>

              {courseItem.map((course) => (
                <option value={course.code}>{course.name}</option>
              ))}
            </NativeSelect>
            <br />

            <button
              type="submit"
              value="저장"
              style={{ backgroundColor: '#3E68F1', color: 'white' }}
            >
              수정하기
            </button>
          </form>
        </div>
      </>
    </DeleteCourseBlock>
  );
};
export default DeleteCoursePage;
