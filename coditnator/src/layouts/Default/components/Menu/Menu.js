import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Logo from '../../../../images/logo/logo.png';

/* ----- Design Import ----- */
import './Menu.scss';

const Menu = props => {
  const { pages, level } = props;

  /* Component */
  const List = props => {
    const { data } = props;
    if(data.title === undefined || data.href === undefined || data.key === undefined || data.level === undefined)
      return null;
    if(data.level > level)
      return null;

    return (
      <Link to={data.href}>
        <li key={data.key}>
          <span>{ data.title }</span>
        </li>
      </Link>
    )
  }
  List.propTypes =  {
    data: PropTypes.object.isRequired
  }

  /* Method */
  const printTitle = (title) => {
    return (
      <img className={'vertical-image'} src={ Logo }  alt={''}/>
    );
  }

  const printList = (list) => {
    if(list === undefined || list.length === 0)
      return <ul />;

    return (
      <ul>
        {pages.list.map((obj) => {
          return (
            <List data={obj}/>
          )
        })}
      </ul>
    );
  }

  /* Return */
  return (
    <div className={'wrap menu'}>
      <div className={'top vertical-image-wrap'}>
        { printTitle(pages.title) }
      </div>
      <div className={'text_menu'}>
        { printList(pages.list) }
      </div>
    </div>
  );
};

Menu.propTypes = {
  pages: PropTypes.object.isRequired,
  level: PropTypes.number.isRequired
};

export default Menu;
