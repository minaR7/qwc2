/**
 * Copyright 2024 Sourcepole AG
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {connect} from 'react-redux';

import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import VectorSource from '@giro3d/giro3d/sources/VectorSource';
import ol from 'openlayers';
import PropTypes from 'prop-types';
import {createSelector} from 'reselect';
import {Group} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer.js';

import searchProvidersSelector from '../../selectors/searchproviders';
import CoordinatesUtils from '../../utils/CoordinatesUtils';
import FeatureStyles from '../../utils/FeatureStyles';
import VectorLayerUtils from '../../utils/VectorLayerUtils';
import SearchWidget from '../widgets/SearchWidget';
import pinModel from './models/pin.glb';

import './style/SearchField3D.css';


class SearchField3D extends React.Component {
    static propTypes = {
        sceneContext: PropTypes.object,
        searchProviders: PropTypes.object
    };

    render() {
        return (
            <SearchWidget
                queryGeometries
                resultSelected={this.searchResultSelected}
                searchParams={{mapcrs: this.props.sceneContext.mapCrs, displaycrs: this.props.sceneContext.mapCrs}}
                searchProviders={Object.values(this.props.searchProviders)}
                value={""}
            />
        );
    }
    searchResultSelected = (result) => {
        const sceneContext = this.props.sceneContext;
        sceneContext.removeLayer("__searchHighlight");
        sceneContext.removeSceneObject("__searchMarker");
        if (!result) {
            return;
        }
        const mapCrs = sceneContext.mapCrs;
        const scenePos = CoordinatesUtils.reproject([result.x, result.y], result.crs ?? mapCrs, mapCrs);

        // Add higlight geometry
        if (result.feature && result.feature?.geometry?.type !== "Point") {
            const format = new ol.format.GeoJSON();
            const olFeatures = format.readFeatures(result.feature, {
                dataProjection: result.crs ?? mapCrs, featureProjection: mapCrs
            });
            const highlightLayer = new ColorLayer({
                source: new VectorSource({
                    data: olFeatures,
                    format: format,
                    style: (feat) => FeatureStyles.default(feat, {})
                })
            });
            sceneContext.addLayer("__searchHighlight", highlightLayer);
        }

        // Zoom to bounds
        const bounds = result.feature ? VectorLayerUtils.computeFeatureBBox(result.feature) : [
            scenePos[0] - 500, scenePos[1] - 500,
            scenePos[0] + 500, scenePos[1] + 500
        ];

        sceneContext.setViewToExtent(bounds, 0);
        // Add pin and label at result position above terrain
        sceneContext.getTerrainHeight(scenePos).then((terrainHeight) => {

            const loader = new GLTFLoader();
            loader.load(pinModel, (gltf) => {
                const searchMarker = new Group();

                // Add pin
                const pin = gltf.scene;
                pin.position.x = scenePos[0];
                pin.position.y = scenePos[1];
                pin.position.z = terrainHeight;
                pin.rotation.x = Math.PI / 2;
                pin.updateMatrixWorld();
                searchMarker.add(pin);

                // Add label
                const labelEl = document.createElement("span");
                labelEl.innerText = result.label ?? result.text;
                labelEl.className = "map3d-search-pin-label";
                const label = new CSS2DObject(labelEl);
                label.position.set(scenePos[0], scenePos[1], terrainHeight + 2);
                label.updateMatrixWorld();
                searchMarker.add(label);

                sceneContext.addSceneObject("__searchMarker", searchMarker);

                // Scale search marker with distance
                const scaleSearchMarker = () => {
                    const distance = sceneContext.scene.view.camera.position.distanceTo(pin.position) / 30;
                    const scale = Math.max(1, distance);
                    label.position.z = terrainHeight + 2 * scale;
                    label.updateMatrixWorld();
                    pin.scale.set(scale, scale, scale);
                    pin.updateMatrixWorld();
                };

                sceneContext.scene.view.controls.addEventListener('change', scaleSearchMarker);
                searchMarker.addEventListener('removed', () => {
                    sceneContext.scene.view.controls.removeEventListener('change', scaleSearchMarker);
                    // The label DOM element is not removed when the searchMarker group is removed from the instance
                    labelEl.parentNode.removeChild(labelEl);
                });
            });
        });
    };
}

export default connect(
    createSelector([state => state, searchProvidersSelector], (state, searchProviders) => ({
        searchProviders
    }))
)(SearchField3D);
