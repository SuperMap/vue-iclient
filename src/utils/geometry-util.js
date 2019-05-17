export const handleMultyPolygon = features => {
  features.forEach(feature => {
    if (feature.geometry.type !== 'Polygon') {
      return;
    }
    let coords = feature.geometry.coordinates;
    if (coords.length > 1) {
      let coordinates = [];
      coords.forEach(coord => {
        coordinates.push([coord]);
      });
      feature.geometry.coordinates = coordinates;
      feature.geometry.type = 'MultiPolygon';
    }
  });
  return features;
};
