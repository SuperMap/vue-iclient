const fs = require('fs');

const data = fs.readFileSync('./static/libs/iclient-mapboxgl/iclient-mapboxgl.min.js', 'utf8');
const err = new Error('iclient-mapboxgl需要保留g6， 注释掉g6 extrenals手动打包！');
if (data.includes('function(){try{return G6}catch(e){return {}}}()')) {
  throw err;
}
