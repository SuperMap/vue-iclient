import { registerProjection, getProjection, toEpsgCode } from '../epsg-define';
import proj4 from 'proj4';

describe('epsg-define', () => {
  const projections = {
    'EPSG:2343': `PROJCS["Xian 1980 / Gauss-Kruger CM 105E",GEOGCS["Xian 1980",DATUM["Xian_1980",SPHEROID["IAG 1975",6378140,298.257,AUTHORITY["EPSG","7049"]],AUTHORITY["EPSG","6610"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4610"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",105],PARAMETER["scale_factor",1],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AUTHORITY["EPSG","2343"]]`,
    'EPSG:4548': `PROJCS["China_2000_3_DEGREE_GK_Zone_39N",GEOGCS["GCS_China_2000",DATUM["D_China_2000",SPHEROID["CGCS2000",6378137.0,298.257222101,AUTHORITY["EPSG","7044"]]],PRIMEM["Greenwich",0.0,AUTHORITY["EPSG","8901"]],UNIT["DEGREE",0.017453292519943295],AUTHORITY["EPSG","4490"]],PROJECTION["Transverse_Mercator",AUTHORITY["EPSG","9807"]],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",117.0],PARAMETER["Latitude_Of_Origin",0.0],PARAMETER["Scale_Factor",1.0],UNIT["METER",1.0],AUTHORITY["EPSG","4548"]]`
  };

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('get and register', done => {
    const spy = jest.spyOn(proj4, 'defs');
    registerProjection('EPSG:4548', projections['EPSG:4548']);
    expect(getProjection('EPSG:4548')).not.toBeUndefined();
    expect(spy).toHaveBeenCalledWith('EPSG:4548', projections['EPSG:4548']);
    spy.mockClear();
    registerProjection(projections);
    expect(spy).toHaveBeenCalledWith('EPSG:2343', projections['EPSG:2343']);
    expect(getProjection('EPSG:2343')).not.toBeUndefined();
    spy.mockClear();
    expect(getProjection('EPSG:4490', proj4)).not.toBeUndefined();
    const wkt4490 = 'GEOGCS["China Geodetic Coordinate System 2000", DATUM["China 2000", SPHEROID["CGCS2000", 6378137.0, 298.257222101, AUTHORITY["EPSG","1024"]], AUTHORITY["EPSG","1043"]], PRIMEM["Greenwich", 0.0, AUTHORITY["EPSG","8901"]], UNIT["degree", 0.017453292519943295], AXIS["Geodetic latitude", NORTH], AXIS["Geodetic longitude", EAST], AUTHORITY["EPSG","4490"]]';
    expect(spy).toHaveBeenCalledWith('EPSG:4490', wkt4490);
    spy.mockClear();
    const spyConsoleError = jest.spyOn(console, 'error');
    registerProjection('EPSG:6666');
    expect(spy).toHaveBeenCalledWith('EPSG:6666');
    expect(spyConsoleError).toHaveBeenCalledWith('EPSG:6666 not define');
    done();
  });

  it('toEpsgCode', done => {
    expect(toEpsgCode(projections['EPSG:4548'])).toBe('EPSG:4548');
    expect(toEpsgCode('EPSG:2343')).toBe('EPSG:2343');
    expect(toEpsgCode({})).toBe('');
    done();
  });
});

