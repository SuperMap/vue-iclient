import sceneEvent from 'vue-iclient-core/types/scene-event';

var bingMapkey = '';
var terrainToken = '';
var sceneTarget = '';

function fetchRequest(url) {
  return fetch(url).then(function (res) {
    return res.json();
  });
}

function getConfig(url) {
  return new Promise((resolve, reject) => {
    let configTokenUrl = url + '/apps/config.rjson';
    fetch(configTokenUrl)
      .then((response) => response.json())
      .then(function (response) {
        if (response && response.commonConfig) {
          let commonConfig = JSON.parse(response.commonConfig);
          if (commonConfig.tiandituKey && commonConfig.tiandituKey !== '') {
            terrainToken = commonConfig.tiandituKey;
          }

          if (commonConfig.bingMapsKey && commonConfig.bingMapsKey !== '') {
            bingMapkey = commonConfig.bingMapsKey;
          }
        }
        resolve([terrainToken, bingMapkey]);
      })
      .catch(function (error) {
        console.log(error);
        reject(new Error('获取地图token配置信息失败'));
      });
  });
}

export function openExistScene(sceneID, viewer, serverUrl, options, target) {
  const rootUrl = serverUrl;
  getConfig(rootUrl).then(() => {
    const url = rootUrl + '/web/scenes/' + sceneID + '.json';
    fetchRequest(url)
      .then(function (response) {
        sceneTarget = target
        openScene(response, viewer, serverUrl, options);
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}
// window.openExistScene = openExistScene;

function openScene(response, viewer, serverUrl, options) {
  let content = JSON.parse(response.content);
  if (content) {
    if (JSON.stringify(content.layers) !== '{}') {
      sceneEvent.setScene(sceneTarget, { viewer, content });
      sceneEvent.triggerLoadEvent(sceneTarget);

      initSkyBox(serverUrl);
      openS3M(content, viewer);
      openImagery(content, viewer, serverUrl, options);
      openMVT(content, viewer);
      openTerrain(content, viewer);

      if (content.layers.sceneAttrState) {
        setSceneAttr(content.layers.sceneAttrState, viewer);
      }
      if (content.layers.particleOptions) {
        setParticle(content.layers.particleOptions, viewer, serverUrl);
      }
      if (content.layers.wmtsLayerOption && Object.keys(content.layers.wmtsLayerOption).length) {
        setWmts(content.layers.wmtsLayerOption, viewer);
      }
    }
    let cameraX = content.camera.position.x;
    let cameraY = content.camera.position.y;
    let cameraZ = content.camera.position.z;
    setTimeout(function () {
      if (
        options.position.destination.x !== null &&
        options.position.orientation &&
        options.position.orientation.pitch !== null
      ) {
        let { heading, roll, pitch } = options.position.orientation;
        heading = window.SuperMap3D.Math.toRadians(heading);
        roll = window.SuperMap3D.Math.toRadians(roll);
        pitch = window.SuperMap3D.Math.toRadians(pitch);
        viewer.scene.camera.setView({
          destination: window.SuperMap3D.Cartesian3.fromDegrees(
            options.position.destination.x,
            options.position.destination.y,
            options.position.destination.z
          ),
          orientation: { heading, pitch, roll }
        });
      } else {
        let pos = new window.SuperMap3D.Cartesian3(cameraX, cameraY, cameraZ);
        let position = !Array.isArray(content.layers) && content.layers.sceneAttrState ? pos : CartesiantoDegrees(pos);
        viewer.scene.camera.setView({
          destination: position,
          orientation: {
            heading: content.camera.heading,
            pitch: content.camera.pitch,
            roll: content.camera.roll
          }
        });
      }
      let shadowValue = content.layers.sceneAttrState && content.layers.sceneAttrState['shadow'];
      if (shadowValue === true) {
        viewer.shadows = true;
        viewer.pcss = true;
        viewer.shadowQuality = 0;
        viewer.scene.shadowMap.maximumDistance = 2000;
        viewer.shadowMap.darkness = 0.4;
        viewer.shadowMap.penumbraRatio = 0.1;
        let layers = viewer.scene.layers.layerQueue;
        for (var i = 0; i < layers.length; i++) {
          layers[i].shadowType = 2;
        }
      }

      if (content.layers.layerStyleOptions) {
        setLayerStyle(content.layers.layerStyleOptions, viewer);
      }
    }, 3000);
  } else if (response.url) {
    let realspaceUrl = response.url;
    let index = realspaceUrl.indexOf('/scenes');
    realspaceUrl = realspaceUrl.substring(0, index);
    viewer.scene.open(realspaceUrl);
  }
}

function CartesiantoDegrees(Cartesians) {
  var ellipsoid = new window.SuperMap3D.Ellipsoid(6378137.0, 6378137.0, 6378137.0);
  let cartographic = window.SuperMap3D.Cartographic.fromCartesian(Cartesians, ellipsoid);
  let longitude = Number(window.SuperMap3D.Math.toDegrees(cartographic.longitude));
  let latitude = Number(window.SuperMap3D.Math.toDegrees(cartographic.latitude));
  let h = Number(cartographic.height);
  return window.SuperMap3D.Cartesian3.fromDegrees(longitude, latitude, h);
}
function openS3M(content, viewer) {
  if (Array.isArray(content.layers)) {
    content.layers.forEach((item) => {
      if (item.type === 'S3M') {
        let url = item.url;
        let name = item.name;
        viewer.scene.addS3MTilesLayerByScp(url, { name: name });
      }
    });
    return;
  }
  let s3mlayer = content.layers.s3mLayer;
  if (s3mlayer.length > 0) {
    for (let t = 0; t < s3mlayer.length; t++) {
      let url = content.layers.s3mLayer[t].url;
      let name = content.layers.s3mLayer[t].name;
      let promise = viewer.scene.addS3MTilesLayerByScp(url, { name: name });
      const target = sceneTarget;
      window.SuperMap3D.when(promise, function () {
        sceneEvent.triggerUpdateEvent(target);
      });
    }
  }
}

export function openTianditu(viewer, token, type, label) {
  viewer.imageryLayers.removeAll(true);
  const labelMap = {
    vec_w: 'cva_w',
    vec_c: 'cva_c',
    ter_w: 'cta_w',
    ter_c: 'cta_c',
    img_w: 'cia_w',
    img_c: 'cia_c'
  };
  viewer.imageryLayers.addImageryProvider(new window.SuperMap3D.TiandituImageryProvider({
    token: token,
    mapStyle: type
  }));
  if (label) {
    viewer.imageryLayers.addImageryProvider(new window.SuperMap3D.TiandituImageryProvider({
      token: token,
      mapStyle: labelMap[type]
    }));
  }
}

function openImagery(content, viewer, serverUrl, options) {
  let imageryLayer = content.layers.imageryLayer;
  if (options.tiandituOptions) {
    const { type, label, token } = options.tiandituOptions;
    openTianditu(viewer, token, type, label);
    return;
  }
  if (!imageryLayer) {
    return;
  }
  let imageryProvider;
  if (imageryLayer.length > 0) {
    for (let i = 0; i < imageryLayer.length; i++) {
      let url = content.layers.imageryLayer[i].url;
      let flag = checkImageryRepeat(url, viewer);
      if (!flag && imageryLayer[i].type) {
        let imageryType = content.layers.imageryLayer[i].type;
        switch (imageryType) {
          case 'BingMapsImageryProvider':
            imageryProvider = new window.SuperMap3D.BingMapsImageryProvider({
              url: content.layers.imageryLayer[i].url,
              key: bingMapkey
            });
            break;
          case 'TiandituImageryProvider':
            imageryProvider = new window.SuperMap3D.TiandituImageryProvider({
              url: content.layers.imageryLayer[i].url,
              token: terrainToken
            });
            break;
          case 'SingleTileImageryProvider':
            imageryProvider = new window.SuperMap3D.SingleTileImageryProvider({
              url: serverUrl + '/apps/earth/v2/' + content.layers.imageryLayer[i].url
            });
            break;
          case 'UrlTemplateImageryProvider':
            imageryProvider = new window.SuperMap3D.UrlTemplateImageryProvider({
              url: content.layers.imageryLayer[i].url
            });
            break;
          case 'SuperMapImageryProvider':
            imageryProvider = new window.SuperMap3D.SuperMapImageryProvider({
              url: content.layers.imageryLayer[i].url
            });
            break;
          case 'GRIDIMAGERY':
            imageryProvider = new window.SuperMap3D.TileCoordinatesImageryProvider();
            break;
          default:
            break;
        }
        viewer.imageryLayers.addImageryProvider(imageryProvider);
        sceneEvent.triggerUpdateEvent(sceneTarget);
      }
    }
  }
}

function openMVT(content, viewer) {
  let MVTLayerUrlList = content.layers.MVTLayer;
  if (!MVTLayerUrlList) {
    return;
  }
  MVTLayerUrlList.forEach((item) => {
    addMvtLayer(item.url, item.name, viewer, 'MVT');
  });
  sceneEvent.triggerUpdateEvent(sceneTarget);
}

function openTerrain(content, viewer) {
  viewer.terrainProvider = new window.SuperMap3D.EllipsoidTerrainProvider();
  let terrainLayer = content.layers.terrainLayer;
  if (!terrainLayer) {
    return;
  }
  if (terrainLayer.length > 0) {
    let terrainType = content.layers.terrainLayer[0].type;
    switch (terrainType) {
      case 'StkTerrain':
        let isSctFlag = true;
        // if(content.layers.terrainLayer[0].url.indexOf('8090') != -1) isSctFlag = true;
        if (content.layers.terrainLayer[0].url.indexOf('/info/') !== -1) isSctFlag = false;
        viewer.terrainProvider = new window.SuperMap3D.SuperMapTerrainProvider({
          url: content.layers.terrainLayer[0].url,
          isSct: isSctFlag
        });
        break;
      case 'tianDiTuTerrain':
        viewer.terrainProvider = new window.SuperMap3D.TiandituTerrainProvider({
          token: terrainToken
        });
        break;
      case 'supermapOnlineTerrain':
        viewer.terrainProvider = new window.SuperMap3D.SCTTerrainProvider({
          urls: [content.layers.terrainLayer[0].url]
        });
        break;
    }
    sceneEvent.triggerUpdateEvent(sceneTarget);
  }
}

function setSceneAttr(sceneAttrState, viewer) {
  for (let key in sceneAttrState) {
    sceneAttrSwitch(key, sceneAttrState[key], viewer);
  }
}

function sceneAttrSwitch(key, value, viewer) {
  switch (key) {
    case 'atomsphereRender':
      viewer.scene.skyAtmosphere.show = value;
      break;
    case 'depthInspection':
      viewer.scene.globe.depthTestAgainstTerrain = value;
      break;
    case 'displayFrame':
      viewer.scene.debugShowFramesPerSecond = value;
      break;
    case 'earthShow':
      viewer.scene.globe.show = value;
      break;
    case 'fogEffect':
      viewer.scene.fog.enabled = value;
      break;
    case 'shadow':
      if (value) {
        viewer.shadows = true;
        viewer.pcss = true;
        viewer.shadowQuality = 0;
        viewer.scene.shadowMap.maximumDistance = 2000;
        viewer.shadowMap.darkness = 0.4;
        viewer.shadowMap.penumbraRatio = 0.1;
        let layers = viewer.scene.layers.layerQueue;
        for (var i = 0; i < layers.length; i++) {
          layers[i].shadowType = 2;
        }
      } else {
        viewer.shadows = false;
      }
      break;
    case 'sunShow':
      viewer.scene.globe.enableLighting = value;
      break;
    case 'timeAxis':
      let timeline = document.getElementsByClassName('supermap3d-viewer-timelineContainer')[0];

      if (value) {
        timeline.style.visibility = 'visible';
        timeline.style['z-index'] = 99999999999;
      } else {
        timeline.style.visibility = 'hidden';
      }
      break;
    case 'cloudLayer':
      if (value) {
        viewer.scene.cloudBox = window.cloudBox;
      } else {
        viewer.scene.cloudBox = null;
      }
      break;
    case 'skyBoxShow':
      setSkyBox(value, viewer);
      break;
    case 'brightness':
      viewer.scene.colorCorrection.show = true;
      viewer.scene.colorCorrection.brightness = value;
      break;
    case 'contrast':
      viewer.scene.colorCorrection.show = true;
      viewer.scene.colorCorrection.contrast = value;
      break;
    case 'hue':
      viewer.scene.colorCorrection.show = true;
      viewer.scene.colorCorrection.hue = value;
      break;
    case 'saturation':
      viewer.scene.colorCorrection.show = true;
      viewer.scene.colorCorrection.saturation = value;
      break;
    case 'surfaceTransparency':
      viewer.scene.globe.globeAlpha = value;
      break;
  }
}

function initSkyBox(serverUrl) {
  let iearthBaseUrl = `${serverUrl}/apps/earth/v2/`;
  let cloudBoxUrl = iearthBaseUrl + './images/sceneProperties/clouds/clouds1.png';
  window.cloudBox = new window.SuperMap3D.CloudBox({ url: cloudBoxUrl });
  let bluesky = {
    positiveX: iearthBaseUrl + './images/sceneProperties/bluesky/kloofendal_48d_partly_cloudy_puresky_8k_4.right.jpg',
    negativeX: iearthBaseUrl + './images/sceneProperties/bluesky/kloofendal_48d_partly_cloudy_puresky_8k_4.left.jpg',
    positiveY: iearthBaseUrl + './images/sceneProperties/bluesky/kloofendal_48d_partly_cloudy_puresky_8k_4.front.jpg',
    negativeY: iearthBaseUrl + './images/sceneProperties/bluesky/kloofendal_48d_partly_cloudy_puresky_8k_4.back.jpg',
    positiveZ: iearthBaseUrl + './images/sceneProperties/bluesky/kloofendal_48d_partly_cloudy_puresky_8k_4.top.jpg',
    negativeZ: iearthBaseUrl + './images/sceneProperties/bluesky/kloofendal_48d_partly_cloudy_puresky_8k_4.bottom.jpg'
  };
  window.skybox = new window.SuperMap3D.SkyBox({ sources: bluesky });
  window.skybox.USpeed = 0; 
  window.skybox.VSpeed = 0; 
  window.skybox.WSpeed = 0;
}

function setSkyBox(skyBoxShow, viewer) {
  let defaultSkybox = viewer.scene.skyBox;
  let watchCameraHeightFn = watchCameraHeight.bind(this, viewer);
  if (skyBoxShow) {
    let cameraHeight = viewer.scene.camera.positionCartographic.height;
    viewer.scene.postRender.addEventListener(watchCameraHeightFn);
    viewer.scene.skyBox = window.skybox;
    if (cameraHeight < 22e4) {
      viewer.scene.skyBox.show = true;
      viewer.scene.skyAtmosphere.show = false;
    } else {
      viewer.scene.skyAtmosphere.show = true;
    }
  } else {
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.skyBox.show = false;
    viewer.scene.skyBox = defaultSkybox;
    viewer.scene.postRender.removeEventListener(watchCameraHeightFn);
  }
}

function watchCameraHeight(viewer, skyBoxShow) {
  if (skyBoxShow) {
    let cameraHeight = viewer.scene.camera.positionCartographic.height;
    if (cameraHeight > 22e4) {
      viewer.scene.skyBox.show = false;
      viewer.scene.skyAtmosphere.show = true;
    } else {
      viewer.scene.skyBox.show = true;
      viewer.scene.skyAtmosphere.show = false;
    }
  }
}

function setParticle(particleOptions, viewer, serverUrl) {
  if (particleOptions['fire'] != null) {
    let fireOption = particleOptions['fire'];
    addParticleFile(viewer, serverUrl, fireOption, 'fire');
  }
  if (particleOptions['water'] != null) {
    let waterOption = particleOptions['water'];
    addParticleFile(viewer, serverUrl, waterOption, 'water');
  }
  if (particleOptions['fireWork'] != null) {
    let fireWorkOption = particleOptions['fireWork'];
    addFireWork(viewer, serverUrl, fireWorkOption);
  }
}
function setWmts(wmtsLayerOption, viewer) {
  let rectangle = wmtsLayerOption.rectangle;
  let wmtsLayer = viewer.imageryLayers.addImageryProvider(new window.SuperMap3D.WebMapTileServiceImageryProvider({
    url: wmtsLayerOption.wmtsLayerUrl,
    style: 'default',
    format: 'image/png',
    layer: wmtsLayerOption.layerName,
    tileMatrixSetID: wmtsLayerOption.tileMatrixSetID,
    tilingScheme: new window.SuperMap3D.GeographicTilingScheme({
      rectangle: window.SuperMap3D.Rectangle.fromDegrees(rectangle[0], rectangle[1], rectangle[2], rectangle[3]),
      // ellipsoid: SuperMap3D.Ellipsoid.WGS84,
      // numberOfLevelZeroTilesX: 1,
      // numberOfLevelZeroTilesY: 1,
      scaleDenominators: wmtsLayerOption.scaleDenominatorsList,
      customDPI: new window.SuperMap3D.Cartesian2(90.7142857142857, 90.7142857142857)
    })
  }));
  // wmtsLayer.alpha = 0.5;
  viewer.flyTo(wmtsLayer);
}
function addParticleFile(viewer, serverUrl, options, type) {
  let modelMatrixFire = new window.SuperMap3D.Matrix4();
  window.SuperMap3D.Transforms.eastNorthUpToFixedFrame(options.particlePosition, undefined, modelMatrixFire);
  loadParticleFile(
    serverUrl + '/apps/earth/v2/' + options.particleUrl.replace('./', ''),
    modelMatrixFire,
    viewer,
    serverUrl,
    type,
    options.particleAttr
  );
}
function loadParticleFile(url, modelMatrix, viewer, serverUrl, type, option) {
  let particle = {};
  let scene = viewer.scene;
  fetchRequest(url)
    .then(function (data) {
      let iearthBaseUrl = `${serverUrl}/apps/earth/v2/`;
      data['texture']['url'] = data['texture']['url'].replace('./Resource', iearthBaseUrl + 'Resource');
      window.SuperMap3D.ParticleHelper.fromJson(data, scene).then(function (particleSystem) {
        particle = particleSystem;
        particle.modelMatrix = modelMatrix;
        if (option) {
          for (let key in option) {
            switch (key) {
              case 'emitRate':
                particle['emitRate'] = Number(option[key]);
                break;
              case 'minLifeTime':
                particle['minLifeTime'] = Number(option[key]);
                break;
              case 'maxLifeTime':
                particle['maxLifeTime'] = Number(option[key]);
                break;
              case 'minEmitPower':
                particle['minEmitPower'] = Number(option[key]);
                break;
              case 'maxEmitPower':
                particle['maxEmitPower'] = Number(option[key]);
                break;
              case 'minSize':
                particle['minSize'] = Number(option[key]);
                break;
              case 'maxSize':
                particle['maxSize'] = Number(option[key]);
                break;
              case 'minScaleX':
                particle['minScaleX'] = Number(option[key]);
                break;
              case 'minScaleY':
                particle['minScaleY'] = Number(option[key]);
                break;
              case 'maxScaleX':
                particle['maxScaleX'] = Number(option[key]);
                break;
              case 'maxScaleY':
                particle['maxScaleY'] = Number(option[key]);
                break;
              case 'gravity':
                particle.gravity = new window.SuperMap3D.Cartesian3(0, 0, Number(option[key]));
                break;
              case 'emitType':
                switch (option[key]) {
                  case 'Cone':
                    particle.createConeEmitter(1.0, 1.05);
                    break;
                  case 'Sphere':
                    particle.createSphereEmitter(1.0);
                    break;
                  case 'Box':
                    let direction1 = new window.SuperMap3D.Cartesian3(-1, 1, 1);
                    let direction2 = new window.SuperMap3D.Cartesian3(1, 1, -1);
                    let minBox = new window.SuperMap3D.Cartesian3(-10, 0, -10);
                    let maxBox = new window.SuperMap3D.Cartesian3(10, 0, 10);
                    particle.createBoxEmitter(direction1, direction2, minBox, maxBox);
                    break;
                }
                break;
              default:
                break;
            }
          }
        }
      });
    })
    .catch(function (error) {
      console.log(error);
    });
}

function addFireWork(viewer, serverUrl, fireWorkOption) {
  let modelMatrix = new window.SuperMap3D.Matrix4();
  let setIntervalList = [];
  let scene = viewer.scene;
  // scene.skyAtmosphere = new window.SuperMap3D.SkyAtmosphere();
  // scene.globe.show = false
  // scene.skyAtmosphere.show = false;
  let iearthBaseUrl = `${serverUrl}/apps/earth/v2/`;
  let sparkOneUrl = iearthBaseUrl + 'Resource/particle/babylon/sparkGravityOne.json';
  let sparkTwoUrl = iearthBaseUrl + 'Resource/particle/babylon/sparkGravityTwo.json';
  let sparkThreeUrl = iearthBaseUrl + 'Resource/particle/babylon/sparkGravityThree.json';
  let sparkFourUrl = iearthBaseUrl + 'Resource/particle/babylon/sparkGravityFour.json';

  let numberOfSparks = 8;
  let xMin = -2100.0;
  let xMax = 300.0;
  let yMin = 0.0;
  let yMax = 2000.0;
  let zMin = 150.0;
  let zMax = 550.0;
  let sparkInterval = (xMax - xMin) / numberOfSparks;

  function createSpark(serverUrl) {
    for (let i = 0; i < numberOfSparks; ++i) {
      let x = window.SuperMap3D.Math.randomBetween(xMin + i * sparkInterval, xMin + (i + 1) * sparkInterval);
      let y = window.SuperMap3D.Math.randomBetween(yMin, yMax);
      let z = window.SuperMap3D.Math.randomBetween(zMin, zMax);
      let offset = new window.SuperMap3D.Cartesian3(x, y, z);
      let url = '';
      if (i % 4 === 0) {
        url = sparkOneUrl;
      }
      if (i % 4 === 1) {
        url = sparkTwoUrl;
      }
      if (i % 4 === 2) {
        url = sparkThreeUrl;
      }
      if (i % 4 === 3) {
        url = sparkFourUrl;
      }
      fetchRequest(url)
        .then(function (data) {
          let iearthBaseUrl = `${serverUrl}/apps/earth/v2/`;
          data['texture']['url'] = data['texture']['url'].replace('./Resource', iearthBaseUrl + 'Resource');
          window.SuperMap3D.ParticleHelper.fromJson(data, scene).then(function (particleSystem) {
            settingParticleSys(particleSystem, offset, i);
          });
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }

  function settingParticleSys(particleSystem, offset, index) {
    particleSystem.modelMatrix = modelMatrix;
    particleSystem.worldOffset.x = offset.x;
    particleSystem.worldOffset.y = offset.y;
    particleSystem.worldOffset.z = offset.z;
    let setIntervalFlag = setInterval(() => {
      particleSystem.start();
    }, 2000 + index * 50);
    scene.primitives.add(particleSystem);
    setIntervalList.push(setIntervalFlag);
  }

  function addSpark(centerPosition) {
    window.SuperMap3D.Transforms.eastNorthUpToFixedFrame(centerPosition, undefined, modelMatrix);
    createSpark();
  }

  addSpark(fireWorkOption.fireWorkPosition);
}

function setLayerStyle(layerStyleOptions, viewer) {
  let keys = Object.keys(layerStyleOptions);
  for (let i = 0; i < keys.length; i++) {
    let layerName = keys[i];
    let layerStyleOption = layerStyleOptions[layerName];
    let currentLayer = viewer.scene.layers.find(layerName);
    if (!currentLayer) return;
    for (let key in layerStyleOption) {
      let lineColor = layerStyleOption['lineColor'];
      layerStyleSwitch(currentLayer, key, layerStyleOption[key], lineColor);
    }
  }
}

function layerStyleSwitch(currentLayer, key, value, lineColor) {
  switch (key) {
    case 'foreColor':
      currentLayer.style3D.fillForeColor = window.SuperMap3D.Color.fromCssColorString(value);
      break;
    case 'lineColor':
      currentLayer.style3D.lineColor = window.SuperMap3D.Color.fromCssColorString(value);
      break;
    case 'selectedColor':
      currentLayer.selectedColor = window.SuperMap3D.Color.fromCssColorString(value);
      break;
    case 'layerTrans':
      currentLayer.style3D.fillForeColor.alpha = Number(value);
      break;
    case 'selectColorMode':
      currentLayer.selectColorType = value;
      break;
    case 'bottomAltitude':
      currentLayer.style3D.bottomAltitude = Number(value);
      currentLayer.refresh();
      break;
    case 'fillStyle':
      if (currentLayer) {
        switch (value) {
          case 0:
            currentLayer.style3D.fillStyle = window.SuperMap3D.FillStyle.Fill;
            break;
          case 1:
            currentLayer.style3D.fillStyle = window.SuperMap3D.FillStyle.WireFrame;
            currentLayer.style3D.lineColor = window.SuperMap3D.Color.fromCssColorString(lineColor);
            break;
          case 2:
            currentLayer.style3D.fillStyle = window.SuperMap3D.FillStyle.Fill_And_WireFrame;
            currentLayer.style3D.lineColor = window.SuperMap3D.Color.fromCssColorString(lineColor);
            break;
          default:
            break;
        }
        currentLayer.refresh();
      }
      break;
    default:
      break;
  }
}

function addMvtLayer(LayerURL, name, viewer, type) {
  let mvtMap = viewer.scene.addVectorTilesMap({
    url: LayerURL,
    canvasWidth: 512,
    name: name || 'mvt',
    viewer: viewer
  });

  window.SuperMap3D.when(mvtMap.readyPromise, function (data) {
    var bounds = mvtMap.rectangle;
    viewer.scene.camera.flyTo({
      destination: new window.SuperMap3D.Cartesian3.fromRadians(
        (bounds.east + bounds.west) * 0.5,
        (bounds.north + bounds.south) * 0.5,
        10000
      ),
      duration: 0,
      orientation: {
        heading: 0,
        roll: 0
      }
    });
  });
}

function checkImageryRepeat(url, viewer) {
  // viewer.imageryLayers._layers.find
  let length = viewer.imageryLayers._layers.length;
  for (let i = 0; i < length; i++) {
    let imageryLayer = viewer.imageryLayers._layers[i];
    if (imageryLayer._imageryProvider.url) {
      let imgUrl = imageryLayer._imageryProvider.url;
      // if(imgUrl===url){
      //   return true;
      // }
      return imgUrl === url;
    }
  }
}
