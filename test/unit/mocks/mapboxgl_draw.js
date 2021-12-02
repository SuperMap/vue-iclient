function MapboxDraw() {
  // ...require.requireActual('@mapbox/mapbox-gl-draw').MapboxDraw,
  // ...jest.requireActual('@mapbox/mapbox-gl-draw').MapboxDraw,
  return {
    changeMode: jest.fn(),
    deleteAll: function() {
      console.log('delete');
    },
    // jest.fn(),
    delete: function() { 
      jest.fn()
    },
    getAll: function() {
      return {
        type: 'FeatureCollection',
        features: [
          {
            id: '786c3dc0b07c96d1ac0d1b72614a3697',
            type: 'Feature',
            properties: {},
            geometry: {
              coordinates: [[73.76543776745376, 30.934649708911536], [73.76543776745376, 30.934649708911536]],
              type: 'LineString'
            }
          }
        ]
      };
    },
    getSelectedIds: function() {
      return [];
    },
    onRemove: function() {},
    onAdd: function() {}
  };
}


var modes = (MapboxDraw.modes = MapboxDraw.modes || {});
var simple_select  = (modes.simple_select = jest.fn());

module.exports = { MapboxDraw,modes}
