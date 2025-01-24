import mapboxgl from 'vue-iclient-core/libs/mapboxgl/mapbox-gl-enhance';
import 'vue-iclient-core/libs/iclient-mapboxgl/iclient-mapboxgl.min';
import { Events } from 'vue-iclient-core/types/event/Events';
import bbox from '@turf/bbox';
import transformScale from '@turf/transform-scale';
import clonedeep from 'lodash.clonedeep';

interface DrillMapParams {
  layerId: string;
  foreignField?: string;
  primaryField: string;
  serverUrl: string;
  mapId: string;
  accessToken?: string;
  accessKey?: string;
  tiandituKey?: string;
  googleMapsAPIKey?: string;
  googleMapsLanguage?: string;
  withCredentials?: boolean;
  excludePortalProxyUrl?: boolean;
  isSuperMapOnline?: boolean;
  proxy?: boolean | string;
  iportalServiceProxyUrlPrefix?: string;
  [propName: string]: any;
}
export default class WebMapViewModel extends Events {
  webMapService: InstanceType<any>;
  map: mapboxglTypes.Map;
  data: DrillMapParams[];
  drillAnimation: mapboxglTypes.FitBoundsOptions;
  firstMapInfo: any;
  layersOnMap: string[] = [];
  layerFilterList: any[] = [];
  fieldValue: string;
  boundsList: any[] = [];
  allLayers: string[] = [];
  layersInfo: any[] = [];
  layerId: string;
  currentIndex = 0;
  changeCursorGrab = () => this.changeCursor('grab');
  changeCursorPointer = () => this.changeCursor('pointer');
  drillNextMapFn = e => this.drillNextMap(e);
  clickTolerance = 5;
  private checkSameLayer = true;

  constructor(data, drillAnimation: mapboxglTypes.FitBoundsOptions) {
    super();
    this.data = clonedeep(data);
    this.drillAnimation = drillAnimation;
    this.eventTypes = ['drillmap'];
  }

  setMap(map: mapboxglTypes.Map) {
    this.map = map;
  }

  setData(data): void {
    this.data = clonedeep(data);
  }

  setAllLayers(layerIds: string[]) {
    this.allLayers = layerIds;
  }

  setLayersInfo(layersInfo: any[]) {
    this.layersInfo = layersInfo;
  }

  getIsAdministrative(
    layerInfo: { dataSource?: { administrativeInfo?: { divisionType; divisionField } } },
    layerInfo1: { dataSource?: { administrativeInfo?: { divisionType; divisionField } } },
    primaryField: string,
    foreignField: string
  ) {
    const administrativeInfo = layerInfo.dataSource && layerInfo.dataSource.administrativeInfo;
    const { divisionType, divisionField } = administrativeInfo || {};
    const administrativeInfo1 = layerInfo1.dataSource && layerInfo1.dataSource.administrativeInfo;
    const { divisionType: divisionType1 } = administrativeInfo1 || {};
    if (!administrativeInfo || !administrativeInfo1 || primaryField !== divisionField || foreignField !== 'Province') {
      return false;
    }
    return ['省份', 'Province'].includes(divisionType) && ['城市', 'City'].includes(divisionType1);
  }

  changeCurrentIndex(newVal, oldVal) {
    this.currentIndex = newVal;
    const { foreignField } = this.data[newVal];
    const layerId = this.allLayers[newVal];
    if (newVal > oldVal) {
      const primaryField = this.data[oldVal].primaryField;
      const oldLayerId = this.allLayers[oldVal];

      const isAdministrative = this.getIsAdministrative(
        this.layersInfo.find(item => item.layerID === oldLayerId),
        this.layersInfo.find(item => item.layerID === layerId),
        primaryField,
        foreignField
      );
      if (isAdministrative) {
        let filter = ['slice', ['get', foreignField], 0, 2];
        let fieldValue = this.fieldValue.slice(0, 2);
        // 张家口市和张家界市  阿拉善盟 阿拉尔市
        if (this.fieldValue === '张家' || this.fieldValue === '阿拉') {
          filter = ['slice', ['get', foreignField], 0, 3];
          fieldValue = this.fieldValue.slice(0, 3);
        }
        console.log(filter, fieldValue);

        this.setFilter(newVal, ['all', ['==', filter, fieldValue]], layerId);
      } else {
        this.setFilter(newVal, ['all', ['==', foreignField, this.fieldValue]], layerId);
      }
    }
    if (newVal < oldVal) {
      if (this.boundsList.length > 1) {
        this.boundsList.pop();
      }
    }
    this.fitToBounds(this.boundsList[newVal]);
    this.setVisibility(newVal);
  }

