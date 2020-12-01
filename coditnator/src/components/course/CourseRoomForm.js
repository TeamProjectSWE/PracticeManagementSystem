import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { getSession, getUserCourse, deleteCourse } from '../../lib/api/allapi';

import {
  Card,
  CardTitle,
  CardText,
  CardGroup,
  CardSubtitle,
  CardBody,
} from 'reactstrap';
import { Button } from 'reactstrap';

const CourseRoomFormBlock = styled.div`
  h1 {
    margin: 0;
    margin-bottom: 1rem;
  }
`;

const CourseRoomForm = () => {
  const [CourseList, setCourseList] = useState([]);
  const [id, setID] = useState('');
  const [auth, setAuth] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // let response = getSession();
        // let response1 = response.data.user.code;
        // let response2 = response.data.auth.authority_code;
        // setID(response1);
        // setAuth(response2);\
        setID('USER000002');
        setAuth('AUTH000002');
        let res = await getUserCourse('USER000002');
        setCourseList(res.data);
      } catch (e) {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);
  const deleteButton = (code) => {
    console.log(code + '/' + id);
    let res = deleteCourse(code, id);
    //res = res.data;
    //res=res.data.success
    res = res.data;
    //if (!res) return null;
    // else {
    // if (res === 'true') {
    //alert('폐강성공!');
    // } else {
    //  alert('폐강실패!');
    // }
    //}
  };
  const renderCardFoot = (code) => {
    if (auth === 'AUTH000002') {
      //교수
      const url8 = '/QuestionProblem/' + code + '/' + id + '/' + auth;
      const url1 = '/roompage1/' + code + '/' + id + '/' + auth;
      const url2 = '/attendance/' + code + '/' + id + '/' + auth;
      const url3 = '/revisecourse/' + code + '/' + id;
      const url4 = '/revisecourse/' + code + '/' + id;
      return (
        <div>
          <Link to={url8}>
            <Button to="/" color="primary">
              질문
            </Button>{' '}
          </Link>
          <Link to={url1}>
            <Button color="warning">Room</Button>{' '}
          </Link>
          <Link to={url2}>
            <Button color="success">출석정보 수정</Button>{' '}
          </Link>
          <Link to={url3}>
            <Button color="info">강의정보 수정</Button>{' '}
          </Link>
          <Link to={url4}>
            {/*예비로 해둠 */}
            <Button color="secondary">과제</Button>{' '}
          </Link>
          <Button onClick={() => deleteButton(code)} color="danger">
            강의 폐강
          </Button>{' '}
        </div>
      );
    } else if (auth === 'AUTH000001') {
      //학생
      const url = '/roompage1/' + code + '/' + id + '/' + auth;
      const url1 = '/attendance/' + code + '/' + id + '/' + auth;
      const url8 = '/QuestionProblem/' + code + '/' + id + '/' + auth;
      return (
        <div>
          <Link to={url8}>
            <Button to="/" color="primary">
              질문
            </Button>{' '}
          </Link>
          <Link to={url}>
            <Button color="warning">Room</Button>{' '}
          </Link>

          <Link to={url1}>
            <Button color="success">출석</Button>{' '}
          </Link>
          <Link to={url1}>
            {/*예비로 해둠 */}
            <Button color="info">과제</Button>{' '}
          </Link>
        </div>
      );
    }
  };
  const renderbutton = () => {
    const url = '/opencourse/' + id;
    const url1 = '/registercourse/' + id;

    if (auth === 'AUTH000002') {
      //교수
      return (
        <div>
          <Link to={url}>
            <Button color="secondary" style={{ width: '100px' }}>
              개설
            </Button>
          </Link>
        </div>
      );
    } else if (auth === 'AUTH000001') {
      //학생
      return (
        <div>
          <Link to={url1}>
            <Button color="secondary" style={{ width: '100px' }}>
              신청
            </Button>
          </Link>
        </div>
      );
    }
  };
  if (!loading) {
    return <CourseRoomFormBlock>대기중..</CourseRoomFormBlock>;
  }

  if (!auth)
    return (
      <div>
        <p style={{ marginLeft: '30rem' }}>정보를 받아오는 중..</p>
      </div>
    );
  if (!CourseList && CourseList.length === 0)
    return (
      <div>
        <div style={{ marginTop: '5rem', marginLeft: '10rem' }}>
          <h1>강의실</h1>
          {renderbutton()}
        </div>

        <CardGroup
          style={{ margin: '10rem', marginLeft: '10rem', width: '800px' }}
        ></CardGroup>
        <Card>
          <p style={{ marginLeft: '30rem' }}>등록된강의가 없습니다.</p>
        </Card>
      </div>
    );
  return (
    <CourseRoomFormBlock>
      <div style={{ marginTop: '5rem', marginLeft: '10rem' }}>
        <h1>강의실</h1>
        {renderbutton()}
      </div>

      <CardGroup
        style={{ margin: '10rem', marginLeft: '10rem', width: '800px' }}
      >
        <div>
          <Card>
            {CourseList &&
              CourseList.map((k) => {
                return (
                  <CardBody key={k.code}>
                    <CardTitle tag="h5"> {k.name}</CardTitle>
                    <CardSubtitle tag="h6" className="mb-2 text-muted">
                      {' '}
                    </CardSubtitle>
                    <CardText>{k.description}</CardText>

                    {renderCardFoot(k.code)}
                  </CardBody>
                );
              })}
          </Card>
        </div>
      </CardGroup>
    </CourseRoomFormBlock>
  );
};
export default CourseRoomForm;
