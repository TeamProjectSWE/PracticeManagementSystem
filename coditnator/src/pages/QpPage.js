import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import { AllAssign } from '../lib/api/allapi';
import Button from '../components/common/Button';
const QpPageBlock = styled.div``;
const QpFormBlock = styled.div``;
const QpPage = ({ match }) => {
  const course_code = match.params.course_code;
  const user_code = match.params.user_code;
  const auth = match.params.auth;
  const [problemList, setProblemList] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response = await AllAssign(course_code);
        console.log('----' + course_code);
        response = response.data;
        setProblemList(response);
      } catch (e) {
        setLoading(false);
      }
    };
    fetchData();
  }, [course_code]);
  if (!loading) {
    return <QpPageBlock>대기중..</QpPageBlock>;
  }
  if (!problemList && problemList.length === 0)
    return (
      <div>
        <p style={{ marginLeft: '30rem' }}>등록된 과제가 없습니다.</p>
      </div>
    );
  if (auth === 'AUTH000002') {
    return (
      <div>
        <QpFormBlock>
          <div>
            <p>
              <strong>
                <h1 style={{ marginTop: '90px', marginLeft: '100px' }}>
                  과제선택
                </h1>
              </strong>
            </p>
            <div>
              {problemList &&
                problemList.map((k) => {
                  let url =
                    '/select/' +
                    course_code +
                    '/' +
                    user_code +
                    '/' +
                    k.code +
                    '/' +
                    auth;
                  return (
                    <ListGroup style={{ width: '500px', margin: '190px' }}>
                      <Link to={url}>
                        <ListGroupItem active tag="a" href="#" action>
                          {k.code}
                        </ListGroupItem>
                      </Link>
                    </ListGroup>
                  );
                })}
            </div>
          </div>
        </QpFormBlock>
      </div>
    );
  } else if (auth === 'AUTH000001') {
    return (
      <div>
        <QpFormBlock>
          <div>
            <p>
              <strong>
                <h1 style={{ marginTop: '90px', marginLeft: '100px' }}>과제</h1>
              </strong>
            </p>
            <div>
              {problemList &&
                problemList.map((k) => {
                  let url =
                    '/Qpwrite/' +
                    course_code +
                    '/' +
                    user_code +
                    '/' +
                    k.code +
                    '/' +
                    auth;
                  let url_2 =
                    '/select/' +
                    course_code +
                    '/' +
                    user_code +
                    '/' +
                    k.code +
                    '/' +
                    auth;
                  return (
                    <div>
                      <ListGroup style={{ width: '500px', margin: '190px' }}>
                        <ListGroupItem active tag="a" href="#" action>
                          {k.code}
                          <Link to={url}>
                            {' '}
                            <Button
                              style={{
                                backgroundColor: 'white',
                                color: 'black',
                                marginLeft: '5px',
                              }}
                            >
                              질문등록
                            </Button>{' '}
                          </Link>{' '}
                        </ListGroupItem>
                      </ListGroup>
                      <div>
                        <Link to={url_2}>
                          <Button style={{ width: '500px', margin: '190px' }}>
                            내 과거 질문
                          </Button>{' '}
                        </Link>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </QpFormBlock>
      </div>
    );
  }
};
export default QpPage;
