const fs = require('fs');

const path = './static/libs/iclient-mapboxgl/iclient-mapboxgl.min.js';
const data = fs.readFileSync(path, 'utf8');

if (data.includes('function(){try{return G6}catch(e)')) {
  throw new Error('iclient-mapboxgl需要保留g6， 注释掉g6 extrenals手动打包！');
}
if (data.includes('function(){try{return G2}catch(e)')) {
  throw new Error('iclient-mapboxgl需要保留g2， 注释掉g2 extrenals手动打包！');
}
if (data.includes('function(){try{return L7}catch(e)')) {
  throw new Error('iclient-mapboxgl需要保留l7-render， 注释掉l7-render extrenals手动打包！');
}

fs.promises
  .stat(path)
  .then(stats => {
    if (stats.isFile()) {
      if (stats.size < 4 * 1024 * 1024) {
        throw new Error('iclient-mapboxgl包体积过小，请检查g6、g2、l7-render是否被打包进来！');
      }
    } else {
      throw new Error('路径指向的不是一个文件。');
    }
  })
  .catch(error => {
    console.error(error);
  });
