/**
 * Copyright 2015 GeoSolutions Sas
 * Copyright 2016-2024 Sourcepole AG
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import {connect} from 'react-redux';
import StandardStore from '../../../stores/StandardStore';
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource.js';
import axios from 'axios';
import ol from 'openlayers';
import url from 'url';

import ConfigUtils from '../../../utils/ConfigUtils';
import CoordinatesUtils from '../../../utils/CoordinatesUtils';
import MiscUtils from '../../../utils/MiscUtils';
import {UrlParams} from '../../../utils/PermaLinkUtils';

function periodicWmsImageLoad(image, src, interval = 100000) { // Default interval: 5000ms
    const loadImage = () => wmsImageLoadFunction(image, src);

    // Initial call to load the image immediately
    loadImage();

    // Start periodic calls
    const timerId = setInterval(loadImage, interval);

    // Return the timerId for stopping the periodic calls later
    return timerId;
}

function periodicLayerCreation(options, map, interval) {
    setInterval(() => {
        const layer = createLayer(options, map);
        console.log('Layer created periodically:', layer);
    }, interval);
}

function wmsImageLoadFunction(image, src) {
    const maxUrlLength = ConfigUtils.getConfigProp("wmsMaxGetUrlLength", null, 2048);
    // console.log(`[${new Date().toLocaleTimeString()}]`,"WMSLayer.js => wmsImageLoadFunction: ", image, src, maxUrlLength )
    const postOrigins = ConfigUtils.getConfigProp("wmsPostOrigins", null, []);
    const reqOrigin = (new URL(src, location.href)).origin;
    if (src.length > maxUrlLength && (location.origin === reqOrigin || postOrigins.includes(reqOrigin))) {
        // Switch to POST if url is too long
        const urlParts = src.split("?");
        urlParts[1] += "&csrf_token=" + MiscUtils.getCsrfToken();
        const options = {
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            responseType: "blob"
        };
        axios.post(urlParts[0], urlParts[1], options).then(response => {
            console.log("wmsImageLoadFunction POST req: ", urlParts)
            const reader = new FileReader();
            reader.readAsDataURL(response.data);
            reader.onload = () => {
                image.src = reader.result;
            };
        }).catch(() => {
            console.log("Fall back to GET")
            // Fall back to GET
            image.src = src;
        });
    } else {
        console.log("Fall back to GET")
        image.src = src;
    }
}

function wmsToOpenlayersOptions(options) {
    console.log("options", options)
    // Get filter state from Redux store
    const state = StandardStore.get().getState();
    console.log(state.filter)
    // const filterValue = `narco: "flag" = ${state.filter.filterParam}`
    // const filterValue = `narco: "flag" = Irani`
    const urlParams = Object.entries(url.parse(options.url, true).query).reduce((res, [key, val]) => ({...res, [key.toUpperCase()]: val}), {});
    const urlFilter = UrlParams.getParams()['f'];
    // console.log("new technique for filter:", urlParams, urlFilter)

    
    const { layerName, flag, vessel_name, type, quantity, operator, ssr_country, ssr_boat_name, ssr_own_ship, ssr_no_of_crew, ssr_boat_regno, name, vessel_id, vessel_ssvid, vessel_flag, } = state.filter;
    // const { layerName, flag, vessel_name, type, quantity, operator } = options.params.FILTER
    const conditions = [];
    if (flag && flag!=="all") conditions.push(`"flag" = '${flag}'`);
    if (vessel_name && vessel_name!=="") conditions.push(`"vessel_name" = '${vessel_name}'`);
    if (name && name!=="") conditions.push(`"name" = '${name}'`);
    if (layerName!=="density_map" && type) conditions.push(`"type" = '${type}'`);
    if (quantity) conditions.push(`"quantity" ${operator} ${quantity}`);
    if (ssr_country && ssr_country!=="all") conditions.push(`"ssr_country" = '${ssr_country}'`);
    if (ssr_boat_name && ssr_boat_name!=="") conditions.push(`"ssr_boat_name" = '${ssr_boat_name}'`);
    if (ssr_own_ship && ssr_own_ship!=="") conditions.push(`"ssr_own_ship" = '${ssr_own_ship}'`);
    if (ssr_boat_regno && ssr_boat_regno!=="") conditions.push(`"ssr_boat_regno" = '${ssr_boat_regno}'`);
    if (ssr_no_of_crew) conditions.push(`"ssr_no_of_crew" ${operator} '${ssr_no_of_crew}'`);
    console.log("filter condition",conditions)

    const filterValue = conditions.length > 0 ? `${layerName}: ${conditions.join(" OR ")}` : "";
    if(state?.filter && options?.params)
    options.params.FILTER = filterValue;
    console.log("FILTER", options.params.FILTER,"\n",filterValue)
    return {
        ...urlParams,
        LAYERS: options.name,
        STYLES: options.style || "",
        FORMAT: options.format || 'image/png',
        TRANSPARENT: options.transparent !== undefined ? options.transparent : true,
        SRS: options.projection,
        CRS: options.projection,
        TILED: String(urlParams.TILED ?? options.tiled ?? false).toLowerCase() === "true",
        VERSION: options.version,
        // FILTER: options.params?.FILTER || filterValue,
        FILTER: filterValue,
        // FILTER: urlFilter,
        // FILTER: `narco: "start" > '${options.startDate}' AND "start" < '${options.endDate}'`,
        DPI: options.serverType === 'qgis' ? (options.dpi || ConfigUtils.getConfigProp("wmsDpi") || 96) : undefined,
        ...options.params
    };
}

export default {
    create: (options, map) => {
        // const state = store.getState(); // ✅ Get the Redux state
        // const filterFlag = state.filters.mapFilter; // ✅ Access the map filter
        // console.log("filterrr", filterFlag)
        const queryParameters = {...wmsToOpenlayersOptions(options), __t: +new Date()};
        console.log(queryParameters)
        if (queryParameters.TILED && !options.bbox) {
            /* eslint-disable-next-line */
            console.warn("Tiled WMS requested without specifying bounding box, falling back to non-tiled.");
        }
        if (!queryParameters.TILED || !options.bbox) {
            console.warn("Tiled WMS request.", options, map);
            const layer = new ol.layer.Image({
                minResolution: options.minResolution,
                maxResolution: options.maxResolution,
                source: new ol.source.ImageWMS({
                    url: options.url.split("?")[0],
                    serverType: options.serverType,
                    params: queryParameters,
                    ratio: options.ratio || 1,
                    hidpi: ConfigUtils.getConfigProp("wmsHidpi") !== false ? true : false,
                    imageLoadFunction: (image, src) => wmsImageLoadFunction(image.getImage(), src),
                    ...(options.sourceConfig || {})
                }),
                ...(options.layerConfig || {})
            });
            layer.set("empty", !queryParameters.LAYERS);
            return layer;
        } else {
            const extent = CoordinatesUtils.reprojectBbox(options.bbox.bounds, options.bbox.crs, options.projection);
            const tileGrid = new ol.tilegrid.TileGrid({
                extent: extent,
                tileSize: options.tileSize || 256,
                maxZoom: map.getView().getResolutions().length,
                resolutions: map.getView().getResolutions()
            });
            const layer = new ol.layer.Tile({
                minResolution: options.minResolution,
                maxResolution: options.maxResolution,
                source: new ol.source.TileWMS({
                    urls: [options.url.split("?")[0]],
                    params: queryParameters,
                    serverType: options.serverType,
                    tileGrid: tileGrid,
                    hidpi: ConfigUtils.getConfigProp("wmsHidpi") !== false ? true : false,
                    tileLoadFunction: (imageTile, src) => wmsImageLoadFunction(imageTile.getImage(), src),
                    ...(options.sourceConfig || {})
                }),
                ...(options.layerConfig || {})
            });
            layer.set("empty", !queryParameters.LAYERS);
            return layer;
        }
    },
    update: (layer, newOptions, oldOptions) => {
        if (oldOptions && layer?.getSource()?.updateParams) {
            let changed = (oldOptions.rev || 0) !== (newOptions.rev || 0);
            const oldParams = wmsToOpenlayersOptions(oldOptions);
            const newParams = wmsToOpenlayersOptions(newOptions);
            Object.keys(oldParams).forEach(key => {
                if (!(key in newParams)) {
                    newParams[key] = undefined;
                }
            });
            if (!changed) {
                changed = Object.keys(newParams).find(key => {
                    return newParams[key] !== oldParams[key];
                }) !== undefined;
            }
            changed |= newOptions.visibility !== oldOptions.visibility;
            if (changed) {
                const queryParameters = {...newParams,  __t: +new Date()};
                if (layer.get("updateTimeout")) {
                    clearTimeout(layer.get("updateTimeout"));
                }
                if (!newOptions.visibility || !queryParameters.LAYERS) {
                    layer.setVisible(false);
                }
                layer.set("updateTimeout", setTimeout(() => {
                    layer.setVisible(queryParameters.LAYERS && newOptions.visibility);
                    layer.getSource().updateParams(queryParameters);
                    layer.getSource().changed();
                    layer.set("updateTimeout", null);
                }, 500));
            }
        }
    },
    create3d: (options, projection) => {
        const queryParameters = {...wmsToOpenlayersOptions(options), __t: +new Date()};
        return new ColorLayer({
            name: options.name,
            source: new TiledImageSource({
                source: new ol.source.TileWMS({
                    url: options.url.split("?")[0],
                    params: queryParameters,
                    version: options.version,
                    projection: projection,
                    tileLoadFunction: (imageTile, src) => wmsImageLoadFunction(imageTile.getImage(), src)
                })
            })
        });
    },
    update3d: (layer, newOptions, oldOptions, projection) => {
        if (oldOptions && layer?.source?.source?.updateParams) {
            let changed = (oldOptions.rev || 0) !== (newOptions.rev || 0);
            const oldParams = wmsToOpenlayersOptions(oldOptions);
            const newParams = wmsToOpenlayersOptions(newOptions);
            Object.keys(oldParams).forEach(key => {
                if (!(key in newParams)) {
                    newParams[key] = undefined;
                }
            });
            if (!changed) {
                changed = Object.keys(newParams).find(key => {
                    return newParams[key] !== oldParams[key];
                }) !== undefined;
            }
            changed |= newOptions.visibility !== oldOptions.visibility;
            if (changed) {
                const queryParameters = {...newParams,  __t: +new Date()};
                if (layer.__updateTimeout) {
                    clearTimeout(layer.__updateTimeout);
                }
                if (!newOptions.visibility || !queryParameters.LAYERS) {
                    layer.visible = false;
                }
                layer.__updateTimeout = setTimeout(() => {
                    layer.visible = queryParameters.LAYERS && newOptions.visibility;
                    layer.source.source.updateParams(queryParameters);
                    layer.source.update();
                    layer.__updateTimeout = null;
                }, 500);
            }
        }
    }
};