  init(setLayerFilter = true): void {
    const center = this.map.getCenter();
    const zoom = this.map.getZoom();
    this.boundsList = [{ center, zoom }];
    this.layersOnMap = this.allLayers.filter(layerId => this.map.getLayer(layerId));
    if (setLayerFilter) {
      this.layerFilterList = this.getLayerFilterList();
    }
    const clickedLayers =
      this.layersOnMap.length > 1 ? this.layersOnMap.slice(0, this.layersOnMap.length - 1) : this.layersOnMap;
    this.setVisibility();
    this.changeClickedLayersCursor(clickedLayers);
    this.map.off('click', this.drillNextMapFn);
    this.map.on('click', this.drillNextMapFn);
  }

  getLayerFilterList(layers = this.layersOnMap): any[] {
    let layerFilterList = [];
    layers.forEach(layerId => {
      let strokeLineFilter = [];
      const strokeLineLayer = layerId + '-strokeLine';
      const layerFilter = this.map.getFilter(layerId);

      if (this.map.getLayer(strokeLineLayer)) {
        strokeLineFilter = this.map.getFilter(strokeLineLayer);
      }
      layerFilterList.push({ [layerId]: layerFilter, [strokeLineLayer]: strokeLineFilter });
    });
    return layerFilterList;
  }

  setFilter(currentIndex: number, filter: any[], layerId: string): void {
    if (filter) {
      const layerFilter = this.layerFilterList[currentIndex] || {};
      const strokeLineLayer = layerId + '-strokeLine';
      if (this.map.getLayer(layerId)) {
        let originFilter = layerFilter[layerId];
        if (originFilter && originFilter.length === 1 && originFilter[0] === 'all') {
          originFilter = null;
        }
        this.map.setFilter(layerId, originFilter ? ['all', filter, originFilter] : ['all', filter]);
      }
      if (this.map.getLayer(strokeLineLayer)) {
        let strokeFilter = layerFilter[strokeLineLayer];
        if (strokeFilter && strokeFilter.length === 1 && strokeFilter[0] === 'all') {
          strokeFilter = null;
        }
        this.map.setFilter(strokeLineLayer, strokeFilter ? ['all', filter, strokeFilter] : ['all', filter]);
      }
    }
  }

  setVisibility(currentIndex = 0, layers = this.layersOnMap): void {
    layers.forEach((item, index) => {
      const visible = currentIndex === index ? 'visible' : 'none';
      this.map.setLayoutProperty(item, 'visibility', visible);
      this.map.setLayoutProperty(item + '-strokeLine', 'visibility', visible);
    });
  }

  fitToBounds(
    bboxs: any[] | { center: [number, number]; zoom: number },
    drillAnimation = this.drillAnimation
  ): void {
    if (bboxs instanceof Array) {
      // @ts-ignore
      this.map.fitBounds(bboxs, drillAnimation);
    } else if (bboxs instanceof Object) {
      const { center, zoom } = bboxs;
      this.map.setCenter(center);
      this.map.setZoom(zoom);
    }
  }

  drillNextMap(e: any): void {
    const feature = this.bindQueryRenderedFeatures(e, [this.allLayers[this.currentIndex]]);
    if (feature && feature.properties) {
      if (this.currentIndex + 1 >= this.data.length) {
        return;
      }
      const bboxs = this.getBboxByFeature(feature);
      const primaryField = this.data[this.currentIndex].primaryField;
      this.fieldValue = feature.properties[primaryField];
      this.boundsList.push(bboxs);
      this.triggerEvent('drillmap', { index: 1 });
    }
    if (!feature) {
      this.returnAboveLayer();
    }
  }

  returnAboveLayer() {
    if (this.currentIndex - 1 < 0) {
      return;
    }
    this.triggerEvent('drillmap', { index: -1 });
  }

  getBboxByFeature(feature): any[] {
    const bboxs = bbox(transformScale(feature, 2));
    return (
      bboxs && [
        [bboxs[0], bboxs[1]],
        [bboxs[2], bboxs[3]]
      ]
    );
  }

  bindQueryRenderedFeatures(e: any, layers): any {
    if (!layers) {
      return null;
    }
    const map = e.target;
    const bbox = [
      [e.point.x - this.clickTolerance, e.point.y - this.clickTolerance],
      [e.point.x + this.clickTolerance, e.point.y + this.clickTolerance]
    ];
    const features = map.queryRenderedFeatures(bbox, {
      layers
    });
    return features && features[0];
  }

