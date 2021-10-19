require('flow-remove-types/register')({
  includes: /.*?\/mapbox-gl\/src\/.*/,
  excludes: {
    test: function () {
      return false;
    }
  }
});

var union = require('@turf/union');
var bboxPolygon = require('@turf/bbox-polygon');
var buffer = require('@turf/buffer');

var LngLat = require('mapbox-gl/src/geo/lng_lat');
var LngLatBounds = require('mapbox-gl/src/geo/lng_lat_bounds');
var Evented = require('mapbox-gl/src/util/evented');
// var Transform = require('mapbox-gl/src/geo/transform');
var util = require('mapbox-gl/src/util/util');
// var Style = require('mapbox-gl/src/style/style');

// var Style = require('./style');

var defaultOptions = {
  doubleClickZoom: true
};

function functor(x) {
  return function () {
    return x;
  };
}

function _fakeResourceTiming(name) {
  return {
    name: name,
    secureConnectionStart: 0,
    redirectEnd: 0,
    redirectStart: 0,
    workerStart: 0,
    startTime: 2886.775,
    connectStart: 2886.775,
    connectEnd: 2886.875,
    fetchStart: 2886.875,
    domainLookupStart: 2886.775,
    domainLookupEnd: 2886.875,
    requestStart: 2890.3700000000003,
    responseStart: 2893.1650000000004,
    responseEnd: 2893.78,
    duration: 7.005000000000109,
    entryType: 'resource',
    initiatorType: 'xmlhttprequest',
    nextHopProtocol: 'http/1.1',
    encodedBodySize: 155,
    decodedBodySize: 155,
    serverTiming: [],
    transferSize: 443
  };
}

