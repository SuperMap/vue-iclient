import axios from 'axios';
import bbox from '@turf/bbox';
import transformScale from '@turf/transform-scale';
import envelope from '@turf/envelope';
import { featureCollection } from '@turf/helpers';
import spriteJson from '../_assets/sprite.json';
import spritePng from '../_assets/sprite.png';

function encode(val) {
  return encodeURIComponent(val)
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']');
}

function each(obj, fn) {
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  if (typeof obj !== 'object') {
    obj = [obj];
  }

  if (Array.isArray(obj)) {
    for (var i = 0, l = obj.length; i < l; i++) {
      // eslint-disable-next-line
      fn.call(null, obj[i], i, obj);
    }
  } else {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // eslint-disable-next-line
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

const CancelToken = axios.CancelToken;
const axiosService = axios.create({
  paramsSerializer(params) {
    var parts = [];

    Object.keys(params).forEach((key) => {
      let val = params[key];
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (Array.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      each(val, function(v) {
        if (Object.prototype.toString.call(v) === '[object Date]') {
          v = v.toISOString();
        } else if (v !== null && typeof v === 'object') {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });
    return parts.join('&');
  }
});

let cancelSourceList = {};

axiosService.interceptors.request.use(
  // 请求拦截
  config => {
    cancelRequest(config.url);
    config.cancelToken = new CancelToken(function executor(c) {
      // An executor function receives a cancel function as a parameter
      cancelSourceList[config.url] = c;
    });
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
axiosService.interceptors.response.use(
  response => {
    cancelRequest(response.config.url);
    return response;
  },
  error => {
    const isCancel = axios.isCancel(error);
    if (isCancel) {
      const cancelError = { isCancel };
      return Promise.reject(cancelError);
    } else {
      return Promise.reject(error.response && error.response.data); // 返回接口返回的错误信息
    }
  }
);

export function request({ url, params = {}, method = 'get' }) {
  const options = {
    url,
    method
  };
  if (method.toLowerCase() === 'get') {
    options.params = params;
  } else {
    options.data = params;
  }

  return axiosService(options)
    .then(res => {
      return res.data;
    })
    .catch(error => {
      return Promise.reject(error);
    });
}

function cancelRequest(sourceName) {
  const source = cancelSourceList[sourceName];
  if (typeof source === 'function') {
    source('取消重复请求');
    delete cancelSourceList[sourceName];
  }
}

export const config = {
  HOME_URL: 'https://www.tianditu.gov.cn',
  feedbackIp: 'https://www.tianditu.gov.cn/feedback',
  T_URL: 'https://map.tianditu.gov.cn',
  T_SSO_URL: 'https://sso.tianditu.gov.cn',
  T_UMS_URL: 'https://uums.tianditu.gov.cn',
  SEARCH_URL: 'https://api.tianditu.gov.cn/search',
  DRIVE_URL: 'https://api.tianditu.gov.cn/drive',
  BUS_URL: 'https://api.tianditu.gov.cn/transit',
  GEOCODE_URL: 'https://api.tianditu.gov.cn/geocoder',
  API_URL: 'https://lbs.tianditu.gov.cn/'
};

export const tiandituSearch = (url, params) => {
  return request({ url, params });
};

export const tiandituTransit = (url, params) => {
  return request({ url, params });
};

export const sourceNames = {
  // tdtSearch-xxxx
  searchResultPoints: 'tdt-search-searchResultPoints',
  searchResultLine: 'tdt-search-searchResultLine',
  searchResultPolygon: 'tdt-search-searchResultPolygon',
  searchResultPointsOfLine: 'tdt-search-searchResultPointsOfLine'
};
// search和route共用的方法
export const getStatisticsResult = data => {
  let result = {
    priorityCitys: data.priorityCitys,
    allAdmins: data.allAdmins.map((parent, index) => {
      let parentKey = `0-${index}`;
      let item = {
        key: parentKey,
        title: parent.name,
        info: parent,
        children: [],
        scopedSlots: { title: 'title', info: 'info' }
      };
      parent.childAdmins &&
        parent.childAdmins.forEach((child, key) => {
          let childKey = `${parentKey}-${key}`;
          let subItem = {
            key: childKey,
            title: child.name,
            info: child,
            children: [],
            scopedSlots: { title: 'title', info: 'info' }
          };
          child.childAdmins &&
            child.childAdmins.forEach((grandSon, subKey) => {
              let grandKey = `${childKey}-${subKey}`;
              let grandItem = {
                key: grandKey,
                title: grandSon.name,
                info: grandSon,
                scopedSlots: { title: 'title', info: 'info' }
              };
              subItem.children.push(grandItem);
            });
          item.children.push(subItem);
        });
      return item;
    })
  };
  return result;
};
// 点设置高亮
export const tdtSetHighlightIcon = (map, sourceName, hotPointID) => {
  if (map.getLayer(`${sourceName}-highlight`)) {
    if (hotPointID) {
      map.setFilter(`${sourceName}-highlight`, ['==', 'hotPointID', hotPointID]);
      return;
    }
    map.setFilter(`${sourceName}-highlight`, ['==', 'hotPointID', '']);
  }
};
// bounds转换成string
export const toBBoxString = map => {
  const bounds = map.getBounds();
  return (
    bounds.getWest().toFixed(5) +
    ',' +
    bounds.getSouth().toFixed(5) +
    ',' +
    bounds.getEast().toFixed(5) +
    ',' +
    bounds.getNorth().toFixed(5)
  );
};
// 添加点图层
export const addPoints = (map, sourceName, features) => {
  if (features && map) {
    const source = map.getSource(sourceName);
    const sourceData = features;
    if (source) {
      source.setData(sourceData);
    } else {
      map.addSource(sourceName, {
        type: 'geojson',
        data: sourceData
      });
      const image = new Image();
      image.src = spritePng;
      image.onload = () => {
        map.style.addSpriteObject(sourceName, image, spriteJson);
        map.addLayer({
          id: sourceName,
          type: 'symbol',
          source: sourceName,
          layout: {
            'icon-image': 'buoy-icon-{serialNum}',
            'icon-allow-overlap': true
          }
        });
        map.addLayer({
          id: `${sourceName}-highlight`,
          type: 'symbol',
          source: sourceName,
          layout: {
            'icon-image': 'buoy-icon-active-{serialNum}',
            'icon-allow-overlap': true
          },
          filter: ['==', 'hotPointID', '']
        });
      };
    }
    const bounds = bbox(transformScale(envelope(features), 1.7));
    map.fitBounds([[Math.max(bounds[0], -180), bounds[1]], [Math.min(bounds[2], 180), bounds[3]]], { maxZoom: 17 });
  }
};
// 清空search， route图层
export const resetSearchSourceData = (map, searchRoutePoints) => {
  if (!map) return;
  // 清除route
  if (searchRoutePoints && map.getSource(searchRoutePoints)) {
    map.getSource(searchRoutePoints).setData({
      type: 'FeatureCollection',
      features: []
    });
    return;
  }
  // 清除search
  for (let sourceName in sourceNames) {
    if (map.getSource(sourceName)) {
      map.getSource(sourceName).setData({
        type: 'FeatureCollection',
        features: []
      });
    }
  }
};

// 移除search, route图层
export const clearSearchResultLayer = (map, searchRoutePoints) => {
  if (!map) return;

  for (let sourceName in sourceNames) {
    if (searchRoutePoints && map.getSource(searchRoutePoints)) {
      map.getLayer(searchRoutePoints) && map.removeLayer(searchRoutePoints);
      map.getLayer(`${searchRoutePoints}-highlight`) && map.removeLayer(`${searchRoutePoints}-highlight`);
      map.removeSource(searchRoutePoints);
      break;
    }
    if (map.getSource(sourceNames[sourceName])) {
      map.getLayer(sourceNames[sourceName]) && map.removeLayer(sourceNames[sourceName]);
      switch (sourceNames[sourceName]) {
        case 'tdt-search-searchResultPoints':
          map.removeLayer(`${sourceNames[sourceName]}-highlight`);
          break;
        case 'tdt-search-searchResultPointsOfLine':
          map.removeLayer(`${sourceNames[sourceName]}-fill`);
          map.removeLayer(`${sourceNames[sourceName]}-stroke`);
          break;
        case 'tdt-search-searchResultPolygon':
          map.removeLayer(`${sourceNames[sourceName]}-stroke`);
          break;
        default:
          break;
      }
      map.removeSource(sourceNames[sourceName]);
    }
  }
};

// 构造点数据
export const generatePointsFeatures = (data, splitFlag = ' ') => {
  const result = [];
  for (let index = data.length - 1; index >= 0; index--) {
    const item = data[index];
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Point'
      },
      properties: {}
    };
    const center = (item.lonlat || '').split(splitFlag);
    feature.geometry.coordinates = [+center[0], +center[1]];
    feature.properties = Object.assign(item, { serialNum: index + 1 });
    result.push(feature);
  }
  const featureList = featureCollection(result);
  return featureList;
};
