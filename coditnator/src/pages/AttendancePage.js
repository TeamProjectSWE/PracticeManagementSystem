import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Input from '@material-ui/core/Input';
import NativeSelect from '@material-ui/core/NativeSelect';
import FormLabel from '@material-ui/core/FormLabel';
import { AllRoom, reviseAttend, StudentAttend } from '../lib/api/allapi';
import Button from '../components/common/Button';

const AttendTemplateBlock = styled.div`
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
const TableBox = styled.div`
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.025);
  padding: 2rem;
  width: 1000px;
  background: white;
  border-radius: 2px;
`;
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

const AtttendancePage = ({ match }) => {
  const course_code = match.params.course_code;
  const user_code = match.params.user_code;
  const auth = match.params.auth;
  console.log(course_code);
  console.log(user_code);
  console.log(auth);
  const [rooms, setRooms] = useState([]);
  const [strooms, setSRooms] = useState([]);
  const [title, setTitle] = useState();
  const [id, setId] = useState('');
  const [attendance, setAttend] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response = await AllRoom(course_code);
        response = response.data;
        setRooms(response);
        let response1 = await StudentAttend(course_code, user_code);
        setSRooms(response1.data);
      } catch (e) {
        setLoading(false);
      }
    };
    fetchData();
  }, [course_code, user_code]);

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
      attendance: attendance,
    };
    console.log(title + '/' + id + '/' + attendance);
    let res = reviseAttend(course_code, submitValue);
    // if (res['success'] !== undefined) {
    //  alert('출석정보 수정 완료');
    // } else {
    //  alert('출석정보 수정 실패');
    // }
  };
  if (!loading) {
    return <AttendTemplateBlock>대기중..</AttendTemplateBlock>;
  }
  if (!rooms)
    return (
      <div>
        <p style={{ marginLeft: '30rem' }}>정보를 받아오는 중..</p>
      </div>
    );
  const revise = () => {
    if (auth === 'AUTH000002') {
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
              <option value={attendance}></option>
              <option value="1">출석</option>
              <option value="0">결석</option>
            </NativeSelect>
            <br />
            <br />
            <Button
              type="submit"
              value="저장"
              style={{ backgroundColor: '#3E68F1', color: 'white' }}
            >
              수정하기
            </Button>
          </form>
        </div>
      );
    } else {
      return <div></div>;
    }
  };

  const renderHeader = () => {
    let headerElement = [
      '주차',
      '아이디',
      '강의소요시간',
      '출석한 시간',
      '출석여부',
    ];
    let headerElement1 = ['주차', '강의소요시간', '출석한 시간', '출석여부'];
    if (auth === 'AUTH000002') {
      return headerElement.map((key, index) => {
        return <th key={index}>{key.toUpperCase()}</th>;
      });
    } else if (auth === 'AUTH000001') {
      return headerElement1.map((key, index) => {
        return <th key={index}>{key.toUpperCase()}</th>;
      });
    }
  };

  const renderBody = () => {
    if (auth === 'AUTH000002') {
      return (
        rooms &&
        rooms.map(({ code, user_code, class_time, attend_time, attend }) => {
          return (
            <tr key={code}>
              <td>{code}</td>
              <td>{user_code}</td>
              <td>{class_time}</td>
              <td>{attend_time}</td>
              <td>{attend ? 'O' : 'X'}</td>
            </tr>
          );
        })
      );
    } else if (auth === 'AUTH000001') {
      return (
        strooms &&
        strooms.map(({ code, class_time, attend_time, attend }) => {
          return (
            <tr key={code}>
              <td>{code}</td>
              <td>{class_time}</td>
              <td>{attend_time}</td>
              <td>{attend ? 'O' : 'X'}</td>
            </tr>
          );
        })
      );
    }
  };

  return (
    <AttendTemplateBlock>
      <TableBox>
        <AttendFormBlock style={{ marginTop: '300px' }}>
          <>
            <div style={{ margin: '100px' }}>
              <h1 style={{ fontWeight: 'bold' }}>출석</h1>
              <table id="room">
                <thead>
                  <tr style={{ marginTop: '900px' }}>{renderHeader()}</tr>
                </thead>
                <tbody>{renderBody()}</tbody>
              </table>
            </div>
            {revise()}
          </>
        </AttendFormBlock>
      </TableBox>
    </AttendTemplateBlock>
  );
};

export default AtttendancePage;
