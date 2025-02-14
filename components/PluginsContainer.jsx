/**
 * Copyright 2016 GeoSolutions Sas
 * Copyright 2016-2024 Sourcepole AG
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {connect} from 'react-redux';

import PropTypes from 'prop-types';

import WindowManager from './WindowManager';

import './style/PluginsContainer.css';

class PluginsContainer extends React.Component {
    static propTypes = {
        customPlugins: PropTypes.array,
        locale: PropTypes.string,
        mode: PropTypes.string,
        plugins: PropTypes.object,
        pluginsAppConfig: PropTypes.object,
        pluginsConfig: PropTypes.object,
        theme: PropTypes.object
    };
    renderPlugins = (pluginsConfig) => {
        const allPlugins = {
            ...this.props.plugins,
            ...(window.qwc2?.__customPlugins ?? {})
        };
        return pluginsConfig.map((pluginConf, idx) => {
            const Plugin = allPlugins[pluginConf.name + "Plugin"];
            // console.log(Plugin, pluginConf)
            if (!Plugin) {
                // eslint-disable-next-line
                console.warn("Non-existing plugin: " + pluginConf.name);
                return null;
            }
            const themeDevicePluginConfig = this.props.theme?.config?.[this.props.mode]?.plugins?.[pluginConf.name] || {};
            const themePluginConfig = this.props.theme?.config?.plugins?.[pluginConf.name] || {};
            const cfg = {...(pluginConf.cfg || {}), ...themePluginConfig, ...themeDevicePluginConfig};
            const appCfg = this.props.pluginsAppConfig[pluginConf.name + "Plugin"] || {};
            return (<Plugin key={pluginConf.name + idx} {...cfg} {...appCfg} />);
        });
    };
    render() {
        if (this.props.pluginsConfig && this.props.locale) {
            return (
                <div id="PluginsContainer">
                    {this.renderPlugins(this.props.pluginsConfig[this.props.mode])}
                    {console.log("What is in PluginsContainer? \n", this)}
                    <WindowManager />
                </div>
            );
        }
        return null;
    }
}

export default connect((state) => ({
    customPlugins: state.localConfig.customPlugins,
    pluginsConfig: state.localConfig.plugins,
    mode: state.browser.mobile ? 'mobile' : 'desktop',
    locale: state.locale.current,
    theme: state.theme.current
}))(PluginsContainer);
