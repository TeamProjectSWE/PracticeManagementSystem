import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import { deleteQuestion, getmyQuestion, getQuestion } from '../lib/api/allapi';
import Button from '../components/common/Button';
const SelectQuestionPageBlock = styled.div``;

const SelectQuestionPage = ({ match }) => {
  const course_code = match.params.course_code;
  const user_code = match.params.user_code;
  const code = match.params.code;
  const auth = match.params.auth;
  console.log(course_code);
  console.log(user_code);
  console.log(auth);
  console.log(code);
  const [questionList, setQuestionList] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (auth === 'AUTH000002') {
          let response = await getQuestion(code);
          response = response.data;
          setQuestionList(response);
        } else if (auth === 'AUTH000001') {
          let response = await getmyQuestion(user_code);
          response = response.data;
          setQuestionList(response);
        }
      } catch (e) {
        setLoading(false);
      }
    };
    fetchData();
  }, [code]);
  //if (!loading) {
  // return <SelectQuestionPageBlock>대기중..</SelectQuestionPageBlock>;
  // }
  if (!questionList && questionList === 0)
    return (
      <div>
        <p style={{ marginLeft: '30rem' }}>질문정보 없음.</p>
      </div>
    );
  const deleteButton = (assigncode, questioncode) => {
    console.log(assigncode + '/' + questioncode);
    let res = deleteQuestion(assigncode, questioncode);
    //res = res.data;
    //res=res.data.success
    res = res.data;
    console.log(res);
    // if (!res) return null;
    // else {
    //  if (res === 'true') {
    //   alert('질문삭제성공!');
    //  } else {
    //   alert('질문삭제실패!');
    //  }
    //}
  };

  return (
    <SelectQuestionPageBlock>
      <div>
        <p>
          <strong>
            <h1 style={{ marginTop: '90px', marginLeft: '100px' }}>질문선택</h1>
          </strong>
        </p>
        <div>
          {questionList &&
            questionList.map((k) => {
              let url1 = '/answer/' + k.code + '/' + user_code + '/' + code;
              let url2 =
                '/reviseQuestion/' + k.code + '/' + user_code + '/' + code;
              if (auth === 'AUTH000002') {
                return (
                  <ListGroup style={{ width: '500px', margin: '190px' }}>
                    <Link to={url1}>
                      <ListGroupItem active tag="a" href="#" action>
                        <tr>
                          제목:
                          <td>
                            {k.title}
                            <br />
                          </td>
                          내용:<td>{k.description}</td>
                        </tr>
                      </ListGroupItem>
                    </Link>
                  </ListGroup>
                );
              } else if (auth === 'AUTH000001') {
                return (
                  <ListGroup style={{ width: '500px', margin: '190px' }}>
                    <ListGroupItem active tag="a" href="#" action>
                      <tr>
                        제목:<td>{k.title}</td>
                        내용:<td>{k.description}</td>
                        <td>
                          <Link to={url2}>
                            <Button style={{ marginLeft: '10px' }}>수정</Button>
                          </Link>
                        </td>
                        <td>
                          <Button
                            style={{ marginLeft: '10px' }}
                            onClick={() =>
                              deleteButton(k.assignment_code, k.code)
                            }
                          >
                            삭제
                          </Button>
                        </td>
                      </tr>
                    </ListGroupItem>
                  </ListGroup>
                );
              }
            })}
        </div>
      </div>
    </SelectQuestionPageBlock>
  );
};
export default SelectQuestionPage;
