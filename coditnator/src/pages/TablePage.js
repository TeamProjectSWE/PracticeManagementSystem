import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Input from '@material-ui/core/Input';
import NativeSelect from '@material-ui/core/NativeSelect';
import FormLabel from '@material-ui/core/FormLabel';
import { Link } from 'react-router-dom';
import { getRoomInfo, CreateRoom, InRoom } from '../lib/api/allapi';
import Button from '../components/common/Button';

const TablePageBlock = styled.div`
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

const TablePage = ({ match }) => {
  const course_code = match.params.course_code;
  const user_code = match.params.user_code;
  const auth = match.params.auth_code;
  const [rooms, setRooms] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hour, setHour] = useState('');
  const [min, setMin] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response = await getRoomInfo(course_code);
        response = response.data;
        setRooms(response);
      } catch (e) {
        setLoading(false);
      }
    };
    fetchData();
  }, [course_code]);

  const setTitleText = (e) => {
    setTitle(e.target.value);
  };
  const setDescriptionText = (e) => {
    setDescription(e.target.value);
  };
  const setHourText = (e) => {
    setHour(e.target.value);
  };
  const setMinText = (e) => {
    setMin(e.target.value);
  };

  const save = async (e) => {
    e.preventDefault();
    const submitValue = {
      title: title,
      description: description,
      hour: hour,
      min: min,
    };
    console.log(title + '/' + description + '/' + hour + '/' + min);
    let res = await CreateRoom(course_code, submitValue);
    res = res.data;
    // if(res==='true') return alert('룸 생성 성공!');
  };

  // const IntoRoom = (course_code, room_code, user_code) => {
  //   InRoom(course_code).then((res) => {});
  // };

  const renderHeader = () => {
    let headerElement = ['코드', '이름', '시작시간', '종료시간', '룸입장'];

    return headerElement.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>;
    });
  };
  if (!loading) {
    return <TablePageBlock>대기중..</TablePageBlock>;
  }

  const renderBody = () => {
    if (!rooms && rooms.length === 0) {
      return (
        <div>
          <p style={{ marginLeft: '30rem' }}>개설된 룸 없음</p>
        </div>
      );
    } else {
      return (
        rooms &&
        rooms.map((k) => {
          const url =
            '/roompage2/' + k.course_code + '/' + k.code + '/' + user_code;

          return (
            <tr key={k.code}>
              <td>{k.code}</td>
              <td>{k.name}</td>
              <td>{k.open_time}</td>
              <td>{k.close_time}</td>
              <td>
                <Link to={url}>
                  <Button>room입장</Button>
                </Link>
              </td>
            </tr>
          );
        })
      );
    }
  };
  if (auth === 'AUTH000002') {
    return (
      <TablePageBlock>
        <>
          <br />
          <br />
          <h1 id="title">Room</h1>
          <div style={{ margin: '200px' }}>
            <table id="room">
              <thead>
                <tr>
                  {' '}
                  <tbody>{renderBody()}</tbody>
                </tr>
              </thead>
            </table>
          </div>

          <form
            onSubmit={save}
            style={{ marginTop: '1px', marginLeft: '200px' }}
          >
            <FormLabel htmlFor="title">room 이름</FormLabel>
            <Input
              name="title"
              id="title"
              placeholder=""
              onChange={setTitleText}
            />
            <br />
            <FormLabel htmlFor="description">room 설명</FormLabel>
            <Input
              name="decription"
              id="description"
              placeholder=""
              onChange={setDescriptionText}
            />
            <br />
            <FormLabel htmlFor="hour">시</FormLabel>
            <NativeSelect id="hour" name="hour" onChange={setHourText}>
              <option value={hour}></option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </NativeSelect>
            <br />
            <FormLabel htmlFor="min">분</FormLabel>
            <NativeSelect id="min" name="min" onChange={setMinText}>
              <option value={min}></option>
              <option value="0">0</option>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="25">25</option>
              <option value="30">30</option>
              <option value="35">35</option>
              <option value="40">40</option>
              <option value="45">45</option>
              <option value="50">50</option>
              <option value="55">55</option>
            </NativeSelect>
            <br />
            <br />
            <Button
              type="submit"
              style={{ backgroundColor: '#3E68F1', color: 'white' }}
            >
              개설하기
            </Button>
          </form>
        </>
      </TablePageBlock>
    );
  } else if (auth === 'AUTH000001') {
    return (
      <TablePageBlock>
        <>
          <br />
          <br />
          <h1 id="title">Room</h1>
          <div style={{ margin: '200px' }}>
            <table id="room">
              <thead>
                <tr>
                  {' '}
                  <tbody>
                    {renderHeader()}
                    {renderBody()}
                  </tbody>
                </tr>
              </thead>
            </table>
          </div>
        </>
      </TablePageBlock>
    );
  }
};
export default TablePage;
