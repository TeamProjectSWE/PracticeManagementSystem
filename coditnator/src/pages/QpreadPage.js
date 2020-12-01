import React from 'react';
import styled from 'styled-components';
import Comments from '../components/comment/Comments';

import ReadQuestion from '../components/comment/ReadQuestion';

const QpreadPageBlock = styled.div``;

const QpreadPage = () => {
  return (
    <QpreadPageBlock>
      <ReadQuestion />
      <Comments />
    </QpreadPageBlock>
  );
};
export default QpreadPage;
