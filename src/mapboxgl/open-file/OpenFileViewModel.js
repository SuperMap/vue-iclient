import mapboxgl from '../../../static/libs/mapboxgl/mapbox-gl-enhance';
import FileModel from './FileModel';
import { getFileType } from './FileTypes';
import FileReaderUtil from './FileReaderUtil';
import { geti18n } from '../../common/_lang';
import bbox from '@turf/bbox';
import UniqueId from 'lodash.uniqueid';

/**
 * @class OpenFileViewModel
 * @param {mapboxgl.map} map - mapboxgl map 对象。
 * @description OpenFile viewModel.
 * @extends mapboxgl.Evented
 */
class OpenFileViewModel extends mapboxgl.Evented {
  constructor() {
    super();
    this.prevLayerId = '';
    this.geojson = null;
    this.fileModel = new FileModel();
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
  }

  setClearLastLayer(clearLastLayer) {
    this.clearLastLayer = clearLastLayer;
  }

  setFitBounds(fitBounds) {
    this.fitBounds = fitBounds;
  }

  setAddToMap(addToMap) {
    this.addToMap = addToMap;
  }

  readFile(fileEventObject) {
    let inputDom = fileEventObject.target;
    let file = inputDom.files[0];
    let filePath = inputDom.value;
    let fileName = file && file.name;
    let fileType = getFileType(fileName);

    if (!filePath) {
      return;
    }

    // 文件格式不支持
    if (!fileType) {
      /**
       * @event errorfileformat
       * @description 文件格式不支持时触发。
       * @property {string} messageType - 警告类型。
       * @property {string} message - 警告内容。
       */
      this.fire('errorfileformat', { messageType: 'failure', message: geti18n().t(`openFile.fileTypeUnsupported`) });
      return false;
    }
    // 文件类型限制
    if (fileName !== '') {
      // 给control 一份数据
      // todo MVVM模式 应该是数据变化触发数据变化的事件
      this.fileModel.set('loadFileObject', {
        file: file,
        filePath: filePath,
        fileName: fileName,
        fileType: fileType
      });
      // 响应选中文件添加到地图
      this._readData();
    }
  }

  getUniqueId() {
    return UniqueId(`layer-smopenfile-`);
  }

  fitBoundsToData() {
    this.map.fitBounds(bbox(this.geojson), { maxZoom: 12 });
  }

  _readData() {
    // todo 需要测试另外两个
    const me = this;
    const type = this.fileModel.loadFileObject.fileType;
    FileReaderUtil.readFile(
      type,
      {
        file: this.fileModel.loadFileObject.file,
        path: this.fileModel.loadFileObject.filePath
      },
      data => {
        // 将数据统一转换为 geoJson 格式加载到底图
        FileReaderUtil.processDataToGeoJson(
          type,
          data,
          geojson => {
            if (geojson) {
              /**
               * @event openfilesucceeded
               * @description 打开文件成功。
               * @property {GeoJSONObject} result - GeoJSON 格式数据。
               * @property {string} layerName - 图层名。
               */
              this.geojson = geojson;
              let layerId = this.getUniqueId();

              if (this.clearLastLayer) {
                if (this.prevLayerId && this.map.getLayer(this.prevLayerId)) {
                  this.map.removeLayer(this.prevLayerId);
                }
              }

              this.prevLayerId = layerId;
              // bounds
              this.fire('openfilesucceeded', {
                result: geojson,
                layerId,
                layerName: this.fileModel.loadFileObject.fileName.split('.')[0]
              });
            }
          },
          e => {
            /**
             * @event openfilefailed
             * @description 打开文件失败。
             * @property {String} messageType - 信息类型。
             * @property {Object} message - e。
             */
            me.fire('openfilefailed', { messageType: 'failure', message: e });
          },
          this
        );
      },
      e => {
        /**
         * @event openfilefailed
         * @description 打开文件失败。
         * @property {String} messageType - 信息类型。
         * @property {String} message - 失败信息。
         */
        me.fire('openfilefailed', {
          messageType: 'failure',
          message: `${geti18n().t(`openFile.openFileFail`)} ${e.message}`
        });
      },
      this
    );
  }
}
export default OpenFileViewModel;
