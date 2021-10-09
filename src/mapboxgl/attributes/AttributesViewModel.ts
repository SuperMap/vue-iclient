import mapboxgl from '../../../static/libs/mapboxgl/mapbox-gl-enhance';
import bbox from '@turf/bbox';
import transformScale from '@turf/transform-scale';
import clonedeep from 'lodash.clonedeep';
import mergewith from 'lodash.mergewith';
import difference from 'lodash.difference';
import getFeatures from '../../common/_utils/get-features';

/**
 * @class AttributesViewModel
 * @description Attributes viewModel.
 * @param {Object} map - map实例对象。
 * @fires mapLoaded - 地图加载
 * @extends mapboxgl.Evented
 */

interface MapEventCallBack {
  (e: mapboxglTypes.MapMouseEvent): void;
}

interface AssociateWithMapParams {
  enabled?: boolean;
  zoomToFeature?: boolean;
  centerToFeature?: boolean;
}

interface FieldConfigParams {
  title?: string;
  value: string;
  visible?: boolean;
  align?: string;
  filterMultiple?: boolean;
  onFilter?: Function;
  onFilterDropdownVisibleChange?: Function;
  sorter?: Function | boolean;
  defaultSortOrder?: string;
  width?: string | number;
  search?: boolean;
  customCell?: Function;
  customHeaderCell?: Function;
}

interface PaginationParams {
  defaultCurrent?: number;
  current?: number;
  pageSize?: number;
  total?: number;
}

const HIGHLIGHT_COLOR = '#01ffff';
const defaultPaintTypes = {
  circle: ['circle-radius', 'circle-stroke-width'],
  line: ['line-width'],
  fill: ['line-width']
};

const mbglStyle = {
  circle: {
    'circle-color': HIGHLIGHT_COLOR,
    'circle-opacity': 0.6,
    'circle-stroke-color': HIGHLIGHT_COLOR,
    'circle-stroke-opacity': 1
  },
  line: {
    'line-color': HIGHLIGHT_COLOR,
    'line-opacity': 1
  },
  fill: {
    'fill-color': HIGHLIGHT_COLOR,
    'fill-opacity': 0.6,
    'fill-outline-color': HIGHLIGHT_COLOR
  },
  symbol: {
    layout: {
      'icon-size': 5
    }
  }
};

class FeatureTableViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;

  layerStyle: Object;

  selectedKeys: Array<string>;

  addKeys: Array<string>;

  fire: any;

  layerName: string;

  selectLayerFn: MapEventCallBack;

  sourceId: string;

  layerId: string;

  strokeLayerID: string;

  associateWithMap: AssociateWithMapParams;

  featureMap: Object;

  dataset: any;

  lazy: boolean;

  sorter: Object;

  paginationOptions: PaginationParams;

  searchText: string;

  searchedColumn: string;

  fieldConfigs: FieldConfigParams;

  currentTitle: string;

  constructor(options) {
    super();
    this.selectedKeys = [];
    this.addKeys = [];
    this.featureMap = {};
    Object.keys(options).forEach(option => {
      this[option] = options[option];
    });
    this.clearSelectedRows();
    if (this.useDataset()) {
      this.getDatas();
    }
    this.selectLayerFn = this._selectLayerFn.bind(this);
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
    this.fire('mapLoaded', map);
    this.handleAssociateWithMap();
    this.clearSelectedRows();
    if (this.layerName) {
      this.getDatas();
    }
  }

  setLayerName(layerName) {
    this.layerName = layerName;
    this.getDatas();
  }

  setDataset(dataset) {
    this.dataset = dataset;
    this.clearSelectedRows();
    this.getDatas();
  }

  setLazy(lazy) {
    this.lazy = lazy;
    this.clearSelectedRows();
    this.getDatas();
  }

  setSorter(sorter) {
    this.sorter = sorter;
    this.getDatas();
  }

  setAssociateWithMap(associateWithMap) {
    this.associateWithMap = associateWithMap;
    this.handleAssociateWithMap();
  }

  setPaginationOptions(paginationOptions) {
    this.paginationOptions = paginationOptions;
    this.getDatas();
  }

  setFieldConfigs(fieldConfigs) {
    this.fieldConfigs = fieldConfigs;
    this.getDatas();
  }

  refresh() {
    this.paginationOptions.current = 1;
    this.clearSelectedRows();
    this.getDatas();
  }

  setSearchText(searchText, searchedColumn) {
    this.searchText = searchText;
    this.searchedColumn = searchedColumn;
    this.getDatas();
  }

  _selectLayerFn(e) {
    let pos: mapboxglTypes.LngLatLike = [e.point.x, e.point.y];
    const featuresInfo = this.map.queryRenderedFeatures(pos, {
      layers: [this.layerName]
    });
    if (featuresInfo && featuresInfo.length) {
      this.fire('changeSelectLayer', featuresInfo[0]);
    }
  }

  enableSelectFeature() {
    this.map && this.map.on('click', this.selectLayerFn);
  }

  disableSelectFeature() {
    this.map && this.map.off('click', this.selectLayerFn);
  }

  zoomToFeatures(selectedKeys) {
    let highLightList = this.handleCoords(selectedKeys);
    if (Object.keys(selectedKeys).length) {
      let features = Object.values(highLightList);
      const geojson = {
        type: 'FeatureCollection',
        features
      };
      // @ts-ignore
      let bounds = bbox(transformScale(geojson, 2));
      this.map.fitBounds(
        [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]]
        ],
        { maxZoom: this.associateWithMap.zoomToFeature ? this.map.getMaxZoom() : this.map.getZoom() }
      );
    }
  }

  _inMapExtent(featureObj) {
    const mapbounds: mapboxglTypes.LngLatBoundsLike = this.map.getBounds();
    if (this.addKeys.length) {
      return this.addKeys.every(key => {
        let { type, coordinates } = featureObj[key].geometry;
        if (['MultiLineString', 'Polygon'].includes(type)) {
          return coordinates.some(line => {
            return line.some(coordinate => {
              // @ts-ignore
              return mapbounds.contains(coordinate);
            });
          });
        } else if (['MultiPoint', 'LineString'].includes(type)) {
          return coordinates.some(coordinate => {
            // @ts-ignore
            return mapbounds.contains(coordinate);
          });
        } else if (type === 'MultiPolygon') {
          return coordinates[0].some(polygon => {
            return polygon.some(coordinate => {
              // @ts-ignore
              return mapbounds.contains(coordinate);
            });
          });
        }
        // @ts-ignore
        return mapbounds.contains(coordinates);
      });
    }
    return false;
  }

  addOverlaysToMap(selectedKeys, layerStyleOptions, attributesTitle) {
    selectedKeys = this.handleCoords(selectedKeys);
    this.addKeys = difference(Object.keys(selectedKeys), this.selectedKeys);
    this.selectedKeys = Object.keys(selectedKeys);

    let filter: any = ['any'];
    this.selectedKeys.forEach(key => {
      const feature = selectedKeys[key];
      if (feature) {
        filter.push(['==', 'index', feature.properties['index']]);
      }
    });
    this.addOverlayToMap(filter, selectedKeys, layerStyleOptions, attributesTitle);
  }

  addOverlayToMap(filter, selectedKeys, layerStyleOptions, attributesTitle) {
    let { centerToFeature, zoomToFeature } = this.associateWithMap;
    if (!this.map) {
      return;
    }
    let layer = this.map.getLayer(this.layerName);
    let type, id: string, paint;
    let features = [];
    if (!layer) {
      if (attributesTitle && this.currentTitle && attributesTitle !== this.currentTitle) {
        this.removed();
      }
      for (const key in this.featureMap) {
        features.push(this.featureMap[key]);
      }
      switch (features[0].geometry.type) {
        case 'Point':
          type = 'circle';
          break;
        case 'LineString':
        case 'MultiLineString':
          type = 'line';
          break;
        case 'Polygon':
        case 'MultiPolygon':
          type = 'fill';
          break;
        default:
          break;
      }
      id = attributesTitle;
      this.currentTitle = attributesTitle;
      this.sourceId = id + '-attributes-SM-highlighted-source';
      if (this.map.getSource(this.sourceId)) {
        //@ts-ignore
        this.map.getSource(this.sourceId).setData({
          type: 'FeatureCollection',
          features
        });
      } else {
        this.map.addSource(this.sourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features
          }
        });
      }
    } else {
      type = layer.type;
      id = layer.id;
      paint = layer.paint;
    }
    // 如果是面的strokline,处理成面
    if (id.includes('-strokeLine') && type === 'line') {
      type = 'fill';
      paint = {};
    }
    let layerStyle = this._setDefaultPaintWidth(
      type,
      id,
      defaultPaintTypes[type],
      layerStyleOptions || this.layerStyle
    );
    this.layerId = id + '-attributes-SM-highlighted';
    this.strokeLayerID = id + '-attributes-SM-StrokeLine';
    if (
      (!this.addKeys.length && !this.selectedKeys.length) ||
      JSON.stringify(layerStyleOptions) !== JSON.stringify(this.layerStyle)
    ) {
      this.map.getLayer(this.layerId) && this.map.removeLayer(this.layerId);
      this.map.getLayer(this.strokeLayerID) && this.map.removeLayer(this.strokeLayerID);
    }
    if (['circle', 'fill', 'line'].includes(type)) {
      if (this.map.getLayer(this.layerId)) {
        this.map.setFilter(this.layerId, filter);
      } else {
        let highlight_layerStyle = layerStyle[type];
        let highlightLayer = {
          id: this.layerId,
          type,
          paint: (highlight_layerStyle && highlight_layerStyle.paint) || Object.assign({}, paint, mbglStyle[type]),
          layout: (highlight_layerStyle && highlight_layerStyle.layout) || { visibility: 'visible' },
          filter
        };
        highlightLayer = Object.assign({}, layer || { source: this.sourceId }, highlightLayer);
        this.map.addLayer(highlightLayer);
      }

      if (
        this.addKeys.length &&
        (centerToFeature ||
          zoomToFeature ||
          (!zoomToFeature && Object.keys(selectedKeys).length && !this._inMapExtent(selectedKeys)))
      ) {
        this.zoomToFeatures(Object.keys(selectedKeys));
      }
    }
    if (type === 'fill') {
      if (this.map.getLayer(this.strokeLayerID)) {
        this.map.setFilter(this.strokeLayerID, filter);
      } else {
        let stokeLineStyle = layerStyle.strokeLine || layerStyle.stokeLine || {};
        let lineStyle = (stokeLineStyle && stokeLineStyle.paint) || {
          'line-width': 3,
          'line-color': HIGHLIGHT_COLOR,
          'line-opacity': 1
        };
        let highlightLayer = {
          id: this.strokeLayerID,
          type: 'line',
          paint: lineStyle,
          layout: { visibility: 'visible' },
          filter
        };
        highlightLayer = Object.assign({}, layer || { source: this.sourceId }, highlightLayer);
        //@ts-ignore
        this.map.addLayer(highlightLayer);
      }
    }
    this.addKeys = [];
  }

  _setDefaultPaintWidth(type, layerId, paintTypes, layerStyle) {
    if (!paintTypes) {
      return;
    }
    paintTypes.forEach(paintType => {
      let mapPaintProperty;
      if (type !== 'fill') {
        mapPaintProperty = this.map.getLayer(layerId) && this.map.getPaintProperty(layerId, paintType);
      } else {
        type = 'stokeLine';
      }
      layerStyle[type].paint[paintType] = layerStyle[type].paint[paintType] || mapPaintProperty;
      if (layerStyle[type].paint[paintType] === void 0 || layerStyle[type].paint[paintType] === '') {
        layerStyle[type].paint[paintType] = paintType === 'circle-stroke-width' || type === 'stokeLine' ? 2 : 8;
      }
    });
    return layerStyle;
  }

  _getFeaturesFromLayer(layerName: string) {
    // @ts-ignore
    return this.map.getSource(layerName).getData().features;
  }

  async getDatas() {
    if (this.dataset || this.layerName) {
      let features;
      let totalCount;
      if (this.useDataset()) {
        const datas = await this._getFeaturesFromDataset();
        features = datas.features;
        totalCount = datas.totalCount;
      } else {
        features = this._getFeaturesFromLayer(this.layerName);
        totalCount = features.length;
      }
      const content = this.toTableContent(features);
      const columns = this.toTableColumns(features[0].properties);

      this.fire('dataChanged', { content, totalCount, columns });
    }
  }

  async _getFeaturesFromDataset() {
    // @ts-ignore
    const { url, geoJSON } = this.dataset;
    if (url || geoJSON) {
      let dataset = clonedeep(this.dataset);
      // @ts-ignore
      if (!this.associateWithMap.enabled) {
        dataset.hasGeometry = false;
      }
      if (this.canLazyLoad()) {
        if (this.searchText && this.searchedColumn) {
          dataset.attributeFilter = `${this.searchedColumn} like '%${this.searchText}%'`;
        }
        // @ts-ignore
        if (this.sorter && this.sorter.field && this.sorter.order) {
          // @ts-ignore
          let sortType = this.sorter.order === 'ascend' ? 'asc' : 'desc';
          // @ts-ignore
          dataset.orderBy = `${this.sorter.field} ${sortType}`;
        }
        dataset.fromIndex = this.paginationOptions.pageSize * (this.paginationOptions.current - 1 || 0);
        dataset.toIndex = dataset.fromIndex + this.paginationOptions.pageSize - 1;
      }

      return await getFeatures(dataset);
    }
  }

  toTableContent(features) {
    let content = [];
    features &&
      features.forEach((feature, index) => {
        let properties = feature.properties;
        let coordinates = feature.geometry && feature.geometry.coordinates;
        if (!properties) {
          return;
        }
        !properties.index && (properties.index = index);
        if (coordinates && coordinates.length) {
          this.featureMap[properties.index] = feature;
        }
        properties.key = +properties.index;
        JSON.stringify(properties) !== '{}' && content.push(properties);
      });
    return content;
  }

  toTableColumns(headers) {
    let columns = [];

    Object.keys(headers).forEach((propertyName, index) => {
      let columnConfig = {
        title: propertyName,
        dataIndex: propertyName,
        visible: true
      };
      if (typeof +headers[propertyName] === 'number' && !isNaN(+headers[propertyName])) {
        // @ts-ignore
        columnConfig.sorter = (a, b) => a[propertyName] - b[propertyName];
      }
      // @ts-ignore
      if (this.fieldConfigs && this.fieldConfigs.length) {
        // @ts-ignore
        const config = this.fieldConfigs.find(fieldConfig => {
          return fieldConfig.value === propertyName;
        });
        if (config) {
          let copyConfig = clonedeep(config);

          copyConfig.dataIndex = copyConfig.value;
          delete copyConfig.value;
          columnConfig = mergewith(columnConfig, copyConfig, (obj, src) => {
            if (typeof src === 'undefined') {
              return obj;
            }
          });
          // @ts-ignore
          if (columnConfig.sorter && typeof columnConfig.sorter === 'boolean') {
            // @ts-ignore
            columnConfig.sorter = (a, b) => a[propertyName] - b[propertyName];
          }
          // @ts-ignore
          if (columnConfig.search) {
            // @ts-ignore
            if (!columnConfig.onFilter) {
              // @ts-ignore
              columnConfig.onFilter = (value, record) => {
                return (record[propertyName] + '').includes(value);
              };
            }
            // @ts-ignore
            columnConfig.scopedSlots = {
              filterDropdown: 'filterDropdown',
              filterIcon: 'filterIcon',
              customRender: 'customRender'
            };
          }
          // @ts-ignore
          if (!columnConfig.customCell) {
            // @ts-ignore
            columnConfig.customCell = record => {
              return {
                attrs: {
                  title: record[copyConfig.dataIndex]
                }
              };
            };
          }
        }
      }
      columns.push(columnConfig);
    });
    let columnOrder = [];
    let columnsResult = [];
    // @ts-ignore
    this.fieldConfigs && this.fieldConfigs.forEach(element => {
        columnOrder.push(element.value);
      });
    columnOrder.forEach(str => {
      columns.forEach(element => {
        if (element.dataIndex === str) {
          columnsResult.push(element);
        }
      });
    });
    return columnsResult.length === 0 ? columns : columnsResult;
  }

  handleCoords(selectedKeys) {
    let highLightList = {};
    selectedKeys.forEach(key => {
      if (this.featureMap[key]) {
        highLightList[key] = this.featureMap[key];
      }
    });
    return highLightList;
  }

  useDataset() {
    return !!(this.dataset && (this.dataset.url || this.dataset.geoJSON));
  }

  canLazyLoad() {
    return this.lazy && this.dataset && this.dataset.url && this.dataset.type === 'iServer';
  }

  handleAssociateWithMap() {
    if (this.associateWithMap.enabled && this.layerName) {
      this.enableSelectFeature();
    } else {
      this.disableSelectFeature();
    }
  }

  clearSelectedRows() {
    this.fire('clearselectedrows');
  }

  removed() {
    this.map.getLayer(this.layerId) && this.map.removeLayer(this.layerId);
    this.map.getLayer(this.strokeLayerID) && this.map.removeLayer(this.strokeLayerID);
    this.map.getSource(this.sourceId) && this.map.removeSource(this.sourceId);
  }
}
export default FeatureTableViewModel;
