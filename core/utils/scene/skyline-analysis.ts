import { DrawHandler } from './draw-handler';
/**
 * 天际线分析配置。
 */

export interface SkylineAnalysisOptions {
  /** 是否忽略地球表面参与分析。 */
  ignoreGlobe?: boolean;
  /** 观察点位置，格式为 [lng, lat, height]。 */
  viewPosition?: [number, number, number];
  /** 俯仰角。 */
  pitch?: number;
  /** 朝向角。 */
  direction?: number;
  /** 分析半径。 */
  radius?: number;
  /** 天际线线宽。 */
  lineWidth?: number;
  /** 天际线颜色。 */
  color?: string;
  /** 显示样式。 */
  displayStyle?: number;
  /** 天际线体颜色。 */
  skyBodyColor?: any;
  /** 障碍物高亮颜色。 */
  barrierColor?: any;
  /** 是否高亮障碍物。 */
  highlightBarrier?: boolean;
  /** 天际线体分析服务地址。 */
  skylineSpatialUrl?: string;
}

interface Cartographic {
  longitude: number;
  latitude: number;
  height: number;
}



/**
 * 天际线分析工具，支持执行分析、绘制观察点和限高体，并展示二维天际线图表。
 */
export class SkylineAnalysis {
  viewer: any;
  s3mInstance: any;
  skyline: any;
  skyBodyColor: any;
  barrierColor: any;
  highlightBarrier: boolean;
  skylineMode: string;
  skylineSpatialUrl: string;
  drawHandler: any;
  chart: any;
  private _resizeObserver: ResizeObserver | undefined;
  private _cameraStartEvent: () => void;
  private _cameraEvent: () => void;
  private _cameraEventEnabled: boolean = false;

  /**
   * 创建天际线分析实例。
   * @param viewer 已初始化的场景视图实例。
   * @param options 分析和展示相关的可选配置。
   */
  constructor(viewer: any, options?: SkylineAnalysisOptions) {
    this.viewer = viewer;
    // 绑定相机事件处理方法
    this._cameraStartEvent = this._onCameraMoveStart.bind(this);
    this._cameraEvent = this._onCameraMoveEnd.bind(this);
    this.initSkyline(viewer);
    this.updateOptionsParams(options);
    this.startCameraEventListener();
  }

  /**
   * 初始化分析相关对象
   */
  private initSkyline(viewer: any): void {
    this.s3mInstance = new window.SuperMap3D.S3MInstanceCollection(viewer.scene._context);
    viewer.scene.primitives.add(this.s3mInstance);
    this.skyline = new window.SuperMap3D.Skyline(viewer.scene);
    this.skyline.ignoreGlobe = true; // 地球表面不参与分析
    this.skyline.viewPosition = [0, 0, 0];
    this.skyline.pitch = 0;
    this.skyline.direction = 0;
    this.skyline.radius = 10000;
    this.skyline.color = window.SuperMap3D.Color.fromCssColorString('rgb(200, 0, 0, 1.0)');
    this.skyline.displayStyle = 0;
    this.skyline.lineWidth = 2;
    this.skyBodyColor = window.SuperMap3D.Color.fromCssColorString('rgba(44,149,197,0.6)'); // 天际体颜色
    this.barrierColor = window.SuperMap3D.Color.fromCssColorString('rgba(255, 186, 1, 1)'); // 障碍物颜色
    this.highlightBarrier = false; // 是否显示高亮障碍物
    this.skylineMode = 'LINE';
    this.skylineSpatialUrl =
      'https://www.supermapol.com/realspace/services/spatialAnalysis-data_all/restjsr/spatialanalyst/geometry/3d/skylinesectorbody.json';
  }

  /**
   * 更新可配置的内部参数
   * @param options 配置项
   */
  updateOptionsParams(options?: SkylineAnalysisOptions): void {
    if (!options) return;
    const SuperMap3D = window.SuperMap3D;
    if (SuperMap3D.defined(options.ignoreGlobe)) this.skyline!.ignoreGlobe = options.ignoreGlobe!;
    if (SuperMap3D.defined(options.viewPosition))
      this.skyline!.viewPosition = options.viewPosition!;
    if (SuperMap3D.defined(options.pitch)) this.skyline!.pitch = options.pitch!;
    if (SuperMap3D.defined(options.direction)) this.skyline!.direction = options.direction!;
    if (SuperMap3D.defined(options.radius)) this.skyline!.radius = options.radius!;
    if (SuperMap3D.defined(options.lineWidth)) this.skyline!.lineWidth = options.lineWidth!;
    if (SuperMap3D.defined(options.color))
      this.skyline!.color = window.SuperMap3D.Color.fromCssColorString(options.color);
    if (SuperMap3D.defined(options.displayStyle))
      this.skyline!.displayStyle = options.displayStyle!;
    if (SuperMap3D.defined(options.skyBodyColor)) this.skyBodyColor = options.skyBodyColor;
    if (SuperMap3D.defined(options.barrierColor)) this.barrierColor = options.barrierColor;
    if (SuperMap3D.defined(options.highlightBarrier))
      this.highlightBarrier = options.highlightBarrier!;
    if (SuperMap3D.defined(options.skylineSpatialUrl))
      this.skylineSpatialUrl = options.skylineSpatialUrl!;
  }

