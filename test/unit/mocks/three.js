let THREE = {
  Camera() {
    return {
      projectionMatrix: null
    }
  },
  MeshBasicMaterial({color, wireframe}) {

  },
  DirectionalLight() {
    return {
      position: {
        set() {
          return this;
        },
        normalize() {
          return this;
        }
      }
    }
  },
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
      render() {},
      resetState() {}
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
  },
  Box3() {
    return {
      setFromObject: () => {
        return {
          getSize: () => {
            return {
              x: 1,
              y: 2,
              z: 3
            }
          }
        }
      }
    }
  }
};

module.exports.THREE = THREE;
