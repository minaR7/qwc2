/**
 * Copyright 2024 Sourcepole AG
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';

import {AppMenu} from '../AppMenu';
import Icon from '../Icon';
import SearchField3D from './SearchField3D';

import './style/TopBar3D.css';

export default class TopBar3D extends React.Component {
    static propTypes = {
        sceneContext: PropTypes.object,
        taskContext: PropTypes.object
    };
    state = {
    };
    render() {
        const menuItems = [
            {key: "LayerTree3D", icon: "layers"}
        ];
        return (
            <div className="map3d-topbar">
                <SearchField3D sceneContext={this.props.sceneContext} />
                <span className="map3d-topbar-spacer" />
                <AppMenu appMenuClearsTask buttonContents={this.menuButtonContents()}
                    currentTask={this.props.taskContext.currentTask} menuItems={menuItems}
                    setCurrentTask={this.props.taskContext.setCurrentTask} />
            </div>
        );
    }
    menuButtonContents = () => {
        return (
            <span className="map3d-topbar-menu-button">
                <Icon icon="menu-hamburger"/>
            </span>
        );
    };
}
