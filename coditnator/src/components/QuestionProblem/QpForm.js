import React from 'react';
import styled from 'styled-components';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const QpFormBlock = styled.div``;

export default class QpForm extends React.Component {
  state = {
    problemList: [],
  };

  componentDidMount() {
    axios.get('/questionProblem').then((res) => {
      const problemList = res.data;
      this.setState(problemList);
    });
  }
  render() {
    return (
      <QpFormBlock>
        <div>
          <p>
            <strong>
              <h1 style={{ marginTop: '90px', marginLeft: '100px' }}>
                문제선택
              </h1>
            </strong>
          </p>
          <ListGroup style={{ width: '500px', margin: '190px' }}>
            <Link to="/Qplist">
              {this.state.problemList.map((listdata) => (
                <ListGroupItem active tag="a" href="#" action>
                  {listdata.id}
                </ListGroupItem>
              ))}
            </Link>

            {/*<ListGroupItem disabled tag="a" href="#" action>
            Vestibulum at eros
  </ListGroupItem>*/}
          </ListGroup>
          <p />
        </div>
      </QpFormBlock>
    );
  }
}
