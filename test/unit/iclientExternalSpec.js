const fs = require('fs');

const data = fs.readFileSync('./static/libs/iclient-mapboxgl/iclient-mapboxgl.min.js', 'utf8');
if (data.includes('function(){try{return G6}catch(e){return {}}}()')) {
  throw new Error('iclient-mapboxgl需要保留g6， 注释掉g6 extrenals手动打包！');
}
if (data.includes('function(){try{return G2}catch(e){return {}}}()')) {
  throw new Error('iclient-mapboxgl需要保留g2， 注释掉g2 extrenals手动打包！');
}
if (data.includes('function(){try{return L7}catch(e){return {}}}()')) {
  throw new Error('iclient-mapboxgl需要保留l7-render， 注释掉l7-render extrenals手动打包！')
}
