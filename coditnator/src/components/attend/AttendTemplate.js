import React from 'react';
import styled from 'styled-components';

const AttendTemplateBlock=styled.div`
position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background: #D7E0FC;
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

const AttendTemplate=({children})=>{
    return(
        <AttendTemplateBlock>
            <TableBox>
            {children}
            </TableBox>
        </AttendTemplateBlock>
    );
};
export default AttendTemplate;