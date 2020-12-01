import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Input from '@material-ui/core/Input';
import NativeSelect from '@material-ui/core/NativeSelect';
import FormLabel from '@material-ui/core/FormLabel';
const StudentRegisterCourseBlock = styled.div`
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

const StudentRegisterCourse = () => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [usercode, setUser] = useState('');
  const [courseitem, setCourseitem] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/courseAll');
        setCourseitem(response.data.course);
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    };
    fetchData();
  }, []);
  useEffect(() => {
    const getID = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/auth/session');
        setUser(response.user.code);
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    };
    getID();
  }, []);
  if (loading) {
    return <p>대기중</p>;
  }

  const setIdText = (e) => {
    setId(e.target.value);
  };
  const setNameText = (e) => {
    setName(e.target.value);
  };

  const save = (e) => {
    e.preventDefault();
    const submitValue = {
      name: name,
      id: id,
    };
    axios.post('/course/enrolment', { usercode, submitValue }).then((res) => {
      console.log(res);
      console.log(res.data);
    });
  };
  const renderHeader = () => {
    let headerElement = ['강의명', '강의설명'];

    return headerElement.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>;
    });
  };
  const renderBody = () => {
    return courseitem.map((item) => (
      <div>
        <tr key={item.code}>
          <td>{item.name}</td>
          <td>{item.description}</td>
        </tr>
      </div>
    ));
  };
  return (
    <StudentRegisterCourseBlock>
      <>
        <br />
        <h1 id="title" style={{ fontWeight: 'bold' }}>
          개설강의 목록
        </h1>
        <div style={{ margin: '200px' }}>
          <table id="room">
            <thead>
              <tr>{renderHeader()}</tr>
            </thead>
            <tbody>{renderBody()}</tbody>
          </table>
        </div>
        <h1 id="title" style={{ fontWeight: 'bold' }}>
          강의 신청
        </h1>
        <br />
        <form onSubmit={save} style={{ marginTop: '1px', marginLeft: '200px' }}>
          <FormLabel htmlFor="name">강의명</FormLabel>
          <NativeSelect id="name" name="title" onChange={setNameText}>
            <option value={name}></option>
            {courseitem.map((item) => (
              <option value={item.code}>{item.name}</option>
            ))}
          </NativeSelect>
          <br />
          <FormLabel htmlFor="id">아이디</FormLabel>
          <Input
            name="id"
            id="id"
            placeholder="본인 아이디 입력"
            onChange={setIdText}
          />
          <br />
          <button
            type="submit"
            value="저장"
            style={{ backgroundColor: '#3E68F1', color: 'white' }}
          >
            신청하기
          </button>
        </form>
      </>
    </StudentRegisterCourseBlock>
  );
};
export default StudentRegisterCourse;
