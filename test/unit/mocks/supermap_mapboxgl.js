import {
  fakeAddressMatch
} from './services';
const supermap = {};


supermap.AddressMatchService = () => {
  return {
    code: (param, callback) =>
      setTimeout(() => {
        callback(fakeAddressMatch);
      }, 0)
    // queryByBounds: (param, callback) => callback(fakeMapServiceResult)
  };
};

supermap.RankSymbolThemeLayer = () => {
  return {
    addFeatures() {}
  };
};

supermap.MapService = () => {
  return {
    getMapInfo(callback) {
      setTimeout(() => {
        const mapObj = {
          element: null,
          object: {},
          result: {},
          type: 'processCompleted'
        };
        callback(mapObj);
      }, 0);
    }
  };
};

supermap.GraphThemeLayer = () => {
  return {
    addFeatures() {}
  };
};

supermap.LabelThemeLayer = () => {
  return {
    addFeatures() {}
  };
};

supermap.RangeThemeLayer = () => {
  return {
    addFeatures() {}
  };
};

supermap.UniqueThemeLayer = () => {
  return {
    addFeatures() {}
  };
};

supermap.MapvLayer = () => {
  return {};
};
const dataflowFeature = {
  geometry: {
    type: 'Point',
    coordinates: [116.588918, 40.07108]
  },
  properties: {
    'id': 1
  }
};
const dataflowData = JSON.stringify(dataflowFeature);
supermap.DataFlowService = serviceUrl => {
  return {
    initBroadcast: () => {
      return this;
    },
    broadcast: () => {
      return this;
    },
    initSubscribe: () => {
      return {
        on: (event, callback) => {
          if (event === 'messageSucceeded') {
            if (serviceUrl.includes('MultiLineString')) {
              callback({
                featureResult: {
                  geometry: {
                    type: 'MultiLineString',
                    coordinates: [
                      [
                        [0, 0],
                        [10, 10]
                      ]
                    ]
                  },
                  properties: {
                    id: 1
                  }
                },
              });
            } else if (serviceUrl.includes('LineString')) {
              callback({
                featureResult: {
                  geometry: {
                    type: 'LineString',
                    coordinates: [
                      [0, 0],
                      [10, 10]
                    ]
                  },
                  properties: {
                    id: 1
                  }
                }
              });
            } else if (serviceUrl.includes('Line')) {
              callback({
                featureResult: {
                  geometry: {
                    type: 'Line',
                    coordinates: [
                      [0, 0],
                      [10, 10]
                    ]
                  },
                  properties: {
                    id: 1
                  }
                }
              });
            } else if (serviceUrl.includes('MultiPolygon')) {
              callback({
                featureResult: {
                  geometry: {
                    type: 'MultiPolygon',
                    coordinates: [
                      [
                        [0, 0],
                        [10, 10],
                        [20, 20],
                        [0, 0]
                      ]
                    ]
                  },
                  properties: {
                    id: 1
                  }
                }
              });
            } else if (serviceUrl.includes('Polygon')) {
              callback({
                featureResult: {
                  geometry: {
                    type: 'Polygon',
                    coordinates: [
                      [
                        [0, 0],
                        [10, 10],
                        [20, 20],
                        [0, 0]
                      ]
                    ]
                  },
                  properties: {
                    id: 1
                  }
                }
              });
            } else {
              callback({
                featureResult: {
                  geometry: {
                    type: 'Point',
                    coordinates: [0, 0]
                  },
                  properties: {
                    id: 1
                  }
                },
                data: dataflowData
              });
            }
          } else {
            callback();
          }
        }
      };
    },
    setExcludeField: () => {},
    on: (event, callback) => {
      callback();
    }
  };
};

supermap.DeckglLayer = () => {};

supermap.GetFeaturesBySQLParameters = () => {
  return {}
}

supermap.Util = {
  hexToRgba: function (hex, opacity) {
    var color = [],
      rgba = [];
    hex = hex.replace(/#/, '');
    for (let i = 0; i < 6; i += 2) {
      color[i] = '0x' + hex.substr(i, 2);
      rgba.push(parseInt(Number(color[i])));
    }
    rgba.push(opacity);
    return 'rgba(' + rgba.join(',') + ')';
  }
};

supermap.GraticuleLayer = () => {
  return {
    id: 'GraticuleLayer',
    overlay: true,
    sourceId: 'GraticuleLayer',
    setStrokeStyle: jest.fn()
  }
};

supermap.GraphMap = () => {
  return {
    on: (event, callback) => {
      callback();
    }
  }
}

module.exports = supermap;
