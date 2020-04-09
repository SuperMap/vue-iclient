const fs = require('fs-extra');
const path = require('path');

let argv = JSON.parse(process.env['npm_config_argv']);
let origin = argv.original;
let key = origin[1] ? origin[1].replace('-', '') : 'mapboxgl';

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
        result = files.replace( `"types": ["node", "mapbox-gl", "geojson", "leaflet"],`, `"types": ["node", ${key === 'mapboxgl' ? '"mapbox-gl"' : '"leaflet"'}, "geojson"],` );
      }
      fs.writeFile(path.resolve(__dirname, filePath), result, 'utf8', err => {
        if (err) {
          console.log(err);
        }
      });
    });
  } else {
    fs.copy(
      path.resolve(__dirname, `../src/${key}/${fileName}`),
      path.resolve(__dirname, `../${fileName}`),
      err => {
        if (err) throw err;
      }
    );
  }
});

fs.copy(path.resolve(__dirname, `../dist/${key}/`), path.resolve(__dirname, `../dist/`), err => {
  if (err) throw err;
});
