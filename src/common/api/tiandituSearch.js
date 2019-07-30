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

function request({ url, params = {}, method = 'get' }) {
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

export const tiandituSearch = (url, params) => {
  return request({ url, params });
};

export const tiandituTransit = (url, params) => {
  return request({ url, params });
};
