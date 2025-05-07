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
import dayjs from 'dayjs';


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
            // console.log("wmsImageLoadFunction POST req: ", urlParts)
            const reader = new FileReader();
            reader.readAsDataURL(response.data);
            reader.onload = () => {
                image.src = reader.result;
            };
        }).catch(() => {
            // console.log("Fall back to GET")
            // Fall back to GET
            image.src = src;
        });
    } else {
        // Fall back to GET
        image.src = src;
    }
}

function wmsToOpenlayersOptions(options) {
    // console.log("options", options)
    // Get filter state from Redux store
    const state = StandardStore.get().getState();
    // console.log(state.filter)
    const urlParams = Object.entries(url.parse(options.url, true).query).reduce((res, [key, val]) => ({...res, [key.toUpperCase()]: val}), {});
    const urlFilter = UrlParams.getParams()['f'];
    // console.log("new technique for filter:", urlParams, urlFilter)
    
    const { layerName, flag, vessel_name, type, quantity, operator, ssr_country, ssr_boat_name, ssr_own_ship, ssr_no_of_crew, ssr_boat_regno, name, date, 
        vessel_id, vessel_ssvid, vessel_flag, dtg, ssr_dtg, ais_type_summary, timestamp, begin, end, start, end2, date_all_flag_heatmap, date_new} = state.filter;
    // const { layerName, flag, vessel_name, type, quantity, operator } = options.params.FILTER
    const conditions = [];
    if (flag && flag!=="all") conditions.push(`"flag" = '${flag}'`);
    if (vessel_name && vessel_name!=="") conditions.push(`"vessel_name" = '${vessel_name}'`);
    if (name && name!=="") conditions.push(`"name" = '${name}'`);
    if (layerName!=="density_map" && type) { console.log("1 layer is", layerName) ;conditions.push(`"type" = '${type}'`);}
    if (ais_type_summary) conditions.push(`"ais_type_summary" = '${ais_type_summary}'`);
    if (quantity) conditions.push(`"quantity" ${operator} ${quantity}`);
    if (ssr_country && ssr_country!=="all") conditions.push(`"ssr_country" = '${ssr_country}'`);
    if (ssr_boat_name && ssr_boat_name!=="") conditions.push(`"ssr_boat_name" = '${ssr_boat_name}'`);
    if (ssr_own_ship && ssr_own_ship!=="") conditions.push(`"ssr_own_ship" = '${ssr_own_ship}'`);
    if (ssr_boat_regno && ssr_boat_regno!=="") conditions.push(`"ssr_boat_regno" = '${ssr_boat_regno}'`);
    if (ssr_no_of_crew) conditions.push(`"ssr_no_of_crew" ${operator} '${ssr_no_of_crew}'`);
    if (vessel_id && vessel_id!=="") conditions.push(`"vessel_id" = '${vessel_id}'`);
    if (vessel_ssvid && vessel_ssvid!=="") conditions.push(`"vessel_ssvid" = '${vessel_ssvid}'`);
    if (vessel_flag && vessel_flag!=="all") conditions.push(`"vessel_flag" = '${vessel_flag}'`);
    if (date && date!==""){
        if(date.length===2)
        {
            // console.log("date", date.length)
            conditions.push(`"date" >= '${dayjs(date[0]).format("YYYY-MM-DD")}' AND "date" <= '${dayjs(date[1]).format("YYYY-MM-DD")}'`); 
        }
        else if(layerName === "Joined_Indian_Dhows_Routes"){
            // console.log("date", date)
            conditions.push(`"date" = '${dayjs(date).format("MM/D/YYYY")}'`);
        }
        else{
            // console.log("date", date)
            conditions.push(`"date" = '${dayjs(date).format("YYYY-MM-DD")}'`);
        }
    }
    if (dtg && dtg!==""){
        if(dtg.length<=1)
        conditions.push(`"dtg" = '${dayjs(dtg).format("YYYY-MM-DD")}'`); 
        else conditions.push(`"dtg" >= '${dayjs(dtg[0]).format("YYYY-MM-DD")}' AND "dtg" <= '${dayjs(dtg[1]).format("YYYY-MM-DD")}'`); 
    }     
    if (timestamp && timestamp!==""){
        if(timestamp.length<=1)
        conditions.push(`"timestamp" = '${dayjs(timestamp).format("YYYY-MM-DD")}'`); 
        else conditions.push(`"timestamp" >= '${dayjs(timestamp[0]).format("YYYY-MM-DD")}' AND "timestamp" <= '${dayjs(timestamp[1]).format("YYYY-MM-DD")}'`); 
    } 
    if (ssr_dtg && ssr_dtg!=="") {
        const startDate = dayjs(ssr_dtg[0].format("YYYY-MM-DD"));
        const endDate = dayjs(ssr_dtg[1].format("YYYY-MM-DD"));
        // conditions.push(`"ssr_dtg" BETWEEN '${dayjs(ssr_dtg[0]).format("YYYY-MM-DDTHH:mm:ss.SSSZ")}' AND '${dayjs(ssr_dtg[1]).format("YYYY-MM-DDTHH:mm:ss.SSSZ")}'`);
        conditions.push(`"ssr_dtg" >= '${startDate}' AND "ssr_dtg" <= '${endDate}'`);
    }
    // if (begin && begin!==""){
    //     conditions.push(`"begin" = '${dayjs(begin).format("MM/D/YYYY")}'`);
    // }    
    // if (end && end!==""){
    //     if(layerName === "Joined_Indian_Dhows_Routes"){
    //         console.log("end", date)
    //         conditions.push(`"end" = '${dayjs(end).format("MM/D/YYYY")}'`);
    //     }
    //     else{
    //         conditions.push(`"end" = '${dayjs(end).format("YYYY-MM-DD")}'`);
    //     }
    // }   
    if (date_new && date_new!==""){
        conditions.push(`"begin" >= '${dayjs(date_new[0]).format("MM/D/YYYY")}' AND "end" <= '${dayjs(date_new[1]).format("MM/D/YYYY")}'`); 
    }    
    if (date_all_flag_heatmap && date_all_flag_heatmap!==""){ 
        conditions.push(`"start" >= '${dayjs(date_all_flag_heatmap[0]).format("YYYY-MM-DD")}' AND "end" <= '${dayjs(date_all_flag_heatmap[1]).format("YYYY-MM-DD")}'`);
        //DATE("start") >= '2023-12-31' AND DATE("end") <= '2024-01-09' 
    } 
    // if (start || end2){
    //     if(start!=="" && end2 !== "")
    //     conditions.push(`"start" >= '${dayjs(timestamp[0]).format("YYYY-MM-DD")}' AND "end2" <= '${dayjs(timestamp[1]).format("YYYY-MM-DD")}'`); 
    // } 

    // console.log("filter condition",conditions)

    // const filterValue = conditions.length > 0 ? options?.id === "all_vessels_fishing_density_areas_in_pak.qgz" ? layerName?.map(name => `${name}: ${conditions.join(" OR ")}`).join(" , ") : `${layerName}: ${conditions.join(" OR ")}` : "";

    const filterValue = conditions.length > 0 ? options?.id === "all_vessels_fishing_density_areas_in_pak.qgz" ? `${layerName?.map(name => `${name}:${conditions.join(" AND ")}`).join(";")}` : `${layerName}:${conditions.join(" AND ")}`: "";
    // const filterValue = `${layerName}: ${conditions.join(" OR ")}`;
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
        const queryParameters = {...wmsToOpenlayersOptions(options), __t: +new Date()};
        if (queryParameters.TILED && !options.bbox) {
            /* eslint-disable-next-line */
            console.warn("Tiled WMS requested without specifying bounding box, falling back to non-tiled.");
        }
        if (!queryParameters.TILED || !options.bbox) {
            // console.warn("Tiled WMS request.", options, map);
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
