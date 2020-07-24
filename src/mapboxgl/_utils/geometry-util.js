// mbgl isssue https://github.com/mapbox/mapbox-gl-js/issues/7023
// https://github.com/mapbox/vector-tile-js/blob/a9a9102/lib/vectortilefeature.js#L195-L233
export const handleMultyPolygon = features => {
  features.forEach(feature => {
    if (feature.geometry.type !== 'Polygon') {
      return;
    }
    let coords = feature.geometry.coordinates;
    if (coords.length > 1) {
      let coordinates = [[coords[0]]];
      for (let index = 1; index < coords.length; index++) {
        const element = coords[index];
        const area = signedArea(element);
        if (area === 0) {
          continue;
        }
        if (area > 0) {
          coordinates[coordinates.length - 1].push(coords[index]);
        } else {
          coordinates.push([coords[index]]);
        }
      }

      feature.geometry.coordinates = coordinates;
      feature.geometry.type = 'MultiPolygon';
    }
  });
  return features;
};

function signedArea(ring) {
  var sum = 0;
  for (var i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {
    p1 = ring[i];
    p2 = ring[j];
    sum += (p2[0] - p1[0]) * (p1[1] + p2[1]);
  }
  return sum;
}
