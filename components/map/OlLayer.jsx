/**
 * Copyright 2015 GeoSolutions Sas
 * Copyright 2016-2024 Sourcepole AG
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {connect} from 'react-redux';

import ol from 'openlayers';
import PropTypes from 'prop-types';

import {setLayerLoading} from '../../actions/layers';
import CoordinatesUtils from '../../utils/CoordinatesUtils';
import MapUtils from '../../utils/MapUtils';
import Signal from '../../utils/Signal';
import LayerRegistry from './layers/index';

export const OlLayerAdded = new Signal();
export const OlLayerUpdated = new Signal();
import StandardStore from '../../stores/StandardStore';

class OlLayer extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        options: PropTypes.object,
        projection: PropTypes.string,
        setLayerLoading: PropTypes.func,
        swipe: PropTypes.number,
        zIndex: PropTypes.number,
        filters: PropTypes.object
    };

    state = {
        layer: null,
        prevFilter: null, // Store previous filter state
    };

    componentDidMount() {
        this.tilestoload = 0;
        // this.newState = StandardStore.get().getState();
        // Call createLayer initially
        this.createLayer(this.makeOptions(this.props.options));

        console.log(this)
        // Periodically call createLayer every 10 seconds (10000 ms)
        this.intervalId = setInterval(() => {
            this.createLayer(this.makeOptions(this.props.options));
        }, 4000); // Adjust interval as needed

        // console.log("StandardStore:", StandardStore);
        // console.log("Type of StandardStore:", typeof StandardStore);
        // console.log("Does it have subscribe?:", typeof StandardStore.get().subscribe);
        // Subscribe to store updates
        // this.unsubscribe = StandardStore.get().subscribe(() => {
        //     const newState = StandardStore.get().getState();
        //     if (newState?.filter && this.hasFilterChanged(newState.filter) )
        //     {
        //         this.forceUpdate();
        //         // this.setState({ prevFilter: newState.filter });
        //     }
        // //     if (newState?.filter && this.hasFilterChanged(newState.filter)) {
        // //         console.log("Filter updated, calling updateLayer");
        // //         this.updateLayer(this.makeOptions(this.props.options), this.makeOptions(this.props.options));
        // //         this.setState({ prevFilter: newState.filter }); // Update stored filter state
        // //     }
        // });
    }

    componentDidUpdate(prevProps) {
        console.log("UPDATE")
        console.log(this, "\n",prevProps)
        if (!this.state.layer) {
            return;
        }
        console.log(prevProps.filters,this.props.filters )
        if (prevProps.filters !== this.props.filters) {
            console.log("Filters updated, creating layer...");
            this.createLayer();
          }
        const newOptions = this.makeOptions(this.props.options);
        const oldOptions = this.makeOptions(prevProps.options);

        this.updateLayer(newOptions, oldOptions);
        
        // WMS layer handles visibility separately
        if (newOptions.type !== "wms") {
            this.state.layer.setVisible(newOptions.visibility);
        }
        this.state.layer.setOpacity(newOptions.opacity / 255.0);
        this.state.layer.setZIndex(this.props.zIndex);

        if (this.props.swipe !== prevProps.swipe) {
            this.props.map.render();
        }
    }

    componentWillUnmount() {
        // Clear the interval to prevent memory leaks
        clearInterval(this.intervalId);

        if (this.state.layer && this.props.map) {
            this.props.map.removeLayer(this.state.layer);
        }
        // if (this.unsubscribe) this.unsubscribe(); // Unsubscribe from store updates
    }

    hasFilterChanged(newFilter) {
        console.log("Previous filter:", JSON.stringify(this.state.prevFilter));
        console.log("New filter:", JSON.stringify(newFilter));
        return JSON.stringify(newFilter) !== JSON.stringify(this.state.prevFilter);
    }

    render() {
        const layerCreator = LayerRegistry[this.props.options.type];
        // console.log("OL Layer Registery", layerCreator)
        if (layerCreator && layerCreator.render) {
            // console.log("OL Layer Registery", layerCreator)
            return layerCreator.render(this.props.options, this.props.map, this.state.layer);
        }
        return null;
    }
    makeOptions = (options) => {
        console.log("MAking options", options)
        const projection = options.srs || options.crs || options.projection || this.props.projection;
        // const filterValue = `narco:flag='Irani'`
        const newState = StandardStore.get().getState()
        console.log(newState.filter)

        // const { layerName, flag, vessel_name, type, quantity, operator } = newState.filter;
        // // const { layerName, flag, vessel_name, type, quantity, operator } = options.params.FILTER
        // const conditions = [];
        // if (flag) conditions.push(`"flag" = '${flag}'`);
        // if (vessel_name) conditions.push(`"vessel_name" = '${vessel_name}'`);
        // if (type) conditions.push(`"type" = '${type}'`);
        // if (quantity) conditions.push(`"quantity" ${operator} '${quantity}'`);

        // const filterValue = conditions.length > 0 ? `${layerName}: ${conditions.join(" AND ")}` : "";
        // if(newState?.filter && options?.params && filterValue)
        // options.params.FILTER = filterValue;
        return {
            ...options,
            projection: projection,
            opacity: options.opacity !== undefined ? options.opacity : 255,
            minResolution: typeof options.minScale === 'number' ? MapUtils.getResolutionsForScales([options.minScale], projection)[0] : undefined,
            maxResolution: typeof options.maxScale === 'number' ? MapUtils.getResolutionsForScales([options.maxScale], projection)[0] : undefined
        };
    };

    createLayer = (options) => {
        console.log("Create Layer")
        // console.log("options", options);
        let layer = null;
        if (options.type === 'group') {
            layer = new ol.layer.Group({zIndex: this.props.zIndex});
            layer.setLayers(new ol.Collection(options.items.map(item => {
                const layerCreator = LayerRegistry[item.type];
                if (layerCreator) {
                    const sublayer = layerCreator.create(this.makeOptions(item), this.props.map);
                    layer.set('id', options.id + "#" + item.name);
                    return sublayer;
                } else {
                    return null;
                }
            }).filter(x => x)));
        } else {
            const layerCreator = LayerRegistry[options.type];
            if (layerCreator) {
                layer = layerCreator.create(options, this.props.map);
            }
        }
        if (layer) {
            layer.set('id', options.id);
            layer.setVisible(layer.get("empty") !== true && options.visibility);
            layer.setOpacity(options.opacity / 255.0);
            layer.setZIndex(this.props.zIndex);
            this.addLayer(layer, options);
            this.setState({layer: layer});
        }
    };

    updateLayer = (newOptions, oldOptions) => {
        console.log("Update Layer")
        // console.log("options", newOptions, oldOptions);
        if (newOptions === oldOptions) {
            return;
        }
        const layerCreator = LayerRegistry[this.props.options.type];
        if (layerCreator && layerCreator.update) {
            layerCreator.update(
                this.state.layer,
                newOptions,
                oldOptions,
                this.props.map
            );
            OlLayerUpdated.notify(this.state.layer);
        }
    };

    // rerenderLayer = (options, filters) => {
    //     console.log("rerender Layer")
    //     const layerCreator = LayerRegistry[this.props.options.type];
    //     if (layerCreator && layerCreator.update) {
    //         layerCreator.update(
    //             this.state.layer,
    //             newOptions,
    //             oldOptions,
    //             this.props.map
    //         );
    //         OlLayerUpdated.notify(this.state.layer);
    //     }
    // }

    addLayer = (layer, options) => {
        this.props.map.addLayer(layer);
        OlLayerAdded.notify(layer);

        layer.on('prerender', (event) => {
            const ctx = event.context;
            ctx.save();
            ctx.beginPath();
            if (this.props.swipe !== null && this.props.swipe !== undefined) {
                const width = ctx.canvas.width * (this.props.swipe / 100);
                ctx.rect(0, 0, width, ctx.canvas.height);
                ctx.clip();
            }
        });

        layer.on('postrender', (event) => {
            event.context.restore();
        });

        if (options.zoomToExtent && options.bbox && options.bbox.bounds) {
            const map = this.props.map;
            const extent = CoordinatesUtils.reprojectBbox(options.bbox.bounds, options.bbox.crs, map.getView().getProjection());
            try {
                map.getView().fit(extent, map.getSize());
            } catch (e) {
                /* pass */
            }
        }

        const sublayers = {};
        if (layer instanceof ol.layer.Group) {
            layer.getLayers().forEach(sublayer => {
                sublayers[options.id + "#" + sublayer.get('id')] = sublayer;
            });
        } else {
            sublayers[options.id] = layer;
        }

        Object.entries(sublayers).map(([id, sublayer]) => {
            if (sublayer.getSource() && sublayer.getSource().getImageLoadFunction) {
                sublayer.getSource().on('imageloadstart', () => {
                    this.props.setLayerLoading(id, true);
                });
                sublayer.getSource().on('imageloadend', () => {
                    this.props.setLayerLoading(id, false);
                });
                sublayer.getSource().on('imageloaderror', () => {
                    this.props.setLayerLoading(id, false);
                });
            } else if (sublayer.getSource() && sublayer.getSource().getTileLoadFunction) {
                sublayer.getSource().on('tileloadstart', () => {
                    if (this.tilestoload === 0) {
                        this.props.setLayerLoading(id, true);
                    }
                    this.tilestoload++;
                });
                sublayer.getSource().on('tileloadend', () => {
                    this.tilestoload--;
                    if (this.tilestoload === 0) {
                        this.props.setLayerLoading(id, false);
                    }
                });
                sublayer.getSource().on('tileloaderror', () => {
                    this.tilestoload--;
                    if (this.tilestoload === 0) {
                        this.props.setLayerLoading(id, false);
                    }
                });
            } else if (sublayer.getSource() && sublayer.getSource() instanceof ol.source.Vector && sublayer.getSource().getUrl()) {
                sublayer.getSource().on('featuresloadstart', () => {
                    this.props.setLayerLoading(id, true);
                });
                sublayer.getSource().on('featuresloadend', () => {
                    this.props.setLayerLoading(id, false);
                });
                sublayer.getSource().on('featuresloaderror', () => {
                    this.props.setLayerLoading(id, false);
                });
            }
        });
    };
}


export default connect((state) => ({filters: state.filters}), {
    setLayerLoading: setLayerLoading
})(OlLayer);
