import { getColorWithOpacity } from '../../util';
import cloneDeep from 'lodash.clonedeep';

export const handleMultiGradient = (colorGroupsData, dataLength) => {
  let startColors = [];
  let endColors = [];
  let startColorGroups = [];
  let endColorGroups = [];
  let results = [];
  colorGroupsData.forEach(colorInfo => {
    startColors.push(colorInfo.colorStops[0].color);
    endColors.push(colorInfo.colorStops[1].color);
  });
  startColorGroups = SuperMap.ColorsPickerUtil.getGradientColors(startColors, dataLength, 'RANGE');
  endColorGroups = SuperMap.ColorsPickerUtil.getGradientColors(endColors, dataLength, 'RANGE');
  for (let i = 0; i < dataLength; i++) {
    let colorGroupDataCopy = cloneDeep(colorGroupsData[0]);
    colorGroupDataCopy.colorStops = [
      {
        offset: 0,
        color: startColorGroups[i]
      },
      {
        offset: 1,
        color: endColorGroups[i]
      }
    ];
    results.push(colorGroupDataCopy);
  }
  return results;
};

export const getMultiColorGroup = (colorGroup, dataNumber) => {
  let nextColorGroup;
  // 是否需要产生分段颜色值
  if (colorGroup && dataNumber > colorGroup.length && typeof colorGroup[0] === 'object') {
    nextColorGroup = handleMultiGradient(colorGroup, dataNumber);
  } else {
    nextColorGroup = SuperMap.ColorsPickerUtil.getGradientColors(colorGroup, dataNumber, 'RANGE');
  }
  return nextColorGroup;
};

