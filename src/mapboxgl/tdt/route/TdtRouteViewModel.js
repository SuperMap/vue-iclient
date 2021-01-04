import mapboxgl from '../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import {
  config,
  request,
  tiandituSearch,
  getStatisticsResult,
  tdtSetHighlightIcon,
  resetSearchSourceData,
  toBBoxString,
  clearSearchResultLayer,
  addPoints,
  generatePointsFeatures
} from '../_utils/service';
import convert from 'xml-js';
import bbox from '@turf/bbox';
import transformScale from '@turf/transform-scale';
import startPng from './assets/start.png';
import destPng from './assets/dest.png';
import busPng from './assets/bus.png';
import metroPng from './assets/metro.png';
import { geti18n } from '../../../common/_lang';

export default class TdtRouteViewModel extends mapboxgl.Evented {
  constructor(options) {
    super();
    this.type = options.type;
    this.appConfig = config;
    this.token = options.data.tk;
    this.data = Object.assign({}, options.data);
    this.style = 0;
    this.sourceName = { tdtRoutePoints: 'tdt-route-searchRoutePoints', tdtDrawRoutes: 'tdt-route-routes' };
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
  }
  // 分页的params里面应该有mapBound
  searchPoints(keyWord, params, searchUrl = this.data.searchUrl || 'https://api.tianditu.gov.cn/search') {
    const map = this.map;
    const commonData = {
      keyWord,
      queryType: '7',
      start: '0',
      count: '7',
      level: Math.round(map.getZoom()),
      mapBound: this._toBBoxString()
    };
    return tiandituSearch(searchUrl, {
      postStr: JSON.stringify(Object.assign({}, commonData, params)),
      type: 'query',
      tk: this.token
    })
      .then(data => {
        const result = this._showResultToMap(data);
        return result;
      })
      .catch(error => {
        const err = error.isCancel ? null : error;
        return Promise.reject(err);
      });
  }

