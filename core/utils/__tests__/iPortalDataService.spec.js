import iPortalDataService from '../iPortalDataService';

describe('iPortalDataService GeoJSON content', () => {
  let service;

  beforeEach(() => {
    service = new iPortalDataService('https://fakeiportal.supermap.io/web/datas/1', false);
  });

  it('keeps geometry when a .json Feature has no features array', () => {
    const result = service._json2Feature({
      type: 'Feature',
      properties: { name: 'A' },
      geometry: { type: 'Point', coordinates: [116.4, 39.9] }
    });
    expect(result.features).toHaveLength(1);
    expect(result.features[0].geometry).toEqual({ type: 'Point', coordinates: [116.4, 39.9] });
    expect(result.features[0].properties).toEqual({ name: 'A' });
  });

  it('parses already-decoded content objects without calling JSON.parse on them', () => {
    const content = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] }
        }
      ]
    };
    expect(service._parsePortalJsonContent(content)).toBe(content);
    expect(service._parsePortalJsonContent(JSON.stringify(content))).toEqual(content);
  });

  it('formats a FeatureCollection from _json2Feature without dropping coordinates', () => {
    const parsed = service._json2Feature({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [10, 20] },
      properties: {}
    });
    const features = service._formatGeoJSON(parsed);
    expect(features[0].geometry.coordinates).toEqual([10, 20]);
  });
});
