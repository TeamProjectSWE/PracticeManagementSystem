import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Icon from '@mdi/react';
import { Link, useHistory } from 'react-router-dom';
import { mdiMenu, mdiBellRingOutline , mdiCog, mdiLogout } from '@mdi/js';

/* ----- Design Import ----- */
import './Default.scss';
import { SimpleMenu, Menu } from './components';

/* ----- Data Import ----- */
import { pages } from './data'
import {getSession} from "../../common";

class Default extends React.Component {
    state = {
        session: {},
        visibleMenu: true
    }

    async componentDidMount() {
        let tmp = await getSession(() => {
        });
        this.setState({session: tmp.data});
    }

    /* Method */
    toggleMenu = () => {
        this.setState({ visibleMenu: !this.state.visibleMenu });
    }

    isLogin = () => {
        return true;
    }

    logout = () => {
        // Delete Session
        window.location.href = '/auth/logout';
    }

    render() {
        const {children, history} = this.props;
        const session = this.state.session.success;

        if (!this.isLogin()) {
            history.push('/');
        }

        return (
            <div className={this.state.visibleMenu ? 'layout default' : 'layout default hide_menu'}>
                <div className={'box simple_menu'}>
                    <SimpleMenu pages={pages} level={session ? session.auth.level : 1}/>
                </div>
                <div className={'box menu'}>
                    <Menu pages={pages} ref={right => this.right = right} level={session ? session.auth.level : 1}/>
                </div>
                <div className={'box info flex-align middle'}>
                        <span className={'menu_btn'}>
                            <button onClick={this.toggleMenu} className={'icon_btn'}><Icon path={mdiMenu} size={1.0} color={'black'}/></button>
                        </span>
                    <span className={'my_info'}>
                            <em>CJG</em>
                        </span>
                    <span className={'my_icons'}>
                            <button className={'icon_btn'}><Icon path={mdiBellRingOutline} size={1} color={'#91979D'}/></button>
                            <button className={'icon_btn'}><Icon path={mdiCog} size={1} color={'#91979D'}/></button>
                            <button onClick={this.logout} className={'icon_btn'}><Icon path={mdiLogout} size={1} color={'#F06B78'}/></button>
                        </span>
                </div>
                <div className={'box stepper'}>

                </div>
                <div className={'box contents'}>
                    <main className={'main'}>{children}</main>
                </div>
            </div>
        )
    }
}

Default.propTypes = {
  children: PropTypes.node,
};

export default Default;
