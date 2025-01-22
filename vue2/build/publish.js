const fs = require('fs-extra');
const path = require('path');
const utils = require('./utils');

const key = utils.getMapLibName();

let fileNames = ['package.json', '.npmignore', 'tsconfig.json', 'README.md'];
key === 'leaflet' && fileNames.push('sfc.d.ts');

fileNames.forEach(fileName => {
  if (['tsconfig.json', 'sfc.d.ts'].includes(fileName)) {
    let filePath = fileName === 'tsconfig.json' ? `../${fileName}` : `../src/${fileName}`;
    fs.readFile(path.resolve(__dirname, filePath), 'utf8', (err, files) => {
      if (err) {
        console.log(err);
      }
      let result;
      if (fileName === 'sfc.d.ts' && key === 'leaflet') {
        result = files.replace(`import mapboxglTypes = mapboxgl;`, ``);
      } else {
        const typeOptions = files.match(/(?<="types":(\s|))\[[^\]]+\]/gim)[0];
        if (typeOptions) {
          const typeOptionsArray = JSON.parse(typeOptions);
          const filterItem = key === 'mapboxgl' ? 'leaflet' : 'mapbox-gl';
          const filterOptions = typeOptionsArray.filter(item => {
            return item !== filterItem;
          });
          const filterOptionsStr = JSON.stringify(filterOptions);
          result = files.replace(/(?<="types":(\s|))\[[^\]]+\]/gim, filterOptionsStr);
        }
      }
      fs.writeFile(path.resolve(__dirname, filePath), result, 'utf8', err => {
        if (err) {
          console.log(err);
        }
      });
    });
  } else {
    fs.copy(path.resolve(__dirname, `../src/${key}/${fileName}`), path.resolve(__dirname, `../${fileName}`), err => {
      if (err) throw err;
    });
  }
});

fs.copy(path.resolve(__dirname, `../dist/${key}/`), path.resolve(__dirname, `../dist/`), err => {
  if (err) throw err;
});
fs.copy(path.resolve(__dirname, `../lib/${key}/`), path.resolve(__dirname, `../lib/`), err => {
  if (err) throw err;
});
