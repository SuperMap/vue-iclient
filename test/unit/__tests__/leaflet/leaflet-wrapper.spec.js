import L from 'leaflet';
import '@leaflet/leaflet-wrapper';

describe('leaflet-wrapper', () => {
  it('addLayer_removeLayer', () => {
    expect(L.Map).not.toBeNull();
    const map = new L.Map('map');
    map.addLayer(L.tileLayer([50.5, 30.5], {radius: 200}));
    expect(map.layersOnMap.length).toBe(1);
    expect(map.layersOnMap[0].name.indexOf('sm-custom')).toBe(0);
    const layer = L.tileLayer([50.5, 30.5], {radius: 200});
    map.addLayer(layer,'test');
    expect(map.layersOnMap.length).toBe(2);
    expect(map.layersOnMap[1].name).toBe('test');
    expect(layer._mapToAdd).not.toBeNull();
    map.removeLayer(layer,'test');
    expect(map.layersOnMap.length).toBe(1);
    expect(layer._mapToAdd).toBeNull();
  });
});
