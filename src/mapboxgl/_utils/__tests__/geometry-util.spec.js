import { handleMultyPolygon } from '../geometry-util';

describe('geometry-util test', () => {
  beforeAll(() => {});

  it('handleMultyPolygon', done => {
    const features = [{ geometry: { type: 'Polygon', coordinates:[[[1,1],[2,2],[2,1],[1,2],[1,1]],[[1,1],[1,2],[2,2],[2,1],[1,1]], [[1,1],[2,1],[2,2],[1,2],[1,1]]] } }];
    const result = handleMultyPolygon(features);
    expect(result[0].geometry.type).toBe('MultiPolygon');
    done();
  });
  it('handleMultyPolygon not polygon', done => {
    const features = [{ geometry: { type: 'point' } }];
    const result = handleMultyPolygon(features);
    expect(result).toBe(features);
    done();
  });

  afterAll(() => {});

});