export const chartThemeUtil = (
  background = 'rgba(255, 255, 255, 0.6)',
  textColor = '#333',
  colorGroup = ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad', '#96dee8'],
  dataNumber
) => {
  colorGroup = getMultiColorGroup(colorGroup, dataNumber);
  let chartTheme = {
    color: colorGroup,
    backgroundColor: background,
    textStyle: {},
    title: {
      textStyle: {
        color: textColor
      },
      subtextStyle: {
        color: '#999999'
      }
    },
    line: {
      itemStyle: {
        normal: {
          borderWidth: '2'
        }
      },
      lineStyle: {
        normal: {
          width: '3'
        }
      },
      symbolSize: '8',
      symbol: 'emptyCircle',
      smooth: false
    },
    radar: {
      name: {
        textStyle: {
          color: textColor
        }
      },
      lineStyle: {
        normal: {
          width: '3',
          color: textColor
        }
      },
      splitLine: {
        lineStyle: {
          color: [
            getColorWithOpacity(textColor, 1),
            getColorWithOpacity(textColor, 0.8),
            getColorWithOpacity(textColor, 0.6),
            getColorWithOpacity(textColor, 0.4),
            getColorWithOpacity(textColor, 0.2),
            getColorWithOpacity(textColor, 0.1)
          ]
        }
      },
      axisLine: {
        lineStyle: {
          color: getColorWithOpacity(textColor, 0.3)
        }
      },
      symbolSize: '8',
      symbol: 'emptyCircle',
      smooth: false
      // 'radius': '63%'
    },
    bar: {
      itemStyle: {
        normal: {
          barBorderWidth: 0,
          barBorderColor: '#cccccc'
        },
        emphasis: {
          barBorderWidth: 0,
          barBorderColor: '#cccccc'
        }
      }
    },
    pie: {
      itemStyle: {
        normal: {
          borderWidth: 0,
          borderColor: '#cccccc'
        },
        emphasis: {
          borderWidth: 0,
          borderColor: '#cccccc'
        }
      },
      radius: '63%'
    },
    scatter: {
      itemStyle: {
        normal: {
          borderWidth: 0,
          borderColor: '#cccccc'
        },
        emphasis: {
          borderWidth: 0,
          borderColor: '#cccccc'
        }
      }
    },
    boxplot: {
      itemStyle: {
        normal: {
          borderWidth: 0,
          borderColor: '#cccccc'
        },
        emphasis: {
          borderWidth: 0,
          borderColor: '#cccccc'
        }
      }
    },
    parallel: {
      itemStyle: {
        normal: {
          borderWidth: 0,
          borderColor: '#cccccc'
        },
        emphasis: {
          borderWidth: 0,
          borderColor: '#cccccc'
        }
      }
    },
    sankey: {
      itemStyle: {
        normal: {
          borderWidth: 0,
          borderColor: '#cccccc'
        },
        emphasis: {
          borderWidth: 0,
          borderColor: '#cccccc'
        }
      }
    },
    funnel: {
      itemStyle: {
        normal: {
          borderWidth: 0,
          borderColor: '#cccccc'
        },
        emphasis: {
          borderWidth: 0,
          borderColor: '#cccccc'
        }
      }
    },
    gauge: {
      axisLine: {
        // 坐标轴线
        lineStyle: {
          // 属性lineStyle控制线条样式
          color: [[0.2, colorGroup[0]], [0.8, colorGroup[1]], [1, colorGroup[2]]]
        }
      },
      itemStyle: {
        normal: {
          borderWidth: 0,
          borderColor: '#cccccc'
        },
        emphasis: {
          borderWidth: 0,
          borderColor: '#cccccc'
        }
      }
    },
    candlestick: {
      itemStyle: {
        normal: {
          color: '#e6a0d2',
          color0: 'transparent',
          borderColor: '#e6a0d2',
          borderColor0: '#3fb1e3',
          borderWidth: '2'
        }
      }
    },
    graph: {
      itemStyle: {
        normal: {
          borderWidth: 0,
          borderColor: '#cccccc'
        }
      },
      lineStyle: {
        normal: {
          width: '1',
          color: '#cccccc'
        }
      },
      symbolSize: '8',
      symbol: 'emptyCircle',
      smooth: false,
      color: colorGroup,
      label: {
        normal: {
          textStyle: {
            color: '#ffffff'
          }
        }
      }
    },
    map: {
      itemStyle: {
        normal: {
          areaColor: '#eeeeee',
          borderColor: '#aaaaaa',
          borderWidth: 0.5
        },
        emphasis: {
          areaColor: 'rgba(63,177,227,0.25)',
          borderColor: '#3fb1e3',
          borderWidth: 1
        }
      },
      label: {
        normal: {
          textStyle: {
            color: '#ffffff'
          }
        },
        emphasis: {
          textStyle: {
            color: 'rgb(63,177,227)'
          }
        }
      }
    },
    geo: {
      itemStyle: {
        normal: {
          areaColor: '#eeeeee',
          borderColor: '#aaaaaa',
          borderWidth: 0.5
        },
        emphasis: {
          areaColor: 'rgba(63,177,227,0.25)',
          borderColor: '#3fb1e3',
          borderWidth: 1
        }
      },
      label: {
        normal: {
          textStyle: {
            color: '#ffffff'
          }
        },
        emphasis: {
          textStyle: {
            color: 'rgb(63,177,227)'
          }
        }
      }
    },
    categoryAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: textColor
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: textColor
        }
      },
      axisLabel: {
        show: true,
        rotate: -45,
        interval: 'auto',
        textStyle: {
          color: textColor
        }
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: ['#eeeeee']
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: ['rgba(250,250,250,0.05)', 'rgba(200,200,200,0.02)']
        }
      },
      nameTextStyle: {
        fontSize: 14
      }
    },
    valueAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: textColor
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: textColor
        }
      },
      axisLabel: {
        show: true,
        rotate: 45,
        interval: 'auto',
        textStyle: {
          color: textColor
        }
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: ['#eeeeee']
        }
      },
      splitArea: {
        show: true
        // 'areaStyle': {
        //   'color': [
        //     'rgba(237,237,236,1)',
        //     'rgba(252,252,251,1)'
        //   ]
        // }
      },
      nameTextStyle: {
        fontSize: 14
      }
    },
    logAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: textColor
        }
      },
      axisTick: {
        show: false,
        lineStyle: {
          color: textColor
        }
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: textColor
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [textColor]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: ['rgba(250,250,250,0.05)', 'rgba(200,200,200,0.02)']
        }
      }
    },
    timeAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: textColor
        }
      },
      axisTick: {
        show: false,
        lineStyle: {
          color: textColor
        }
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: textColor
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [textColor]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: ['rgba(250,250,250,0.05)', 'rgba(200,200,200,0.02)']
        }
      }
    },
    toolbox: {
      iconStyle: {
        normal: {
          borderColor: '#999999'
        },
        emphasis: {
          borderColor: '#666666'
        }
      }
    },
    legend: {
      textStyle: {
        color: textColor
      },
      pageTextStyle: {
        color: textColor
      }
    },
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: '#cccccc',
          width: 1
        },
        crossStyle: {
          color: '#cccccc',
          width: 1
        }
      }
    },
    timeline: {
      lineStyle: {
        color: '#626c91',
        width: 1
      },
      itemStyle: {
        normal: {
          color: '#626c91',
          borderWidth: 1
        },
        emphasis: {
          color: '#626c91'
        }
      },
      controlStyle: {
        normal: {
          color: '#626c91',
          borderColor: '#626c91',
          borderWidth: 0.5
        },
        emphasis: {
          color: '#626c91',
          borderColor: '#626c91',
          borderWidth: 0.5
        }
      },
      checkpointStyle: {
        color: '#3fb1e3',
        borderColor: 'rgba(63,177,227,0.15)'
      },
      label: {
        normal: {
          textStyle: {
            color: '#626c91'
          }
        },
        emphasis: {
          textStyle: {
            color: '#626c91'
          }
        }
      }
    },
    visualMap: {
      color: colorGroup
    },
    dataZoom: {
      backgroundColor: 'rgba(255,255,255,0)',
      dataBackgroundColor: 'rgba(222,222,222,1)',
      fillerColor: 'rgba(114,230,212,0.25)',
      handleColor: '#cccccc',
      handleSize: '100%',
      textStyle: {
        color: textColor
      }
    },
    markPoint: {
      label: {
        normal: {
          textStyle: {
            color: textColor
          }
        },
        emphasis: {
          textStyle: {
            color: textColor
          }
        }
      }
    }
  };
  return chartTheme;
};
