import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import NativeSelect from '@material-ui/core/NativeSelect';
import FormLabel from '@material-ui/core/FormLabel';
import { getAllCourse, registerCourse } from '../lib/api/allapi';
import Button from '../components/common/Button';
const RegisterCoursePageBlock = styled.div``;
const AttendTemplateBlock = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;

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
const RegisterCoursePage = ({ match }) => {
  const user_code = match.params.user_code;
  const [name, setName] = useState('');
  const [courseitem, setCourseitem] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response = await getAllCourse();
        response = response.data;
        setCourseitem(response);
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const setNameText = (e) => {
    setName(e.target.value);
  };

  const save = (e) => {
    e.preventDefault();
    const submitValue = {
      name: name,
    };
    console.log(name);
    console.log(user_code);
    registerCourse(submitValue, user_code).then(function (data) {
      // if (data['success'] !== undefined) {
      //수강 신청성공
      //  alert('수강 신청 성공!');
      //  } else {
      //로그인 실패
      //  alert('수강 신청 실패!');
      //  }
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
      <tr key={item.code}>
        <td>{item.name}</td>
        <td>{item.description}</td>
      </tr>
    ));
  };
  return (
    <RegisterCoursePageBlock>
      <AttendTemplateBlock>
        <TableBox>
          <StudentRegisterCourseBlock>
            <>
              <div style={{ marginTop: '100px' }}>
                <h1 style={{ fontWeight: 'bold' }}>강의 신청</h1>
                <br />
                <form
                  onSubmit={save}
                  style={{ marginTop: '1px', marginLeft: '200px' }}
                >
                  <FormLabel htmlFor="name">강의명</FormLabel>
                  <NativeSelect id="name" name="title" onChange={setNameText}>
                    {courseitem.map((item) => (
                      <option value={item.code}>{item.name}</option>
                    ))}
                  </NativeSelect>
                  <br />
                  <Button
                    type="submit"
                    style={{
                      backgroundColor: '#3E68F1',
                      color: 'white',
                      marginTop: '10px',
                      width: '200px',
                    }}
                  >
                    신청하기
                  </Button>
                </form>
              </div>
              <br />
              <h1 style={{ fontWeight: 'bold' }}>개설강의 목록</h1>
              <div>
                <table id="room">
                  <thead>
                    <tr>{renderHeader()}</tr>
                  </thead>
                  <tbody>{renderBody()}</tbody>
                </table>
              </div>
            </>
          </StudentRegisterCourseBlock>
        </TableBox>
      </AttendTemplateBlock>
    </RegisterCoursePageBlock>
  );
};
export default RegisterCoursePage;
