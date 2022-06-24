class GLTFLoader {
  constructor(manager) {}

  load(url, onLoad, onProgress, onError) {
    const gltf = {
      scene: {
        scale: {
          multiplyScalar: () => jest.fn()
        }
      }
    };
    const xhr = {
      loaded: 5,
      total: 5
    };
    const error = 'load error';
    onLoad(gltf);
    onProgress(xhr);
    onError(error);
  }
}

module.exports = { GLTFLoader };
