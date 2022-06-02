// var Evented = require('mapbox-gl/src/util/evented');

// module.exports.videojs = () => {
//   // var evented = new Evented();
//   return {
//     el_: {
//       firstChild: {
//         id: 'video_id'
//       }
//     },
//     on() {},
//     one() {},
//     play() {},
//     pause() {},
//     currentTime() {},
//     getTech() {},
//     mergeOptions() {},
//     registerTech() {}
//   }
// }

const mockVideo = jest.genMockFromModule('video.js');
module.exports = mockVideo;
