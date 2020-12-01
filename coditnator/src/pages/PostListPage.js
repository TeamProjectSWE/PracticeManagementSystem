import React from 'react';
import HeaderContainer from '../containers/common/HeaderContainer';
import styled from 'styled-components';
const PostListPageBlock = styled.div`
  .image1 {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;
const PostListPage = () => {
  return (
    <div>
      <HeaderContainer />
      <PostListPageBlock>
        <div class="image1">
          <div
            class="single-blog-area mb-100 wow fadeInUp"
            data-wow-delay="250ms"
          >
            <img src="images/online.png" alt="" width="500" height="300" />

            <div class="blog-content">
              <h4>온라인 학습 환경에서</h4>

              <p>Coditnator와 함께하세요</p>
            </div>
          </div>
        </div>
      </PostListPageBlock>
    </div>
  );
};

export default PostListPage;
