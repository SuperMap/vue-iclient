import axios from 'axios';

const CancelToken = axios.CancelToken;
const axiosService = axios.create();

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
      return Promise.reject(error.response.data); // 返回接口返回的错误信息
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
  HOME_URL: 'http://www.tianditu.gov.cn',
  feedbackIp: 'http://www.tianditu.gov.cn/feedback',
  T_URL: 'https://map.tianditu.gov.cn',
  T_SSO_URL: 'https://sso.tianditu.gov.cn',
  T_UMS_URL: 'https://uums.tianditu.gov.cn',
  SEARCH_URL: 'https://api.tianditu.gov.cn/search',
  DRIVE_URL: 'https://api.tianditu.gov.cn/drive',
  BUS_URL: 'https://api.tianditu.gov.cn/transit',
  GEOCODE_URL: 'https://api.tianditu.gov.cn/geocoder',
  API_URL: 'http://lbs.tianditu.gov.cn/'
};

export const tiandituSearch = (url, params) => {
  return request({ url, params });
};

export const tiandituTransit = (url, params) => {
  return request({ url, params });
};

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
