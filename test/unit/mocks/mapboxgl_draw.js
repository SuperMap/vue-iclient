module.exports.MapboxDraw = function () {
    // ...require.requireActual('@mapbox/mapbox-gl-draw').MapboxDraw,
    // ...jest.requireActual('@mapbox/mapbox-gl-draw').MapboxDraw,
    return {
        changeMode: jest.fn(),
        deleteAll: function () {
            console.log("delete");
        },
        // jest.fn(),
        "delete": function () {
            console.log("delete");
        },
        getAll: function () {
            return { "type": "FeatureCollection", "features": [{ "id": "786c3dc0b07c96d1ac0d1b72614a3697", "type": "Feature", "properties": {}, "geometry": { "coordinates": [[73.76543776745376, 30.934649708911536], [73.76543776745376, 30.934649708911536]], "type": "LineString" } }] }
        },
        getSelectedIds: function () {

        }
    }
}
