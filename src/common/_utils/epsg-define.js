import Vue from 'vue';
import { getDataType } from './util';

const EpsgDefine = new Vue({
  epsgCodes: {
    'EPSG:3857':
      'PROJCS["WGS 84 / Pseudo-Mercator",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]],PROJECTION["Mercator_1SP"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["X",EAST],AXIS["Y",NORTH],EXTENSION["PROJ4","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"],AUTHORITY["EPSG","3857"]]',
    'EPSG:4326':
      'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],AXIS["Northing", "NORTH"],AXIS["Easting", "EAST"],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]'
  },
  registerProjection(epsgKey, epsgValue) {
    if (getDataType(arguments[0]) === '[object Object]' && arguments.length === 1) {
      this.epsgCodes = Object.assign({}, this.epsgCodes, arguments[0]);
    } else if (epsgKey && epsgValue) {
      this.epsgCodes[epsgKey] = epsgValue;
    }
  },
  getProjection(epsgKey) {
    return this.epsgCodes[epsgKey];
  },
  getAllProjections() {
    return this.epsgCodes;
  }
});

export default EpsgDefine;

export function registerProjection(epsgKey, epsgValue) {
  return EpsgDefine.$options.registerProjection(epsgKey, epsgValue);
}

export function getProjection(epsgKey) {
  return EpsgDefine.$options.getProjection(epsgKey);
}
