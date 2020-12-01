import React from 'react';
import styled from 'styled-components';
import axios from 'axios';
const CommentsBlock = styled.div`
  .comment {
    border: 1px solid #ccc;
    padding: 1em;
    margin: 1em 0;
  }
`;
export default class Comments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      id: '',
    };
  }
  handleChange = (e) => {
    this.setState({ comments: e.target.value });
  };
  componentDidMount() {
    axios.get(`/auth/session`).then((res) => {
      this.setState({ id: res.user.code });
    });
    axios.get(`/queston`).then((res) => {
      let comm = [];
      for (var i in res.data) {
        comm.push({ index: i, value: res.data[i] });
      }
      this.setState({ comments: comm });
    });
  }
  handleSubmit = (e) => {
    e.prevenDefault();

    const comments_group = {
      comments: this.state.comments,
    };
    axios.post(`/question`, { comments_group }).then((res) => {
      console.log(res);
      console.log(res.data);
      if (res.data['success'] !== undefined) {
        //등록 성공
        alert('답변등록이 완료되었습니다.');
      } else {
        //로그인 실패
      }
    });
  };

  render() {
    const { comments } = this.state;
    return (
      <CommentsBlock>
        <div className="form-group">
          <form onSubmit={this.handleSubmit}>
            <label>New comment</label>
            <textarea
              className="form-control"
              name="comments"
              onChange={this.handleChange}
            />
            <div className="text-right">
              <button type="submit"> 등록</button>
            </div>
          </form>
        </div>

        {comments.map((comment) => {
          return (
            <div key={comment.index} className="comment">
              {comment.value}
            </div>
          );
        })}
      </CommentsBlock>
    );
  }
}
