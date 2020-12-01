import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@mdi/react';
import { Link } from 'react-router-dom';
import { mdiBookmarkMultipleOutline, mdiFolderGoogleDrive, mdiCodeBraces } from '@mdi/js';

/* ----- Design Import ----- */
import './SimpleMenu.scss';

const SimpleMenu = props => {
  const { pages } = props;

  /* Component */
  const List = props => {
    const { data } = props;
    if(data.icon === undefined || data.href === undefined || data.key === undefined)
      return <li key={'undefined'} />;

    let iconPath;
    switch (data.icon){
      case 'mdiBookmarkMultipleOutline':
        iconPath = mdiBookmarkMultipleOutline; break;
      case 'mdiCodeBraces':
        iconPath = mdiCodeBraces; break;
      case 'mdiFolderGoogleDrive':
        iconPath = mdiFolderGoogleDrive; break;
      default:
        return <li key={'undefined'} />;
    }

    return (
      <Link to={data.href}>
        <li key={data.key}>
          <span><Icon path={iconPath} size={1} color={'white'} /></span>
        </li>
      </Link>
    )
  }
  List.propTypes =  {
    data: PropTypes.object.isRequired
  }

  /* Method */
  const printTitle = (title) => {
    if(title === undefined || title.icon === undefined)
      return <span />;

    return (
      <span>{ title.icon }</span>
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
    <div className={'wrap simple_menu'}>
      <div className={'top'}>
        { printTitle(pages.title) }
      </div>
      <div className={'icon_menu'}>
        { printList(pages.list) }
      </div>
    </div>
  );
};

SimpleMenu.propTypes = {
  pages: PropTypes.object.isRequired,
};

export default SimpleMenu;