  /**
   * 执行天际线分析。
   * @param cartographic 相机位置，默认使用当前相机位置。
   */
  excute(cartographic = this.viewer?.scene.camera.positionCartographic): void {
    this.clear();
    const lon = window.SuperMap3D.Math.toDegrees(cartographic.longitude);
    const lat = window.SuperMap3D.Math.toDegrees(cartographic.latitude);
    const hei = cartographic.height;
    const observerObj: SkylineAnalysisOptions = {
      viewPosition: [lon, lat, hei],
      pitch: window.SuperMap3D.Math.toDegrees(this.viewer.scene.camera.pitch),
      direction: window.SuperMap3D.Math.toDegrees(this.viewer.scene.camera.heading)
    };
    this.updateOptionsParams(observerObj);
    this.skyline!.build();
    if (this.skylineMode === 'BODY') setTimeout(() => this.setSkyLineBody(), 500);
    if (this.highlightBarrier) setTimeout(() => this.setBarrierColor(this.barrierColor), 500);
    this._cameraEventEnabled = true;
  }

  /**
   * 设置天际线分析模式
   * @param type 'LINE' | 'FACE' | 'BODY'
   */
  setSkylineMode(type: 'LINE' | 'FACE' | 'BODY'): void {
    this.skylineMode = type;
    switch (type) {
      case 'LINE':
        this.skyline!.displayStyle = 0;
        this.s3mInstance!.removeCollection('SkyLineBody');
        break;
      case 'FACE':
        this.skyline!.displayStyle = 1;
        this.s3mInstance!.removeCollection('SkyLineBody');
        break;
      case 'BODY':
        this.skyline!.displayStyle = 0;
        this.setSkyLineBody();
        break;
    }
  }

