import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useMediaQuery } from '@material-ui/core';
import { Topbar } from './components';

import { pages } from './data';

const useStyles = makeStyles(theme => ({
    root: {
        height: '100%',
    },
}));

const Main = props => {
    const { children } = props;
    const classes = useStyles();
    const [openSidebar, setOpenSidebar] = useState(false);

    const handleSidebarOpen = () => {
        setOpenSidebar(true);
    };

    return (
      <div
        className={clsx({
            [classes.root]: true,
        })}
      >
          <Topbar onSidebarOpen={handleSidebarOpen} pages={pages} />
          <main>{children}</main>
      </div>
    );
};

Main.propTypes = {
    children: PropTypes.node,
};

export default Main;
