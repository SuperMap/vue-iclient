import mapboxgl from '../../../static/libs/mapboxgl/mapbox-gl-enhance';
import '../../../static/libs/iclient-mapboxgl/iclient9-mapboxgl.min';

export default class RestService extends mapboxgl.Evented {
  /**
   * @function RestService.prototype.getData
   * @description 请求数据。
   */
  getData(url) {
    if (!url) {
      return;
    }
    SuperMap.FetchRequest.get(url, null, { withoutFormatSuffix: true })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data.success === false || data.code !== 200 || !data) {
          // 请求失败
          this.fire('getdatafailed', {
            data
          });
        } else if (data && data.success === true && data.code === 200) {
          this.fire('getdatasucceeded', {
            data: data.data
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
