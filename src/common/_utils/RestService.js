import { Events } from '../_types/event/Events';

export default class RestService extends Events {
  constructor(options) {
    super();
    this.eventTypes = ['getdatafailed', 'getdatasucceeded'];
    this.options = options || {};
  }

  /**
   * @function RestService.prototype.getData
   * @description 请求数据。
   */
  getData(url, queryInfo) {
    if (!url) {
      return;
    }
    SuperMap.FetchRequest.get(url, null, { withoutFormatSuffix: true, proxy: this.options.proxy })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (!data || !data.data) {
          // 请求失败
          this.triggerEvent('getdatafailed', {
            data
          });
        } else if (data.data) {
          let res = {};
          if (queryInfo && queryInfo.maxFeatures) {
            let length = queryInfo.maxFeatures;
            if (Object.keys(data.data).length > length) {
              Object.entries(data.data)
                .slice(0, length)
                .forEach(item => {
                  res[item[0]] = item[1];
                });
            } else {
              res = data.data;
            }
          } else {
            res = data.data;
          }
          this.triggerEvent('getdatasucceeded', {
            data: res
          });
        }
      })
      .catch(error => {
        console.log(error);
        this.triggerEvent('getdatafailed', {
          error
        });
      });
  }
}
