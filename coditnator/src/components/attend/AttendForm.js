import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Input from '@material-ui/core/Input';
import NativeSelect from '@material-ui/core/NativeSelect';
import FormLabel from '@material-ui/core/FormLabel';
import { AllRoom } from '../../lib/api/allapi';
const AttendFormBlock = styled.div`
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

const URL = '/attendance';

const AttendForm = () => {
  const [rooms, setRooms] = useState([]);
  const [title, setTitle] = useState();
  const [id, setId] = useState('');
  const [attend_v, setAttend] = useState('');
  const [usercode, setCode] = useState('');

  useEffect(() => {
    getData();
  }, []);
  const setIdText = (e) => {
    setId(e.target.value);
  };
  const setTitleText = (e) => {
    setTitle(e.target.value);
  };
  const setAttendText = (e) => {
    setAttend(e.target.value);
  };

  const save = (e) => {
    e.preventDefault();
    const submitValue = {
      title: title,
      id: id,
      attend_v: attend_v,
    };
    axios.get('/auth/session').then((res) => {
      setCode(res.user.code);
    });
    axios.put('/attendance', { usercode, submitValue }).then((res) => {
      console.log(res);
      console.log(res.data);
    });
  };
  const getData = async () => {
    const response = await axios.get(URL);
    setRooms(response.data);
  };
  const getAuth = async () => {
    const response = await axios.get('/auth/session').then(function (data) {
      if (data['success'] !== undefined) {
        //로그인 성공
        if (data.auth.name === 'professor') {
          return (
            <div>
              <h4 style={{ fontWeight: 'bold' }}>출석정보수정</h4>
              <form
                onSubmit={save}
                style={{ marginTop: '1px', marginLeft: '200px' }}
              >
                <FormLabel htmlFor="title">주차</FormLabel>
                <NativeSelect id="title" name="title" onChange={setTitleText}>
                  <option value={title}></option>
                  <option value="ROOM000001">1주차</option>
                  <option value="ROOM000002">2주차</option>
                  <option value="ROOM000003">3주차</option>
                  <option value="ROOM000004">4주차</option>
                  <option value="ROOM000005">5주차</option>
                  <option value="ROOM000006">6주차</option>
                  <option value="ROOM000007">7주차</option>
                  <option value="ROOM000008">8주차</option>
                  <option value="ROOM000009">9주차</option>
                </NativeSelect>
                <br />
                <FormLabel htmlFor="id">아이디</FormLabel>
                <Input
                  name="decription"
                  id="description"
                  placeholder=""
                  onChange={setIdText}
                />
                <br />
                <FormLabel htmlFor="attend_v">출석상태</FormLabel>
                <NativeSelect
                  id="attend_v"
                  name="attend_v"
                  onChange={setAttendText}
                >
                  <option value={attend_v}></option>
                  <option value="1">출석</option>
                  <option value="0">지각</option>
                  <option value="-1">결석</option>
                </NativeSelect>
                <br />
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
          );
        } else if (data.auth.name === 'student') {
        }
      } else {
        //로그인 실패
      }
    });
    setRooms(response.data);
  };

  const renderHeader = () => {
    let headerElement = ['주차', '아이디', '출석상태'];

    return headerElement.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>;
    });
  };

  const renderBody = () => {
    return (
      rooms &&
      rooms.map(({ course_code, user_code, attend_value }) => {
        return (
          <tr key={course_code}>
            <td>{course_code}</td>
            <td>{user_code}</td>
            <td>{attend_value}</td>
          </tr>
        );
      })
    );
  };

  return (
    <AttendFormBlock>
      <>
        <br />
        <br />
        <h1 id="title">출석</h1>
        <div style={{ margin: '200px' }}>
          <table id="room">
            <thead>
              <tr>{renderHeader()}</tr>
            </thead>
            <tbody>{renderBody()}</tbody>
          </table>
        </div>
      </>
    </AttendFormBlock>
  );
};
export default AttendForm;
