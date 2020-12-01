import React from 'react';
import styled from 'styled-components';

const CourseTemplateBlock = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background: white;
  /* flex로 내부 내용 중앙 정렬 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const InformBox = styled.div`
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.025);
  padding: 2rem;
  width: 600px;
  height: 580px;
  background: #d7e0fc;
  border-radius: 2px;
`;

const CourseTemplate = ({ children }) => {
  return (
    <CourseTemplateBlock>
      <InformBox>{children}</InformBox>
    </CourseTemplateBlock>
  );
};
export default CourseTemplate;
