import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
/**
 * @class ClusterLayerViewModel
 * @param {mapboxgl.map} map - mapboxgl map 对象。
 * @param {Object} data - Cluster layer data。
 * @param {Object} options - 可选参数。
 * @param {String} [options.layerId] - 图层 ID。
 * @param {Object} [options.clusteredPointStyle] - 聚合点的 Paint 对象。
 * @param {Object} [options.unclusteredPointStyle] - 未聚合的点的 Paint 对象。
 * @param {Object} [options.clusteredPointTextLayout] -  聚合点的文本 layout 对象
 * @param {number} [options.radius=50] - 图层聚合点半径。
 * @param {number} [options.maxZoom=14] - 图层最大显示级别。
 */

export default class ClusterLayerViewModel extends mapboxgl.Evented {
  constructor(data, options = {}) {
    super();
    this.options = options;
    this.data = data;
    this.layerId = options.layerId || 'clusterLayer' + new Date().getTime();
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    if (!map) {
      throw new Error('map is requierd');
    }
    this.map = map;
    this._initializeClusterLayer();
  }

  setData(data) {
    if (!data) {
      return;
    }
    this.data = data;
    if (this.layerId && !this.map.getSource(this.layerId)) {
      this._initializeClusterLayer();
    } else {
      this.map.getSource(this.layerId).setData(data);
    }
  }

  setClusteredPointStyle(clusteredPointStyle) {
    if (!clusteredPointStyle || (this.layerId && !this.map.getSource(this.layerId))) {
      return;
    }
    this.options.clusteredPointStyle = clusteredPointStyle;
    this._setPaintProperty(clusteredPointStyle.paint, this.layerId);
    this._setLayoutProperty(clusteredPointStyle.layout, this.layerId);
  }

  setUnclusteredPointStyle(unclusteredPointStyle) {
    let layerId = 'unclustered_point' + this.layerId;
    if (!unclusteredPointStyle || !this.map.getSource(layerId)) {
      return;
    }
    this.options.unclusteredPointStyle = unclusteredPointStyle;
    this._setPaintProperty(unclusteredPointStyle.paint, layerId);
    this._setLayoutProperty(unclusteredPointStyle.layout, layerId);
  }

  setClusteredPointTextLayout(clusteredPointTextLayout) {
    let layerId = 'count_' + this.layerId;
    if (!clusteredPointTextLayout || !this.map.getSource(layerId)) {
      return;
    }
    this.options.clusteredPointTextLayout = clusteredPointTextLayout;
    this._setLayoutProperty(clusteredPointTextLayout, layerId);
  }

  _setPaintProperty(paint, layerId) {
    Object.keys(paint).forEach(key => {
      this.map.setPaintProperty(layerId, key, paint[key]);
    });
  }

  _setLayoutProperty(layout, layerId) {
    Object.keys(layout).forEach(key => {
      this.map.setLayoutProperty(layerId, key, layout[key]);
    });
  }

  _initializeClusterLayer() {
    this.map.addSource(this.layerId, {
      type: 'geojson',
      data: this.data,
      cluster: true,
      clusterMaxZoom: this.options.maxZoom || 14,
      clusterRadius: this.options.radius || 50
    });

    this.map.addLayer({
      id: this.layerId,
      type: 'circle',
      source: this.layerId,
      filter: ['has', 'point_count'],
      paint: (this.options.clusteredPointStyle && this.options.clusteredPointStyle.paint) || {
        'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
      }
    });

    // 聚合点文本 layer
    this.map.addLayer({
      id: 'count_' + this.layerId,
      type: 'symbol',
      source: this.layerId,
      filter: ['has', 'point_count'],
      layout: this.options.clusteredPointTextLayout || {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    });

    // 未聚合点 layer
    this.map.addLayer({
      id: 'unclustered_point' + this.layerId,
      type: 'circle',
      source: this.layerId,
      filter: ['!', ['has', 'point_count']],
      paint: (this.options.unclusteredPointStyle && this.options.unclusteredPointStyle.paint) || {
        'circle-color': '#11b4da',
        'circle-radius': 4,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    });

    /**
     * @event addcusterlayersucceeded
     * @description 添加点聚合图层成功后触发。
     * @property {Object} map - mapboxgl map 对象。
     */
    this.fire('addcusterlayersucceeded', { map: this.map });

    this.map.on('click', this.layerId, e => {
      let features = this.map.queryRenderedFeatures(e.point, { layers: [this.layerId] });
      let clusterId = features[0].properties.cluster_id;
      this.map.getSource(this.layerId).getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        this.map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      });
    });

    this.map.on('mouseenter', this.layerId, () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', this.layerId, () => {
      this.map.getCanvas().style.cursor = '';
    });
  }

  removed() {
    const { map, layerId } = this;
    if (map && layerId && map.getSource(layerId)) {
      map.getLayer(layerId) && map.removeLayer(layerId);
      map.getLayer(`count_${layerId}`) && map.removeLayer(`count_${layerId}`);
      map.getLayer(`unclustered_point${layerId}`) && map.removeLayer(`unclustered_point${layerId}`);
      map.removeSource(layerId);
    }
  }
}
