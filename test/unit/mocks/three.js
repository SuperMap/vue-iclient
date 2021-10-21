let THREE = {
  PerspectiveCamera() {
    return {
      projectionMatrix: {
        elements: null
      }
    };
  },
  Vector3() {},
  Matrix4() {
    return {
      makeRotationAxis() {
        return this;
      },
      fromArray() {
        return this;
      },
      makeTranslation() {
        return this;
      },
      scale() {
        return this;
      },
      multiply() {
        return this;
      }
    };
  },
  Scene() {
    return {
      add() {}
    }
  },
  WebGLRenderer() {
    return {
      state: {
        reset() {}
      },
      render() {}
    };
  },
  Group() {
    return {
      add() {}
    }
  },
  ShaderMaterial() {
    return {
      clone() {
        return {
          needsUpdate: false,
          uniforms: {
            blendPattern: {
              value: null
            }
          }
        }
      }
    };
  },
  PointLight() {
    return {
      position: {
        set() {}
      }
    };
  },
  TextureLoader() {
    return {
      load() {
        return {}
      }
    };
  },
  SphereGeometry() {},
  Mesh() {
    return {
      position: {
        y: 0,
        x: 0,
        z: 0,
        dirX: 0,
        dirY: 0,
        dirZ: 0
      },
      scale: {
        set() {

        }
      },
      material: {
        uniforms: {
          blend: {
            value: null
          }
        }
      },
      rotateX() {},
      rotateZ() {},
      rotateY() {}
    };
  }
};

module.exports.THREE = THREE;