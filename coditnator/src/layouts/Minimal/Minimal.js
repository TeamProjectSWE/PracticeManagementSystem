import React from 'react';
import PropTypes from 'prop-types';

const Minimal = props => {
    const { children, className } = props;

    return (
        <div className={'wrap'}>
            <main className={'wrap'}>{children}</main>
        </div>
    );
};

Minimal.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
};

export default Minimal;
