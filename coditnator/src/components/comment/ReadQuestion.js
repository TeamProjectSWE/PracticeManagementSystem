import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
//styling
const Wrap = styled.div`
  padding: 20px;
  h2 {
    padding-bottom: 20px;
    border-bottom: 1px solid #ccc;
  }
  p {
    min-height: 200px;
  }
`;
const Button = styled.div`
  border-top: 1px solid #eee;
  padding: 20px;
  a {
    float: right;
    padding: 10px 20px;
    border-radius: 5px;
    text-decoration: none;
    background: #f2f2f2;
    border: 1px solid #ddd;
    color: #424242;
    font-size: 16px;
  }
  a + a {
    margin-right: 5px;
  }
`;
const URL = '/question';
class ReadQuestion extends Component {
  state = { id: '', board: [] }; //로딩 데이터
  getEmployees() {
    return axios.get('/question');
  }
  getID = async () => {
    try {
      // const id = 0; //test id
      const response = await axios.get(`/auth/session`);
      this.setState({
        id: response.user.code,
      });
      console.log(response.user.code);
    } catch (e) {
      console.log(e);
    }
  };
  loadingData = async () => {
    try {
      // const id = 0; //test id
      const { id } = this.props.match.params;
      console.log(id);
      const response = await axios.get(`question/${id}`);
      this.setState({
        // boards: 'test'
        board: response.data,
      });
      console.log(response.data);
    } catch (e) {
      console.log(e);
    }
  };
  componentDidMount() {
    const { getID, loadingData } = this;
    getID();
    loadingData();
  }
  UpdatePost() {
    axios
      .post('/board' + this.board)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  DeletePost() {
    axios
      .delete(`${URL}/${this.id}`)
      .then(function (response) {
        // handle success
        console.log(response);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        // always executed
      });
  }
  render() {
    const { board } = this.state;
    return (
      <Wrap>
        <h2>{board.title}</h2>
        <p>{board.content}</p>
        <Button>
          <Link to="/Qplist">목록</Link>
          <a onClick={() => this.UpdatePost()}>수정</a>
          <a onClick={() => this.DeletePost()}>삭제</a>
        </Button>
      </Wrap>
    );
  }
}

export default ReadQuestion;
