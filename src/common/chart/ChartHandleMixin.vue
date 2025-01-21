<script>
import { getMultiColorGroup } from 'vue-iclient/src/common/_utils/style/theme/chart';
import cloneDeep from 'lodash.clonedeep';
import merge from 'lodash.merge';
import { getColorWithOpacity, getDecimalsFormatterVal } from 'vue-iclient/src/common/_utils/util';

export default {
  methods: {
    _optionsHandler(options, dataOptions, dataZoomChanged) {
      dataOptions = dataOptions && cloneDeep(dataOptions); // clone 避免引起重复刷新
      options = options && cloneDeep(options); // clone 避免引起重复刷新
      const extraSeries = [];
      if (options && options.legend && !options.legend.type) {
        options.legend.type = 'scroll';
      }
      const yAxis = options.yAxis;
      const xAxis = options.xAxis;
      if (xAxis && dataOptions.xAxis) {
        this.handleAxis(options, dataOptions, xAxis, yAxis);
      }
      if (options && options.series && dataOptions.series) {
        this.handleSeries(dataOptions, options, dataZoomChanged, extraSeries);
      }
      if (options && options.radar && dataOptions.radar) {
        options.radar.indicator = Object.assign({}, dataOptions.radar.indicator || {});
        this._handleRadarAxisLabelFormatter(options);
      }
      const series = dataOptions.series;
      const isRingShine = options.series && options.series[0] && options.series[0].outerGap >= 0;
      if (series && series.length && series[0].type === 'pie') {
        this.setItemStyleColor(false, series);
      }
      if (isRingShine) {
        dataOptions.series = this._createRingShineSeries(series, options.series);
      }
      if (this.highlightOptions && this.highlightOptions.length > 0) {
        if (isRingShine) {
          dataOptions.series = this._createRingShineHighlight(series, this.highlightOptions);
        } else {
          this.setItemStyleColor(true, series);
        }
      }
      const mergeOptions = merge(options, dataOptions);
      if (extraSeries.length > 0) {
        mergeOptions.series.push(...extraSeries);
      }
      return mergeOptions;
    },
    handleAxis(options, dataOptions, xAxis, yAxis) {
      let axis = xAxis;
      const axisData = dataOptions.xAxis[0];
      let type = 'xAxis';
      if (yAxis && yAxis.type === 'category') {
        // 处理条形图
        type = 'yAxis';
        axis = yAxis;
        dataOptions.yAxis = dataOptions.xAxis;
        delete dataOptions.xAxis;
        this._initAxisLabel(yAxis.axisLabel, yAxis.decimals, dataOptions.yAxis[0].data, options.visualMap, dataOptions.series);
        delete options.yAxis.decimals;
      }
      if (dataOptions.series.length === 0) {
        axis = [{}];
      } else if (!Array.isArray(axis)) {
        if (axisData.data && axisData.data.length) {
          axis.data = [];
        }
        axis = [Object.assign({}, axisData, axis)];
      }
      options[type] = axis;
    },
    handleSeries(dataOptions, options, dataZoomChanged, extraSeries) {
      if (dataOptions.series.length === 0) {
        options.series = [];
      } else {
        options.series = options.series.map((element, index) => {
          return Object.assign({}, element, dataOptions.series[index] || {});
        });
        const parallelShowNumber = this.getParallelShowNumber(options.series);
        if (options.series[0].shape === 'cylinder') {
          this.setCylinderXAxis(parallelShowNumber, options);
        }
        this.configureSeries(options, dataOptions, parallelShowNumber, dataZoomChanged, extraSeries);
        // 玫瑰图多个选中
        if (options.series[0].type === 'pie' && options.series[0].roseType) {
          options.series = options.series.map(serie => {
            if (!serie.roseType) {
              serie.roseType = options.series[0].roseType;
            }
            return serie;
          });
        }
        // pie的图例需要一个扇形是一个图例
        if (options.legend && options.series.length > 0 && options.series[0].type === 'pie') {
          options.legend.data = [];
          options.series.forEach(element => {
            if (element.data) {
              options.legend.data.push(
                ...element.data.map(item => {
                  return item.name;
                })
              );
            }
          });
        }
      }
    },
    configureSeries(options, dataOptions, parallelShowNumber, dataZoomChanged, extraSeries) {
      const dataZoom = options.dataZoom && options.dataZoom[0];
      const leftRightCount = parallelShowNumber / 2;
      const baseSpace = 32;
      let seriesSpace = 0;
      let seriesSpaceCount = -Math.floor(leftRightCount);
      let seriesNameTag;
      let colorIndex = 0;
      options.series = options.series.map((serie, index) => {
        if (parallelShowNumber !== 0) {
          const serieName = serie.name.substring(serie.name.indexOf('-') + 1);
          if (!seriesNameTag) {
            seriesNameTag = serieName;
            seriesSpace = this.getSericeSpace(parallelShowNumber, baseSpace, seriesSpaceCount);
          } else {
            if (seriesNameTag === serieName) {
              seriesSpace = this.getSericeSpace(parallelShowNumber, baseSpace, seriesSpaceCount);
            } else {
              seriesSpaceCount = -Math.floor(leftRightCount);
              seriesNameTag = serieName;
              seriesSpace = this.getSericeSpace(parallelShowNumber, baseSpace, seriesSpaceCount);
              colorIndex += 1;
            }
          }
          seriesSpaceCount += 1;
        }
        const label = serie.label && serie.label.normal;
        if (label && !label.smart) {
          serie.label.normal = this._controlLabel(label, serie.maxLabels);
        }
        if (label && label.show && label.smart) {
          this.handleLabel(label, serie, options, dataZoom, dataZoomChanged);
        } else if (serie && serie.type !== 'pie' && serie.type !== 'radar') {
          const colorGroup = getMultiColorGroup(this.colorGroupsData, this.colorNumber);
          if (serie.type === '2.5Bar') {
            const shape = serie.shape;
            const defaultColor = serie.itemStyle && serie.itemStyle.color;
            if (['square', 'rectangle'].includes(shape)) {
              const cubeType = shape;
              serie.type = 'custom';
              dataOptions.series[index] && (dataOptions.series[index].type = 'custom');
              const _this = this;
              serie.renderItem = this._squareRectangleRenderItem(
                seriesSpace,
                defaultColor,
                colorGroup,
                _this,
                cubeType,
                colorIndex
              );
            } else if (shape === 'cylinder') {
              this.handleCylinder(
                parallelShowNumber,
                dataOptions,
                index,
                serie,
                options,
                defaultColor,
                colorGroup,
                extraSeries
              );
            }
            delete serie.shape;
          }
        }
        return serie;
      });
    },
    handleLabel(label, serie, options, dataZoom, dataZoomChanged) {
      label.position = label.position || 'top';
      let data = serie.data || [];
      let startDataIndex = 0;
      let endDataIndex = data.length > 0 ? data.length - 1 : 0;
      if (dataZoom && dataZoom.show !== false) {
        if (dataZoom.start > dataZoom.end) {
          const oldStart = dataZoom.start;
          dataZoom.start = dataZoom.end;
          dataZoom.end = oldStart;
        }
        if (dataZoomChanged) {
          const { startValue, endValue } = this.smChart.chart.getOption().dataZoom[0] || {};
          startDataIndex = startValue;
          endDataIndex = endValue;
          options.dataZoom = options.dataZoom.map(val => {
            if (startValue >= 0 && endValue >= 0) {
              val.startValue = startValue;
              val.endValue = endValue;
              delete val.start;
              delete val.end;
              return val;
            }
            return val;
          });
        } else {
          startDataIndex = Math.floor((dataZoom.start / 100) * data.length);
          endDataIndex = Math.ceil((dataZoom.end / 100) * data.length);
        }
        data = serie.data.slice(startDataIndex, endDataIndex + 1);
      }

      label.formatter = function ({ dataIndex, value }) {
        let result = '';
        if (
          dataIndex === startDataIndex ||
              dataIndex === endDataIndex ||
              Math.max.apply(null, data) + '' === value + ''
        ) {
          result = value;
        }
        return result;
      };
    },
    handleCylinder(parallelShowNumber, dataOptions, index, serie, options, defaultColor, colorGroup, extraSeries) {
      serie.type = 'bar';
      serie.barGap = parallelShowNumber === 0 ? '-100%' : '0';
      if (parallelShowNumber !== 0) {
        const serieColor = defaultColor || colorGroup[Math.ceil((index + 1) / parallelShowNumber) - 1];
        if (serie.itemStyle) {
          serie.itemStyle.color = this.setGradientColor(serieColor, '#fff');
        } else {
          serie.itemStyle = {};
          serie.itemStyle.color = this.setGradientColor(serieColor, '#fff');
        }
      }
      options.tooltip && options.tooltip.trigger === 'axis' && (options.tooltip.trigger = 'item');
      dataOptions.series[index] && (dataOptions.series[index].type = 'bar');
      const colorIndex = parallelShowNumber !== 0 ? Math.ceil((index + 1) / parallelShowNumber) - 1 : index;
      let cirCleColor = defaultColor || colorGroup[colorIndex];
      let cirCleColorFnList = [];
      if (typeof cirCleColor === 'string') {
        cirCleColor = this.setGradientColor(cirCleColor, '#fff');
      }
      if (this.highlightOptions && this.highlightOptions.length > 0) {
        const matchDataList = [];
        this.highlightOptions.forEach(item => {
          if (item.seriesIndex.includes(index)) {
            let color = item.color || this.highlightColor;
            if (typeof color === 'string') {
              color = this.setGradientColor(color, '#fff');
            }
            matchDataList.push({ dataIndex: item.dataIndex, color });
          }
        });
        if (matchDataList.length > 0) {
          cirCleColorFnList = ['topCirCleColorFn', 'bottomCirCleColorFn'].map(() => {
            return ({ dataIndex }) => {
              const matchData = matchDataList.find(item => item.dataIndex === dataIndex);
              return matchData ? matchData.color : cirCleColor;
            };
          });
        }
      }
      this.handleExtraSeries(parallelShowNumber, dataOptions, index, serie, extraSeries, cirCleColor, cirCleColorFnList);
    },
    handleExtraSeries(parallelShowNumber, dataOptions, index, serie, extraSeries, cirCleColor, cirCleColorFnList) {
      const baseColumnWidth = parallelShowNumber !== 0 ? `${100 / parallelShowNumber}%` : '100%';
      const nextSerieDatas = dataOptions.series[index + 1] && dataOptions.series[index + 1].data;
      const offsetDistance = this.getOffsetDistance(parallelShowNumber, index);
      const xAxisIndex = parallelShowNumber !== 0 ? Math.ceil((index + 1) / parallelShowNumber) - 1 : 0;
      serie.xAxisIndex = xAxisIndex;
      extraSeries.push(
        // 头部的圆片
        {
          name: parallelShowNumber !== 0 ? serie.name : '',
          type: 'pictorialBar',
          symbolOffset: parallelShowNumber !== 0 ? [offsetDistance, '-50%'] : [0, -8],
          xAxisIndex: parallelShowNumber !== 0 ? xAxisIndex : 0,
          symbolPosition: 'end',
          z: 12,
          itemStyle: {
            normal: {
              color: cirCleColorFnList[0] || cirCleColor
            }
          },
          data: dataOptions.series[index].data.map((item, dataIndex) => {
            if (parallelShowNumber !== 0) {
              return {
                value: item,
                symbolSize: [baseColumnWidth, 15]
              };
            } else {
              return {
                value: item,
                symbolSize:
                  !nextSerieDatas || (nextSerieDatas[dataIndex] && +item >= +nextSerieDatas[dataIndex])
                    ? [baseColumnWidth, 15]
                    : [0, 15]
              };
            }
          })
        },
        {
          // 底部的圆片
          name: parallelShowNumber !== 0 ? serie.name : '',
          type: 'pictorialBar',
          xAxisIndex: parallelShowNumber !== 0 ? xAxisIndex : 0,
          symbolSize: parallelShowNumber !== 0 ? [baseColumnWidth, 10] : [offsetDistance, 10],
          symbolOffset: parallelShowNumber !== 0 ? [offsetDistance, '50%'] : [0, 5],
          z: 12,
          itemStyle: {
            normal: {
              color: cirCleColorFnList[1] || cirCleColor
            }
          },
          data: dataOptions.series[index].data
        }
      );
    },
    _handleRadarAxisLabelFormatter(options) {
      if (typeof options.radar.decimals === 'number') {
        for (const key in options.radar.indicator) {
          const item = options.radar.indicator[key];
          item.text = getDecimalsFormatterVal(item.text, options.radar.decimals);
        }
        delete options.radar.decimals;
      }
      return options;
    },
    multipleYField(optionSeries) {
      const series = cloneDeep(optionSeries);
      const nameList = series.map(serie => {
        if (!serie.name.includes('-')) {
          return serie.name;
        }
        const position = serie.name.indexOf('-');
        const prefix = serie.name.substring(0, position);
        if (isNaN(+prefix)) {
          return serie.name;
        }
        return serie.name.substring(position + 1);
      });
      return series.length !== new Set(nameList).size;
    },
    getParallelShowNumber(series) {
      if (series.length === 0 || !this.multipleYField(series)) {
        // 0表示不进行并列显示
        return 0;
      }
      let parallelShowNumber = 0;
      const symbolPosition = series[0].name.indexOf('-');
      let firstSeriesName = series[0].name.substring(symbolPosition + 1);
      series.forEach(option => {
        const optionName = option.name.substring(symbolPosition + 1);
        if (firstSeriesName === optionName) {
          parallelShowNumber++;
        }
      });
      return parallelShowNumber;
    },
    _initAxisLabel(axisLabel, decimals, data, visualMap, series) {
      if (!this.xBar) {
        return;
      }
      const sortSeriesIndex = this.datasetOptions.findIndex(item => item.sort !== 'unsort' && item.rankLabel);
      if (sortSeriesIndex > -1 && axisLabel && data) {
        const orderNumLength = data.length.toString().length;
        for (let index = 0, len = data.length, rankIndex = len - 1; index < len; index++, rankIndex--) {
          const paddedNumber = rankIndex.toString().padStart(orderNumLength, '0');
          data[index] = `${paddedNumber}${data[index]}`;
        }
        const firstVisualMap = visualMap && visualMap.find(item => item.seriesIndex === sortSeriesIndex);
        axisLabel.rich = axisLabel.rich || {};
        axisLabel.rich.default = {
          backgroundColor: this.getStringColor(this.colorGroup[sortSeriesIndex]),
          width: 20,
          height: 20,
          align: 'center',
          borderRadius: 2
        };
        firstVisualMap &&
          firstVisualMap.pieces.forEach((item, index) => {
            axisLabel.rich[`color_${index}`] = {
              backgroundColor: item.color,
              width: 20,
              height: 20,
              align: 'center',
              borderRadius: 2
            };
          });
        const serieData = series && series[sortSeriesIndex].data;
        axisLabel.formatter = function (label, index) {
          const orderNum = parseInt(label.slice(0, orderNumLength)) + 1;
          const leftLabel = getDecimalsFormatterVal(label.slice(orderNumLength), decimals);
          const labelValue = serieData && +serieData[index];
          if (firstVisualMap) {
            const matchItemIndex = firstVisualMap.pieces.findIndex(item => {
              let condition = true;
              if (item.min) {
                condition = condition && labelValue >= item.min;
              }
              if (item.max) {
                condition = condition && labelValue <= item.max;
              }
              if (item.lte) {
                condition = condition && labelValue <= item.lte;
              }
              if (item.gte) {
                condition = condition && labelValue >= item.gte;
              }
              if (item.lt) {
                condition = condition && labelValue < item.lt;
              }
              if (item.gt) {
                condition = condition && labelValue > item.gt;
              }
              if (item.value) {
                condition = condition && labelValue === item.value;
              }
              return condition;
            });
            if (matchItemIndex > -1) {
              return [`{color_${matchItemIndex}|${orderNum}}  ${leftLabel}`].join('\n');
            }
          }
          return [`{default|${orderNum}}  ${leftLabel}`].join('\n');
        };
      }
    },
    _createRingShineSeries(series, optionsSeries) {
      if (optionsSeries) {
        this.datasetOptions.forEach((datasetOption, index) => {
          let { type, outerGap, isShine } = optionsSeries[index] || {};
          if (type === 'pie' && outerGap >= 0) {
            const data = series[index].data.map(val => val.value);
            outerGap = outerGap || Math.min.apply(null, data) / 5;
            series[index].data = this._createRingShineDataOption(series[index].data, outerGap, isShine);
            delete optionsSeries[index].outerGap;
            delete optionsSeries[index].isShine;
          }
        });
      }
      return series;
    },
    _createRingShineDataOption(data, outerGap, isShine) {
      if (!data) {
        return;
      }
      const colors = this._handlerColorGroup(data.length);
      const gapItem = {
        value: outerGap,
        name: '',
        itemStyle: {
          normal: {
            label: {
              show: false
            },
            labelLine: {
              show: false
            },
            color: 'rgba(0, 0, 0, 0)',
            borderColor: 'rgba(0, 0, 0, 0)',
            borderWidth: 0
          }
        }
      };
      let result = [];
      for (let i = 0; i < data.length; i++) {
        let dataItem = {
          value: data[i].value,
          name: data[i].name
        };
        if (isShine) {
          dataItem.itemStyle = {
            borderWidth: 5,
            shadowBlur: 10,
            color: colors[i],
            borderColor: colors[i],
            shadowColor: colors[i]
          };
        }
        result.push(dataItem);
        if (data.length > 1) {
          result.push(gapItem);
        }
      }
      return result;
    },
    setCylinderXAxis(parallelShowNumber, options) {
      if (parallelShowNumber === 0) {
        return;
      }
      const xAixsType = options.xAxis[0] && options.xAxis[0].type;
      for (let i = 1; i <= parallelShowNumber; i++) {
        options.xAxis.push({
          type: xAixsType,
          show: false
        });
      }
    },
    getOffsetDistance(parallelShowNumber, index) {
      if (parallelShowNumber === 0) {
        return '100%';
      }
      let distance;
      if (parallelShowNumber % 2) {
        distance = -100 * Math.floor(parallelShowNumber / 2) + (index % parallelShowNumber) * 100;
        return `${distance}%`;
      } else {
        distance = -100 * (Math.floor(parallelShowNumber / 2) - 0.5) + (index % parallelShowNumber) * 100;
      }
      return `${distance}%`;
    },
    _squareRectangleRenderItem(seriesSpace, defaultColor, colorGroup, _this, cubeType, colorIndex) {
      return (params, api) => {
        const location = api.coord([api.value(0), api.value(1)]);
        let fillColor = defaultColor || colorGroup[colorIndex];
        if (_this.highlightOptions && _this.highlightOptions.length > 0) {
          const matchData = _this.highlightOptions.find(
            item => item.seriesIndex.includes(params.seriesIndex) && item.dataIndex === params.dataIndex
          );
          if (matchData && (matchData.color || _this.highlightColor)) {
            fillColor = matchData.color || _this.highlightColor;
          }
        }
        let leftColor, rightColor, topColor;
        if (typeof fillColor === 'object') {
          const copyLeftColor = cloneDeep(fillColor);
          const copyRightColor = cloneDeep(fillColor);
          const copyTopColor = cloneDeep(fillColor);
          copyLeftColor.colorStops[0].color = getColorWithOpacity(copyLeftColor.colorStops[0].color, 0.4);
          copyLeftColor.colorStops[1].color = getColorWithOpacity(copyLeftColor.colorStops[1].color, 0.4);
          copyRightColor.colorStops[0].color = getColorWithOpacity(copyRightColor.colorStops[0].color, 0.7);
          copyRightColor.colorStops[1].color = getColorWithOpacity(copyRightColor.colorStops[1].color, 0.7);
          copyTopColor.colorStops[0].color = getColorWithOpacity(copyTopColor.colorStops[0].color, 0.85);
          copyTopColor.colorStops[1].color = getColorWithOpacity(copyTopColor.colorStops[1].color, 0.85);
          leftColor = copyLeftColor;
          rightColor = copyRightColor;
          topColor = copyTopColor;
        } else {
          leftColor = getColorWithOpacity(fillColor, 0.4);
          rightColor = getColorWithOpacity(fillColor, 0.7);
          topColor = getColorWithOpacity(fillColor, 0.85);
        }
        return {
          type: 'group',
          children: [
            {
              type: `Cube${cubeType}Left`,
              shape: {
                api,
                xValue: api.value(0),
                yValue: api.value(1),
                x: location[0] + seriesSpace,
                y: location[1],
                bottomYAxis: api.coord([api.value(0), 0])[1]
              },
              style: {
                fill: leftColor
              }
            },
            {
              type: `Cube${cubeType}Right`,
              shape: {
                api,
                xValue: api.value(0),
                yValue: api.value(1),
                x: location[0] + seriesSpace,
                y: location[1],
                bottomYAxis: api.coord([api.value(0), 0])[1]
              },
              style: {
                fill: rightColor
              }
            },
            {
              type: `Cube${cubeType}Top`,
              shape: {
                api,
                xValue: api.value(0),
                yValue: api.value(1),
                x: location[0] + seriesSpace,
                y: location[1],
                bottomYAxis: api.coord([api.value(0), 0])[1]
              },
              style: {
                fill: topColor
              }
            }
          ]
        };
      };
    },
    getSericeSpace(sameYFieldSeriesCount, baseSpace, seriesSpaceCount) {
      if (sameYFieldSeriesCount % 2 === 0) {
        return seriesSpaceCount * baseSpace + baseSpace / 2;
      } else {
        return seriesSpaceCount * baseSpace;
      }
    },
    getSameYFieldSeriesCount(series) {
      const firstSeriesName = series[0].name.split('-')[1];
      let seriesCount = 0;
      for (let serie of series) {
        const serieNname = serie.name.split('-')[1];
        if (firstSeriesName === serieNname) {
          seriesCount += 1;
        } else {
          return seriesCount;
        }
      }
      return seriesCount;
    },
    _createRingShineHighlight(series, highlightOptions, color = this.highlightColor) {
      series = series || [];
      series = series.map((serie, seriesIndex) => {
        const dataIndexs = highlightOptions.map(item => {
          if (item.seriesIndex && item.seriesIndex.includes(seriesIndex)) {
            return item.dataIndex;
          }
        });
        const colors = highlightOptions.map(item => {
          if (item.seriesIndex && item.seriesIndex.includes(seriesIndex)) {
            return item.color || color;
          }
        });
        const serieDatas = (serie && serie.data) || [];
        dataIndexs.forEach((dataIndex, index) => {
          serieDatas[dataIndex].itemStyle.color = colors[index];
          serieDatas[dataIndex].itemStyle.borderColor = colors[index];
          serieDatas[dataIndex].itemStyle.shadowColor = colors[index];
        });
        return serie;
      });
      return series;
    },
    getStringColor(color) {
      if (color instanceof Object) {
        return ((color.colorStops || [])[0] || {}).color;
      }
      return color;
    },
    setGradientColor(color, nextColor) {
      if (typeof color === 'string') {
        return new this.$options.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color },
          { offset: 1, color: nextColor || color }
        ]);
      }
      return color;
    }
  }
};
</script>