  /**
   * 设置天际线体
   */
  private setSkyLineBody(): void {
    const param = this.skyline!.getSkylineSectorParameter();
    if (!window.SuperMap3D.defined(param)) return;

    const geometrySkylineSectorBodyPostParameter = {
      viewerPoint: param.viewPos,
      line3D: param.geoLine3D,
      height: 0,
      lonlat: true
    };
    const queryData = JSON.stringify(geometrySkylineSectorBodyPostParameter);

    fetch(this.skylineSpatialUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: queryData
    })
      .then(response => response.json())
      .then(result => {
        // 再发送一次GET请求 获取到运算结果
        return fetch(result.newResourceLocation + '.json')
          .then(response => response.json())
          .then(data => {
            if (data.geometry === null) return;
            const uint8Array = new Uint8Array(data.geometry.model);
            const buffer = uint8Array.buffer;
            this.s3mInstance!.add(
              'SkyLineBody',
              {
                id: 1,
                position: window.SuperMap3D.Cartesian3.fromDegrees(
                  data.geometry.position.x,
                  data.geometry.position.y,
                  data.geometry.position.z
                ),
                hpr: new window.SuperMap3D.HeadingPitchRoll(0, 0, 0),
                color: this.skyBodyColor
              },
              buffer,
              false
            );
            data.geometry.model = [4, 0, 0, 0].concat(data.geometry.model);
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        console.log(error);
      });
  }

  /**
   * 设置天际线体颜色
   * @param color 颜色
   */
  setSkyLineBodyColor(color: any): void {
    this.s3mInstance!.getInstance('SkyLineBody', 1).updateColor(color);
  }

  /**
   * 设置障碍物颜色
   * @param color 颜色
   */
  setBarrierColor(color: any): void {
    this.barrierColor = color;
    const ObjectIds = this.skyline!.getObjectIds();
    if (!window.SuperMap3D.defined(ObjectIds)) return;
    const layers = this.viewer.scene.layers._layerQueue;
    for (const index in ObjectIds) {
      layers.forEach(layer => {
        if (layer._id === Number(index)) {
          layer.setObjsColor(ObjectIds[index], color);
        }
      });
    }
  }

  /**
   * 清除障碍物颜色
   */
  clearBarrierColor(): void {
    this.viewer.scene.layers._layerQueue.forEach(layer => {
      layer.removeAllObjsColor();
    });
  }

  private getDrawHandler(): DrawHandler {
    if (!this.drawHandler) {
      this.drawHandler = new DrawHandler(this.viewer);
    }
    return this.drawHandler;
  }

  /**
   * 绘制限高体
   */
  async drawLimitBody() {
    if (!this.skyline) return undefined;
    const drawHandler = this.getDrawHandler();
    this.skyline.removeLimitbody('limitBody');
    const positions_c3 = await drawHandler.startPolygon();
    const posArr = [];
    //再次遍历转化为接口所需的数组格式
    for (let i = 0, len = positions_c3.length; i < len; i++) {
      const cartographic = window.SuperMap3D.Cartographic.fromCartesian(positions_c3[i]);
      const lon = window.SuperMap3D.Math.toDegrees(cartographic.longitude);
      const lat = window.SuperMap3D.Math.toDegrees(cartographic.latitude);
      posArr.push(lon);
      posArr.push(lat);
    }
    //添加限高体对象
    this.addLimitbody(posArr);
  }

  /**
   * 绘制观察点
   * @returns 返回观察位置 [经度, 纬度, 高度]
   */
  async drawViewPoint(): Promise<Cartographic | undefined> {
    const drawHandler = this.getDrawHandler();
    const position = await drawHandler.startPoint();
    if (!position) return undefined;
    const cartographic = window.SuperMap3D.Cartographic.fromCartesian(position);
    const camera = this.viewer.scene.camera;
    const hpr = {
      heading: camera.heading,
      pitch: camera.pitch,
      roll: camera.roll
    };
    position.height += 5;
    camera?.flyTo({
      destination: position,
      orientation: hpr
    });
    return cartographic;
  }

  /**
   * 设置限高体
   * @param position 限高体位置数组 [lon1, lat1, lon2, lat2, ...]（经纬度）
   * @param name 限高体名称，默认为 'limitBody'
   */
  addLimitbody(position: number[], name = 'limitBody'): void {
    //添加限高体对象
    this.skyline.addLimitbody({
      position,
      name
    });
  }

  /**
   * 在指定容器中显示二维天际线图表。
   * @param echarts echarts 实例。
   * @param containerId 图表容器选择器，例如 `#echartsSkyLine`。
   */
  showSkyline2DChart(echarts: any, containerId: string, theme?: 'light' | 'dark'): void {
    const container = document.querySelector(containerId);
    if (!container) {
      console.warn(`Container not found: ${containerId}`);
      return;
    }
    if (!this.skyline) return;
    if (!this.chart) {
      this.chart = echarts.init(container, theme);
      this._resizeObserver = new ResizeObserver(() => {
        this.chart?.resize();
      });
      this._resizeObserver.observe(container);
    }
    const chartData = this.skyline!.getSkyline2D();
    this.chart.setOption(this.buildSkyline2DOption(chartData));
  }

  /**
   * 构造二维天际线图表配置
   * @param chartData 天际线数据 { x: number[], y: number[] }
   */
  buildSkyline2DOption(chartData: { x: number[]; y: number[] }): any {
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (param: any) => {
          const datax = Number(param[0].axisValue);
          const datay = param[0].data;
          return 'X: ' + datax.toFixed(6) + '<br/>Y: ' + datay.toFixed(6);
        }
      },
      grid: {
        top: '20%',
        left: '3%',
        right: '3%',
        bottom: '6%',
        containLabel: true
      },
      axisLabel: {
        // color: '#fff'
      },
      // backgroundColor: '#000817',
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {}
        },
        right: '3%'
        // iconStyle: {
        //   borderColor: '#fff'
        // }
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: chartData.x,
          show: false
        }
      ],
      yAxis: {
        min: (value: any) => (value.min - 0.05).toFixed(2),
        show: true,
        axisLine: {
          show: true
        }
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          filterMode: 'filter',
          start: 0,
          end: 100
        }
      ],
      series: [
        {
          symbolSize: 8,
          symbol: 'circle',
          smooth: true,
          type: 'line',
          data: chartData.y,
          lineStyle: {
            width: 2,
            // shadowColor: 'rgba(145, 146, 148,0.7)',
            shadowBlur: 10,
            shadowOffsetY: 8
          }
        }
      ]
    };
  }

  /**
   * 清除分析
   */
  clear(): void {
    this.skyline!.clear();
    this.clearBarrierColor();
    this.chart?.clear();
    this.s3mInstance!.removeCollection('SkyLineBody');
    this.drawHandler?.clear();
    this._cameraEventEnabled = false;
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stopCameraEventListener();
    this.clear();
    if (this.drawHandler) {
      this.drawHandler.destroy();
      this.drawHandler = undefined;
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = undefined;
    }
    if (this.chart) {
      this.chart.dispose();
      this.chart = undefined;
    }
    this.skyline = undefined;
    this.s3mInstance = undefined;
  }

  /**
   * 开始监听相机事件，自动重绘天际线
   */
  startCameraEventListener(): void {
    if (!this.viewer) return;
    this.viewer.camera.moveStart.addEventListener(this._cameraStartEvent);
    this.viewer.camera.moveEnd.addEventListener(this._cameraEvent);
  }

  /**
   * 停止监听相机事件
   */
  stopCameraEventListener(): void {
    if (!this.viewer) return;
    this.viewer.camera.moveStart.removeEventListener(this._cameraStartEvent);
    this.viewer.camera.moveEnd.removeEventListener(this._cameraEvent);
  }

  /**
   * 相机开始移动事件处理
   */
  private _onCameraMoveStart(): void {
    if (!this._cameraEventEnabled) return;
    this.skyline?.clear();
  }

  /**
   * 相机结束移动事件处理
   */
  private _onCameraMoveEnd(): void {
    if (this.skyline && this._cameraEventEnabled) {
      this.excute();
    }
  }
}