  changeClickedLayersCursor(layers: string[]): void {
    layers.forEach(layerId => {
      this.map.on('mousemove', layerId, this.changeCursorPointer);
      this.map.on('mouseleave', layerId, this.changeCursorGrab);
    });
  }

  changeCursor(cursorType = 'point'): void {
    if (this.map && this.map.getCanvas()) {
      this.map.getCanvas().style.cursor = cursorType;
    }
  }

  removeCursorEvent(layers = this.layersOnMap): void {
    layers.forEach(layerId => {
      this.map.off('mousemove', layerId, this.changeCursorPointer);
      this.map.off('mouseleave', layerId, this.changeCursorGrab);
      this.changeCursor('point');
    });
  }

  removed() {
    if (!this.map) {
      return;
    }
    this.map.off('click', this.drillNextMapFn);
    this.removeCursorEvent();
  }

  getMapInfo(mapId: string, serverUrl: string): Promise<any> {
    if (!serverUrl || !mapId) {
      return null;
    }
    this.webMapService.handleServerUrl(serverUrl);
    return this.webMapService
      .getMapInfo()
      .then(
        (mapInfo: any) => {
          return { mapId, mapInfo };
        },
        error => {
          throw error;
        }
      )
      .catch(error => {
        console.log(error);
      });
  }

  getAllMapLayers(): Promise<any> {
    let promises = [];
    for (let i = 0; i < this.data.length; i++) {
      const item = this.data[i];
      const { serverUrl, mapId } = item;
      this.webMapService = new mapboxgl.supermap.WebMapService(mapId, item);
      const promise = this.getMapInfo(mapId, serverUrl);
      if (promise) {
        if (i === 0) {
          promise.then(res => {
            this.firstMapInfo = res.mapInfo;
          });
        }
        promises.push(promise);
      }
    }
    return Promise.all(promises).then(res => {
      const data = [];
      res.forEach(item => {
        const { mapId, mapInfo } = item;
        const index = this.data.findIndex(item => item.mapId === mapId);
        data[index] = { mapId, layers: mapInfo && mapInfo.layers ? [...mapInfo.layers] : [] };
      });
      return data;
    });
  }

  mergeMapLayers(): Promise<any> {
    const allLayersPromise = this.getAllMapLayers();
    return allLayersPromise.then(res => {
      let allLayers = [];
      const mapInfo = { ...this.firstMapInfo };
      res.forEach(item => {
        const { mapId, layers } = item;
        const filterDatas = this.data.filter(item => +item.mapId === +mapId);
        filterDatas.forEach(filterData => {
          const { layerId: filterLayer } = filterData || {};
          if (filterLayer) {
            const index = layers.findIndex(item => item.layerID === filterLayer || item.name === filterLayer);
            if (index > -1) {
              allLayers.push(layers[index]);
              layers.splice(index, 1);
            }
          }
        });
      });
      mapInfo.layers = allLayers;
      const result = this._dealSameLayerID(mapInfo);
      // @ts-ignore
      this.setLayersInfo(result.layers);
      return result;
    });
  }

  getMergeMapInfo(): Promise<any> {
    return this.mergeMapLayers();
  }

  private _dealSameLayerID(mapInfo): Object {
    const sumInfo: Object = {};
    const { baseLayer, layers = [] } = mapInfo;
    if (!this.checkSameLayer) {
      const baseInfo = this._generateUniqueLayerId(baseLayer.name, 0);
      baseLayer.name = baseInfo.newId;
    }
    const layerNames = layers.map(layer => layer.name);
    const _layers: Array<Object> = layers.map((layer, index) => {
      if (!(layer.name in sumInfo)) {
        sumInfo[layer.name] = baseLayer.name === layer.name ? 1 : 0;
      }
      const matchFirstIndex = layerNames.indexOf(layer.name);
      const matchLastIndex = layerNames.lastIndexOf(layer.name);
      if (index > matchFirstIndex && index <= matchLastIndex) {
        sumInfo[layer.name] = sumInfo[layer.name] + 1;
      }
      let layerID = sumInfo[layer.name] ? `${layer.name}-${sumInfo[layer.name]}` : layer.name;
      if (!this.checkSameLayer || layer.layerType !== 'raster') {
        const { newId, newIndex } = this._generateUniqueLayerId(layerID, sumInfo[layer.name]);
        sumInfo[layer.name] = newIndex;
        layerID = newId;
      }
      return Object.assign(layers[index], { layerID });
    });
    mapInfo.layers = _layers;
    mapInfo.baseLayer = baseLayer;
    return mapInfo;
  }

  private _generateUniqueLayerId(newId, index) {
    return { newId, newIndex: index };
  }
}