  search(orig, dest, carUrl = this.data.carUrl || 'https://api.tianditu.gov.cn/drive', busUrl = this.data.busUrl || 'https://api.tianditu.gov.cn/transit') {
    this._clearMarkers();
    if (!this.map) return Promise.reject(new Error(geti18n().t('tdtRoute.mapLoadedFiled')));
    this.orig = orig;
    this.dest = dest;
    let type = this.type === 'car' ? 'search' : 'busline';
    let url = this.type === 'car' ? carUrl : busUrl;
    let params = {
      postStr: {
        orig: this.orig && this.orig.join(','),
        dest: this.dest && this.dest.join(','),
        style: this.style,
        mid: '',
        startposition: this.orig && this.orig.join(','),
        endposition: this.dest && this.dest.join(','),
        linetype: 1
      },
      type,
      tk: this.token
    };
    if (this.type !== 'car') {
      params.postStr.linetype = this.style === 1 ? 8 : this.style + 1;
    }
    this.addStartMarker();
    this.addDestMarker();
    return request({ url, params })
      .then(res => {
        if (this.type === 'car') {
          let result = this._handleXmlData(res);
          let source = this.map.getSource(this.sourceName.tdtDrawRoutes);
          source ? source.setData(result.features) : this._addRouteLayer(result.features);
          source && this.setHighlightRoute('');
          const bounds = bbox(transformScale(result.features, 1.7));
          this.map.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]], { maxZoom: 17 });
          // this.map.flyTo({
          //   center: [parseFloat(result.center[0]), parseFloat(result.center[1])],
          //   zoom: parseFloat(result.scale)
          // });
          this.setHighlightRoute();
          this._addMarker();
          this.result = result;
        } else {
          let result = this._handleBusLineData(res);
          this.result = result;
          let source = this.map.getSource(this.sourceName.tdtDrawRoutes);
          this.busFeatures = this.result && this.result[0].features;
          source ? source.setData(this.busFeatures) : this._addRouteLayer(this.busFeatures);
          this._addMarker(this.busFeatures.features);
          source && this.setHighlightRoute('');
          const bounds = bbox(transformScale(this.busFeatures, 1.7));
          this.map.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]], { maxZoom: 17 });
          // this.map.flyTo({
          //   center: this.busFeatures.features[0].geometry.coordinates[0],
          //   zoom: 9
          // });
        }
        return this.result;
      })
      .catch(error => {
        console.log(error);
        this.remainPosMarker = true;
      });
  }

  _showResultToMap(data) {
    let type;
    let result;
    let prompt = data.prompt && data.prompt.find(item => +item.type === 4);
    if (data.pois && data.pois.length) {
      type = 'Point';
      result = data.pois;
      let features = this._generatePointsFeatures(result);
      this._addPoints(features);
    } else if (data.statistics) {
      type = 'Statistics';
      result = getStatisticsResult(data.statistics);
    } else {
      result = data.prompt;
    }
    return { type, result: { count: +data.count, data: result, prompt: ((prompt || {}).admins || [])[0] } };
  }

  _toBBoxString() {
    return toBBoxString(this.map);
  }

  _generatePointsFeatures(data, splitFlag = ' ') {
    return generatePointsFeatures(data, splitFlag);
  }

  setSearchStyle(style) {
    this.style = style;
  }

  setSearchType(type) {
    this.type = type;
    this.style = 0;
    // this.search(this.orig, this.dest);
  }
  setData(data) {
    this.token = data.tk;
    this.data = Object.assign(this.data, data);
    this.style = 0;
  }

  setLayerFeatures(id, show) {
    let source = this.map.getSource(this.sourceName.tdtDrawRoutes);
    this.busFeatures = this.result[id].features;
    if (show) {
      if (source) {
        this.setHighlightRoute();
        source.setData(this.busFeatures);
        const bounds = bbox(transformScale(this.busFeatures, 1.7));
        this.map.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]], { maxZoom: 17 });
      } else {
        this._addRouteLayer(this.busFeatures);
      }
      this._clearMarkers();
      this.addStartMarker();
      this.addDestMarker();
      this._addMarker(this.result[id].features.features);
    } else {
      this.removed();
    }
  }
  removed() {
    let source = this.map.getSource(this.sourceName.tdtDrawRoutes);
    source &&
      source.setData({
        type: 'FeatureCollection',
        features: []
      });
    this._clearMarkers();
    this._clearSearchResultLayer();
  }
  _clearMarkers() {
    if (!this.remainPosMarker) {
      this.startMarker && this.startMarker.remove();
      this.destMarker && this.destMarker.remove();
    }
    this.busMarkers &&
      this.busMarkers.forEach(marker => {
        marker.remove();
      });
    this.busMarkers = [];
    this.remainPosMarker = false;
    this._resetSearchSourceData();
  }

  addStartMarker(coordinates) {
    coordinates && this.startMarker && this.startMarker.remove();
    this.startMarker = this._createCustomMarker(startPng, coordinates || this.orig, {
      top: '-15px',
      left: '3px',
      width: '29px',
      height: '30px'
    });
  }

  addDestMarker(coordinates) {
    coordinates && this.destMarker && this.destMarker.remove();
    this.destMarker = this._createCustomMarker(destPng, coordinates || this.dest, {
      top: '-15px',
      left: '3px',
      width: '29px',
      height: '30px'
    });
  }

  _addMarker(features) {
    this.busMarkers = [];
    features &&
      features.forEach(feature => {
        if (feature.properties.lineName) {
          let coordinate = feature.geometry.coordinates[0];
          let img = feature.properties.type === 'bus' ? busPng : metroPng;
          let marker = this._createCustomMarker(img, coordinate, {
            top: '-8px',
            left: '0px',
            width: '24px',
            height: '24px'
          });
          marker.setPopup(
            new mapboxgl.Popup({
              closeOnClick: true,
              className: 'route-plan-popup'
            })
              .setLngLat(coordinate)
              .setHTML(
                `<div class="tdt_popup_content">
                <div class="info_container" popupshow="true">
                <div class="title"><span title="${feature.properties.stationStart.name}">${
  feature.properties.stationStart.name
}</span></div>
                <div class="props">
                <p ><span>${feature.properties.direction}</span></p>
                <p><span >${geti18n().t('tdtRoute.total')}${feature.properties.segmentStationCount}${geti18n().t('tdtRoute.station')}</span></p>
                <p ><span >${geti18n().t('tdtRoute.busEndTime')}：</span>
                <span>${feature.properties.SEndTime}</span></p>
                </div></div></div>`
              )
          );
          this.busMarkers.push(marker);
        }
      });
  }
  _createCustomMarker(imgUrl, coordinate, style) {
    let el = document.createElement('div');
    el.style.background = `url(${imgUrl})`;
    el.style.top = style.top;
    el.style.left = style.left;
    el.style.width = style.width;
    el.style.height = style.height;
    return new mapboxgl.Marker(el).setLngLat(coordinate).addTo(this.map);
  }

  _addRouteLayer(features) {
    this.map.addSource(this.sourceName.tdtDrawRoutes, {
      type: 'geojson',
      data: features
    });
    this.map.addLayer({
      id: 'routes-plan',
      type: 'line',
      source: this.sourceName.tdtDrawRoutes,
      paint: {
        'line-width': 8,
        'line-color': 'rgb(51, 133, 255)',
        'line-opacity': 0.8
      },
      layout: {
        'line-cap': 'round'
      },
      filter: [
        'any',
        ['all', ['!has', 'hightLightFeture'], ['>', 'id', 0]],
        ['all', ['==', 'hightLightFeture', false], ['==', 'id', 0]]
      ]
    });
    this.map.addLayer({
      id: 'routes-plan-highlighted',
      type: 'line',
      source: this.sourceName.tdtDrawRoutes,
      paint: {
        'line-width': 8,
        'line-color': 'rgb(254, 86, 24)',
        'line-opacity': 0.8
      },
      layout: {
        'line-cap': 'round'
      },
      filter: ['==', 'id', '']
    });
    // 起始点虚线
    this.map.addLayer({
      id: 'routes-plan-line-dot',
      type: 'line',
      source: this.sourceName.tdtDrawRoutes,
      paint: {
        'line-width': 3,
        'line-color': 'rgb(8, 140, 40)',
        'line-opacity': 0.8,
        'line-dasharray': [0.6, 1.5]
      },
      layout: {
        'line-cap': 'round'
      },
      filter: ['all', ['==', 'id', 0], ['has', 'isDashed']]
    });
  }

  setHighlightRoute(id, parentIndex) {
    if (id || id === 0) {
      const bounds = bbox(
        transformScale(
          this.result.features ? this.result.features.features[id] : this.result[parentIndex].features.features[id],
          1.7
        )
      );
      this.map.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]], { maxZoom: 17 });
      this.map.setFilter('routes-plan-highlighted', ['==', 'id', id]);
    } else {
      this.map.setFilter('routes-plan-highlighted', ['==', 'id', '']);
    }
  }

  _handleXmlData(xml) {
    let data = JSON.parse(convert.xml2json(xml, { compact: true, spaces: 4 }));
    let result = data.result;
    let routes = result.simple.item;
    let routesInfo = [];
    let features = [];

    for (let a = result.routes.item, n = 0; n < a.length; n++) {
      routesInfo.push(a[n].strguide._text);
    }
    routes.forEach((route, idx) => {
      let coordinates = this._handleCoordinate(route.streetLatLon._text);
      route._attributes.strguide = {
        strguide: route.strguide._text
      };
      let segmentNumber = route.segmentNumber._text;
      if (segmentNumber.indexOf('-') > -1) {
        segmentNumber = segmentNumber.split('-');
        route._attributes.strguide.routeInfo = routesInfo.slice(segmentNumber[0], parseFloat(segmentNumber[1]) + 1);
      } else {
        route._attributes.strguide.routeInfo = [routesInfo[parseFloat(segmentNumber)]];
      }
      route._attributes.segmentNumber = route.segmentNumber._text;
      route._attributes.id = idx + 1;
      route._attributes.hightLightFeture = true;
      let feature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates
        },
        properties: route._attributes
      };
      features.push(feature);
    });
    features.unshift({
      type: 'Feature',
      properties: {
        id: 0,
        hightLightFeture: false
      },
      geometry: {
        type: 'LineString',
        coordinates: this._handleCoordinate(result.routelatlon._text)
      }
    });
    let results = {
      distance: result.distance._text,
      center: result.mapinfo.center._text.split(','),
      scale: result.mapinfo.scale._text,
      routesInfo,
      start: this.orig,
      dest: this.dest,
      features: {
        type: 'FeatureCollection',
        features
      }
    };
    return results;
  }

  _handleBusLineData(data) {
    let results = [];
    let lines = data.results && data.results[0].lines || [];
    lines.forEach(line => {
      let lineName = line.lineName;
      let segments = line.segments;
      let feature = [];
      let distance = 0;
      let time = 0;
      let count = 0;
      let lineNames = [];
      line.lineName.split('|').forEach(name => {
        if (name.trim()) {
          let type =
            name.indexOf('地铁') > -1 ? 'metro' : name.indexOf('路') > -1 || name.indexOf('巴士') > -1 ? 'bus' : 'walk';
          lineNames.push({
            name: name.trim(),
            type
          });
        }
      });
      segments.forEach((segment, index) => {
        segment.segmentType !== 1 && count++;
        let segmentLine = segment.segmentLine[0];
        let {
          linePoint,
          SEndTime,
          direction,
          lineName,
          segmentStationCount,
          segmentDistance,
          segmentTime
        } = segmentLine;
        distance += segmentDistance || 0;
        time += segmentTime || 0;
        let type = !lineName ? 'walk' : lineName.indexOf('地铁') > -1 ? 'metro' : 'bus';
        let properties = { SEndTime, direction, lineName, segmentStationCount, id: index, type };
        !index && (properties.isDashed = true);
        let coordinates = this._handleCoordinate(linePoint);
        segment.stationStart.lonlat = this._handleCoordinate(segment.stationStart.lonlat);
        segment.stationEnd.lonlat = this._handleCoordinate(segment.stationEnd.lonlat);
        properties.stationStart = segment.stationStart;
        properties.stationEnd = segment.stationEnd;
        feature.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates
          },
          properties
        });
      });
      distance = (distance * 0.001).toFixed(2);
      let hour = parseInt(time / 60);
      let minutes = time % 60;
      time = geti18n().t('tdtRoute.about');
      hour && (time += `${hour}${geti18n().t('tdtRoute.hour')}`);
      minutes && (time += `${minutes}${geti18n().t('tdtRoute.minutes')}`);
      results.push({
        features: {
          type: 'FeatureCollection',
          features: feature
        },
        lineName,
        lineNames,
        distance,
        time,
        switchTimes: count === 0 ? 0 : count - 1
      });
    });
    return results;
  }

  _handleCoordinate(coordinatesString) {
    let coordinates;
    if (coordinatesString.indexOf(';') > -1) {
      let latlng = coordinatesString.split(';');
      coordinates = latlng.slice(0, latlng.length - 1);
      coordinates.forEach((item, index) => {
        coordinates[index] = [parseFloat(item.split(',')[0]), parseFloat(item.split(',')[1])];
      });
    } else {
      coordinatesString = coordinatesString.split(',');
      coordinates = [parseFloat(coordinatesString[0]), parseFloat(coordinatesString[1])];
    }
    return coordinates;
  }

  setHighlightIcon(hotPointID) {
    tdtSetHighlightIcon(this.map, this.sourceName.tdtRoutePoints, hotPointID);
  }

  _resetSearchSourceData() {
    resetSearchSourceData(this.map, this.sourceName.tdtRoutePoints);
  }

  _clearSearchResultLayer() {
    clearSearchResultLayer(this.map, this.sourceName.tdtRoutePoints);
  }

  _addPoints(features) {
    addPoints(this.map, this.sourceName.tdtRoutePoints, features);
  }
}
