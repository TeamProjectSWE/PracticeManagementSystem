import React from 'react';
import { withRouter } from 'react-router-dom';

import './NotFoundCover.scss';

const NotFoundCover = props => {
  const { history } = props;

  const handleClick = () => {
    history.goBack();
  };

  return (
    <div className={'not_found_cover'}>
      <button onClick={handleClick}>
        Go Back
      </button>
    </div>
  );
};

export default withRouter(NotFoundCover);
