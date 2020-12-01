import React, { Component } from 'react';
import styled from 'styled-components';
import Button from '../common/Button';
import axios from 'axios';
const CourseFormBlock = styled.div`
  font-size: 1rem;
  border: none;
  font-weight: bold;
  padding-bottom: 0.5rem;
  outline: none;
  bt {
    position: absolute;

    left: 100px;

    top: 150px;
  }
`;

class CourseForm extends Component {
  state = { usercode: '', name: '', description: '' };
  getID = async () => {
    const response = axios.get('/auth/session');
    this.setState({
      usercode: response.user.code,
      name: '',
      description: '',
    });
  };

  postCourse = async () => {
    const { name, description } = this.state;
    if ([name, description].includes('')) {
      alert('강의명칭 또는 강의설명이 입력되지 않았습니다.');
    }
    const post = await axios.post('/course', {
      name,
      description,
    });
    // alert('전송');
    this.setState({
      name: '',
      description: '',
    });
    console.log(post);
  };
  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };
  getResult = async () => {
    axios.get('/course').then(function (data) {
      if (data['success'] !== undefined) {
        //개설 완료
        alert('개설이 완료되었습니다.');
      } else {
        //개설 실패
      }
    });
  };
  render() {
    return (
      <CourseFormBlock>
        <div>
          <h1>강의 개설</h1>

          <link
            rel="stylesheet"
            href="http://yui.yahooapis.com/pure/0.6.0/pure-min.css"
          />
          <link
            rel="stylesheet"
            href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css"
          />

          <link
            rel="stylesheet"
            href="https://cdn.rawgit.com/dwyl/html-form-send-email-via-google-script-without-server/master/style.css"
          />

          <form
            id="gform"
            method="POST"
            class="pure-form pure-form-stacked"
            action=""
          >
            <fieldset class="pure-group">
              <label for="name">강의 명칭</label>
              <input
                type="text "
                id="name"
                name="name"
                placeholder="입력하세요."
                rows="10"
                cols="100"
                onChange={this.handleChange}
                value={this.state.name}
              />
            </fieldset>

            <fieldset class="pure-group">
              <label for="definition">강의 설명 </label>
              <textarea
                id="description"
                name="description"
                rows="10"
                cols="100"
                placeholder="입력하세요."
                onChange={this.handleChange}
                value={this.state.description}
              ></textarea>
            </fieldset>

            <Button class="bt" cyan width="100%" onClick={this.postCourse}>
              개설
            </Button>
          </form>
        </div>
      </CourseFormBlock>
    );
  }
}
export default CourseForm;
