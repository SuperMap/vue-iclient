export const FileTypes = {
  EXCEL: 'EXCEL',
  CSV: 'CSV',
  ISERVER: 'ISERVER',
  GEOJSON: 'GEOJSON',
  JSON: 'JSON',
  SHP: 'SHP',
  ZIP: 'ZIP'
};
export const FileConfig = {
  fileMaxSize: 10 * 1024 * 1024
};

export function getFileType(fileName) {
  let regCSV = /^.*\.(?:csv)$/i;
  let regExcel = /^.*\.(?:xls|xlsx)$/i; // 文件名可以带空格
  let regGeojson = /^.*\.(?:geojson|json)$/i;
  let regSHP = /^.*\.(?:shp)$/i;
  if (regExcel.test(fileName)) {
    // 校验不通过
    return FileTypes.EXCEL;
  } else if (regCSV.test(fileName)) {
    return FileTypes.CSV;
  } else if (regGeojson.test(fileName)) {
    return FileTypes.GEOJSON;
  } else if (regSHP.test(fileName)) {
    return FileTypes.SHP;
  }
  return null;
}
