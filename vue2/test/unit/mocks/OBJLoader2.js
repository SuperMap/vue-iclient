class OBJLoader2 {
  constructor(manager) {}

  load(url, onLoad, onFileLoadProgress, onError) {
    const object3d = {
      detail: {
        loaderRootNode: {
          scale: {
            multiplyScalar: () => jest.fn()
          }
        }
      },
    };
    const xhr = {
      loaded: 5,
      total: 5
    };
    const error = 'load error';
    onLoad(object3d);
    onFileLoadProgress(xhr);
    onError(error);
  }
}

module.exports = { OBJLoader2 };