var Map = function (options) {
  var evented = new Evented();
  this.on = evented.on;
  this.fire = evented.fire;
  this.listens = evented.listens;

  this.options = util.extend(options || {}, defaultOptions);
  this._events = {};
  this._sources = {};
  this._collectResourceTiming = !!this.options.collectResourceTiming;
  this.zoom = this.options.zoom || 0;
  this._container = this.options.container || 'map';
  // this.style;
  this._layers = {};
  this.getContainer = function () {
    return this._container;
  };
  //add by sunxy
  var sw = new LngLat(-73.9876, 40.7661);
  var ne = new LngLat(-73.9397, 40.8002);
  var llb = new LngLatBounds(sw, ne);
  this.bounds = this.options.bounds || llb;

  try {
    this.center = this.options.center ? new LngLat(this.options.center.lng, this.options.center.lat) : new LngLat(0, 0);
  } catch (e) {
    this.center = this.options.center ? new LngLat(this.options.center[0], this.options.center[1]) : new LngLat(0, 0);
  }
  this.resize = function () {};
  this.style = options.style;
  this.setStyle = function (style, options) {
    for (var i = 0, list = style.layers; i < list.length; i += 1) {
      var layer = list[i];
      this._layers[layer.id] = layer;
    }
  };
  if (options.style) {
    this.setStyle(options.style);
  }
  // this.transform = new Transform();
  this._controlCorners = {
    'top-left': {
      appendChild: function () {}
    }
  };
  setTimeout(
    function () {
      this.fire('load');
    }.bind(this),
    0
  );

  var setters = [
    // Camera options
    'jumpTo',
    'panTo',
    'panBy',
    'setBearing',
    'setPitch',
    'setZoom',
    'fitBounds',
    'resetNorth',
    'snapToNorth',
    // Settings
    'setMaxBounds',
    'setMinZoom',
    'setMaxZoom',
    // Layer properties
    'setLayoutProperty',
    'setPaintProperty'
  ];
  var genericSetter = functor(this);
  for (var i = 0; i < setters.length; i++) {
    this[setters[i]] = genericSetter;
  }

  this.setLayoutProperty = function (layerid) {};

  this.addControl = function (control) {
    control.onAdd(this);
  };

  this.getStyle = function () {
    if (this.style) {
      return this.style;
    }
  };

  this.getContainer = function () {
    var container = {
      parentNode: container,
      appendChild: function () {},
      removeChild: function () {},
      getElementsByClassName: function () {
        return [container];
      },
      addEventListener: function (name, handle) {},
      removeEventListener: function () {},
      classList: {
        add: function () {},
        remove: function () {}
      }
    };

    return container;
  };

  this.getSource = function (name) {
    if (name === 'UNIQUE-民航数-0') {
      let chartResult = {
        features: [
          {
            type: 'Feature',
            properties: {
              机场: '北京/首都',
              X坐标: '116.588918',
              Y坐标: '40.071080',
              名次: '1',
              '2017旅客吞吐量（人次）': '95,786,296',
              '2016旅客 吞吐量（人次）': '94,393,454',
              '同比增速%': '-1.5',
              '2017货邮吞吐量（吨）': '2,029,583.6',
              '2016货邮吞吐量（吨）': '1,943,159.7',
              '2017起降架次（架 次）': '597,259',
              '2016起降架次（架次）': '606,081',
              index: 0
            },
            geometry: {
              type: 'Point',
              coordinates: [116.588918, 40.07108]
            }
          }
        ]
      };
      return {
        _data: chartResult
      };
    }
    if (this._sources[name]) {
      return {
        setData: function (data) {
          this._sources[name].data = data;
          if (this._sources[name].type === 'geojson') {
            const e = {
              type: 'data',
              sourceDataType: 'content',
              sourceId: name,
              isSourceLoaded: true,
              dataType: 'source',
              source: this._sources[name]
            };
            // typeof data === 'string' corresponds to an AJAX load
            if (this._collectResourceTiming && data && typeof data === 'string')
              e.resourceTiming = [_fakeResourceTiming(data)];
            this.fire('data', e);
          }
        }.bind(this),
        loadTile: function () {}
      };
    }
    if (name === 'ChinaDark') {
      return {
        setData: function (data) {
          this._sources[name].data = data;
          if (this._sources[name].type === 'geojson') {
            const e = {
              type: 'data',
              sourceDataType: 'content',
              sourceId: name,
              isSourceLoaded: true,
              dataType: 'source',
              source: this._sources[name]
            };
            // typeof data === 'string' corresponds to an AJAX load
            if (this._collectResourceTiming && data && typeof data === 'string')
              e.resourceTiming = [_fakeResourceTiming(data)];
            this.fire('data', e);
          }
        }.bind(this),
        loadTile: function () {}
      };
    } else if (name === 'dataflowlayer-1') {
      return null;
    } else if (name == 'dataflowlayer-source') {
      return {
        setData: function (data) {},
        loadTile: function () {},
        _data: {
          features: [
            { geometry: { type: 'Point', coordinates: [0, 0] }, properties: { id: 1 } },
            { geometry: { type: 'Point', coordinates: [0, 0] }, properties: { id: 2 } }
          ]
        }
      };
    } else if (name == 'dataflowlayer-source-has-false') {
      return {
        setData: function (data) {},
        loadTile: function () {},
        _data: {
          features: [{ geometry: { type: 'Point', coordinates: [0, 0] }, properties: { id: 2 } }]
        }
      };
    } else {
      return {
        setData: function (data) {},
        loadTile: function () {}
      };
    }
  };

  this.loaded = function () {
    return true;
  };

  this.removeControl = function () {
    return this;
  };

  this.overlayLayersManager = {};

  this.addSource = function (name, source) {
    this._sources[name] = source;
    if (source.type === 'geojson') {
      const e = {
        type: 'data',
        sourceDataType: 'metadata',
        sourceId: name,
        isSourceLoaded: true,
        dataType: 'source',
        source: source
      };
      if (this._collectResourceTiming && source.data && typeof source.data === 'string')
        e.resourceTiming = [_fakeResourceTiming(source.data)];
      this.fire('data', e);
    }
  };
  this.removeSource = function (name) {
    delete this._sources[name];
  };
  this.off = function () {};
  this.addLayer = function (layer, before) {
    this.overlayLayersManager[layer.id] = layer;

    return this;
  };

  this.addStyle = function (style, before) {
    return style;
  };

  this.removeLayer = function (layerId) {};
  this.moveLayer = function (layerId) {};
  this.getFilter = function (layerId) {};
  this.setFilter = function (layerId, filter) {};
  this.getLayer = function (id) {
    if (this.overlayLayersManager[id]) {
      return this.overlayLayersManager[id];
    }
    if (this._layers[id]) {
      return this._layers[id];
    }
  };
  this.getBounds = function () {
    return this.bounds;
  };

  this.getZoom = function () {
    return this.zoom;
  };
  this.getBearing = functor(0);
  this.getPitch = functor(0);
  this.getCenter = function () {
    return this.center;
  };
  this.setCenter = function (x) {
    if (x instanceof Array) {
      this.center = new LngLat(x[0], x[1]);
    } else if (x instanceof Object) {
      this.center = new LngLat(x.lng, x.lat);
    }
  };

  this.getMinZoom = function () {
    return 0;
  };
  this.getMaxZoom = function () {
    return 22;
  };
  this.doubleClickZoom = {
    disable: function () {},
    enable: function () {}
  };

  this.boxZoom = {
    disable: function () {},
    enable: function () {}
  };

  this.dragPan = {
    disable: function () {},
    enable: function () {}
  };

  this.project = function () {};
  this.unproject = function (point) {
    return new LngLat(-73.9876, 40.7661);
  };
  /**
   * Returns an array of features that overlap with the pointOrBox
   * Currently it does not respect queryParams
   *
   * pointOrBox: either [x, y] pixel coordinates of a point, or [ [x1, y1] , [x2, y2] ]
   */
  this.queryRenderedFeatures = function (pointOrBox, queryParams) {
    var searchBoundingBox = [];
    if (pointOrBox[0].x !== undefined) {
      searchBoundingBox = [
        Math.min(pointOrBox[0].x, pointOrBox[1].x),
        Math.min(pointOrBox[0].y, pointOrBox[1].y),
        Math.max(pointOrBox[0].x, pointOrBox[1].y),
        Math.max(pointOrBox[0].x, pointOrBox[1].y)
      ];
    } else {
      searchBoundingBox = [
        Math.min(pointOrBox[0][0], pointOrBox[1][0]),
        Math.min(pointOrBox[0][1], pointOrBox[1][1]),
        Math.max(pointOrBox[0][0], pointOrBox[1][0]),
        Math.max(pointOrBox[0][1], pointOrBox[1][1])
      ];
    }

    var searchPolygon = bboxPolygon(searchBoundingBox);
    var features = Object.keys(this._sources).reduce(
      (memo, name) => memo.concat(this._sources[name].data.features),
      []
    );
    features = features.filter(feature => {
      var subFeatures = [];

      if (feature.geometry.type.startsWith('Multi')) {
        var type = feature.geometry.type.replace('Multi', '');
        subFeatures = feature.geometry.coordinates.map(coords => {
          return {
            type: 'Feature',
            properties: feature.properties,
            geometry: {
              type: type,
              coordinates: coords
            }
          };
        });
      } else {
        subFeatures.push(feature);
      }

      // union only works with polygons, so we convert points and lines into polygons
      // TODO: Look into having this buffer match the style
      subFeatures = subFeatures.map(subFeature => {
        if (subFeature.geometry.type === 'Point' || subFeature.geometry.type === 'LineString') {
          return buffer(subFeature, 0.00000001, 'kilometers');
        } else {
          return subFeature;
        }
      });

      // if any of the sub features intersect with the seach box, return true
      // if none of them intersect with the search box, return false
      return subFeatures.some(subFeature => {
        // union takes two polygons and merges them.
        // If they intersect it returns them merged Polygon geometry type
        // If they don't intersect it retuns them as a MultiPolygon geomentry type
        var merged = union(subFeature, searchPolygon);
        return merged.geometry.type === 'Polygon';
      });
    });

    return features;
  };

  this.remove = function () {
    this._events = [];
    this.sources = [];
  };

  this.zoomIn = function (e) {
    this.zoom++;
    return this.zoom;
  };

  this.zoomOut = function (e) {
    this.zoom--;
    this.fire('wheel');
    this.fire('zoomend', this.zoom);
    return this.zoom;
  };
  this.loadImage = function (src, callback) {
    setTimeout(function () {
      callback(null, [1, 2, 3]);
    }, 10);
  };
  this.addImage = function () {};
  this.hasImage = function () {
    return true;
  };
  this.getCanvasContainer = () => {
    return {
      appendChild() {}
    };
  };
  this.getCanvas = () => {
    return {
      style: {
        width: 100,
        height: 100
      }
    };
  };
  this.getCRS = () => {
    return {};
  };
  this.setCRS = () => {};
  this.flyTo = options => {};
  this.setRenderWorldCopies = epsgCode => {};
};

module.exports = Map;
