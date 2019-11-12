import mapboxgl from '../../../static/libs/mapboxgl/mapbox-gl-enhance';
import '../../../static/libs/iclient-mapboxgl/iclient-mapboxgl.min';

export default class RestService extends mapboxgl.Evented {
  /**
   * @function RestService.prototype.getData
   * @description 请求数据。
   */
  getData(url, queryInfo) {
    if (!url) {
      return;
    }
    SuperMap.FetchRequest.get(url, null, { withoutFormatSuffix: true })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (!data || !data.data) {
          // 请求失败
          this.fire('getdatafailed', {
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
          this.fire('getdatasucceeded', {
            data: res
          });
        }
      })
      .catch(error => {
        console.log(error);
        this.fire('getdatafailed', {
          error
        });
      });
  }
}
