<script setup lang="ts">
import Chart from '../chart.vue'
import Button from '@supermapgis/common/components/button/Button'
import { ref, reactive } from 'vue'
import '@supermapgis/common/components/chart/style'

const chartType = ref('bar')

// 柱状图数据
const barChartData = reactive({
  dataset: {
    maxFeatures: 20
  },
  datasetOptions: [
    {
      seriesType: 'bar'
    }
  ],
  options: {
    yAxis: {
      axisLabel: {
        rotate: 0
      },
      splitArea: {
        show: false
      },
      type: 'value'
    },
    xAxis: {
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLabel: {
        rotate: 0
      },
      type: 'category'
    },
    grid: {
      left: 50,
      right: 50,
      top: 35,
      bottom: 35
    },
    series: [
      {
        data: ['500', '800', '3000', '3617', '3400', '4200', '1842'],
        name: 'Y2',
        stack: 0,
        type: 'bar'
      },
      {
        data: ['200', '500', '5000', '2617', '3330', '1200', '1002'],
        name: 'Y1',
        stack: 0,
        type: 'bar'
      },
      {
        data: ['230', '1000', '2000', '5617', '3330', '1550', '1892'],
        name: 'Y3',
        stack: 0,
        type: 'bar'
      }
    ]
  }
})

// 正方体柱状图
const squareBarData = reactive({
  dataset: {
    maxFeatures: 8,
    type: 'geoJSON',
    geoJSON: {
      type: 'FeatureCollection',
      features: [
        {
          properties: {
            date: '1月',
            sale: 2016,
            target: 6000
          }
        },
        {
          properties: {
            date: '2月',
            sale: 1230,
            target: 6000
          }
        },
        {
          properties: {
            date: '3月',
            sale: 3790,
            target: 6000
          }
        },
        {
          properties: {
            date: '4月',
            sale: 2349,
            target: 6000
          }
        },
        {
          properties: {
            date: '5月',
            sale: 1654,
            target: 6000
          }
        },
        {
          properties: {
            date: '6月',
            sale: 1120,
            target: 6000
          }
        },
        {
          properties: {
            date: '7月',
            sale: 1980,
            target: 6000
          }
        },
        {
          properties: {
            date: '8月',
            sale: 980,
            target: 6000
          }
        },
        {
          properties: {
            date: '9月',
            sale: 1333,
            target: 6000
          }
        },
        {
          properties: {
            date: '10月',
            sale: 2001,
            target: 6000
          }
        },
        {
          properties: {
            date: '11月',
            sale: 1820,
            target: 6000
          }
        },
        {
          properties: {
            date: '12月',
            sale: 3200,
            target: 6000
          }
        }
      ]
    }
  },
  datasetOptions: [
    {
      seriesType: '2.5Bar',
      xField: 'date',
      yField: 'target',
      sort: 'unsort'
    },
    {
      seriesType: '2.5Bar',
      xField: 'date',
      yField: 'sale',
      sort: 'unsort'
    }
  ],
  options: {
    yAxis: {
      axisLabel: {
        rotate: 0
      },
      splitArea: {
        show: false
      },
      type: 'value'
    },
    xAxis: {
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLabel: {
        rotate: 0
      },
      type: 'category'
    },
    grid: {
      left: 50,
      right: 50,
      top: 35,
      bottom: 35
    },
    series: [
      {
        data: [6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000],
        type: '2.5Bar',
        shape: 'square'
      },
      {
        data: [2016, 1230, 3790, 2349, 1654, 1120, 1980, 980, 1333, 2001, 1820, 3200],
        type: '2.5Bar',
        shape: 'square'
      }
    ],
    tooltip: {
      axisPointer: {
        type: 'shadow'
      },
      trigger: 'axis'
    }
  }
})

// 饼图数据
const pieChartData = reactive({
  dataset: {
    maxFeatures: 20
  },
  datasetOptions: [
    {
      seriesType: 'pie'
    }
  ],
  options: {
    grid: {
      left: 50,
      right: 50,
      top: 35,
      bottom: 35
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      show: true,
      top: 'auto',
      left: 'left'
    },
    series: [
      {
        name: 'demo',
        type: 'pie',
        radius: '80%',
        width: 400,
        height: 288,
        data: [
          {
            value: 500,
            name: 'Mon'
          },
          {
            value: 800,
            name: 'Tue'
          },
          {
            value: 3000,
            name: 'Wed'
          },
          {
            value: 3617,
            name: 'Thu'
          },
          {
            value: 3400,
            name: 'Fri'
          },
          {
            value: 4200,
            name: 'Sat'
          },
          {
            value: 1842,
            name: 'Sun'
          }
        ]
      }
    ],
    tooltip: {
      trigger: 'item'
    }
  }
})

// 条形图数据
const rankChartData = reactive({
  dataset: {
    maxFeatures: 5
  },
  datasetOptions: [
    {
      seriesType: 'bar'
    }
  ],
  options: {
    yAxis: {
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLabel: {
        rotate: 0
      },
      type: 'category'
    },
    xAxis: {
      axisLabel: {
        rotate: 0
      },
      splitArea: {
        show: false
      },
      type: 'value'
    },
    grid: {
      left: 50,
      right: 50,
      top: 35,
      bottom: 35
    },
    series: [
      {
        data: ['500', '800', '3000', '3617', '3400', '4200', '1842'],
        name: 'Y2',
        stack: 0,
        type: 'bar'
      },
      {
        data: ['200', '500', '5000', '2617', '3330', '1200', '1002'],
        name: 'Y1',
        stack: 0,
        type: 'bar'
      }
    ],
    tooltip: {
      axisPointer: {
        type: 'shadow'
      },
      trigger: 'axis'
    }
  }
})

//雷达图数据
const radarChartData = reactive({
  dataset: {
    maxFeatures: 20,
    withCredentials: false
  },
  datasetOptions: [
    {
      seriesType: 'radar'
    }
  ],
  options: {
    radar: {
      indicator: [
        {
          max: '500',
          name: 'Mon'
        },
        {
          max: '800',
          name: 'Tue'
        },
        {
          max: '3000',
          name: 'Wed'
        },
        {
          max: '3617',
          name: 'Thu'
        },
        {
          max: '3400',
          name: 'Fri'
        },
        {
          max: '4200',
          name: 'Sat'
        },
        {
          max: '1842',
          name: 'Sun'
        }
      ],
      shape: 'circle',
      splitArea: {
        show: false
      },
      splitNumber: 5,
      radius: '70%'
    },
    grid: {
      left: 35,
      top: 50,
      bottom: 25
    },
    series: [
      {
        barWidth: '80%',
        data: [
          {
            name: 'Y1',
            value: ['100', '520', '2000', '3340', '3900', '3300', '2500']
          }
        ],
        name: 'demo',
        type: 'radar'
      }
    ],
    tooltip: {
      axisPointer: {
        type: 'shadow'
      },
      trigger: 'axis'
    }
  }
})

const currentChartData = ref<any>(barChartData)

const changeChartType = (type: string) => {
  chartType.value = type
  switch (type) {
    case 'bar':
      currentChartData.value = barChartData
      break
    case 'squareBar':
      currentChartData.value = squareBarData
      break
    case 'pie':
      currentChartData.value = pieChartData
      break
    case 'rank':
      currentChartData.value = rankChartData
      break
    case 'radar':
      currentChartData.value = radarChartData
      break
  }
}

// 图表点击事件处理
const handleChartClick = (event: any) => {
  console.log('图表点击事件:', event)
}
const handleLoad = (event: any) => {
  console.log('handleLoad', event)
}
</script>

<template>
  <div>
    <div style="margin-bottom: 20px">
      <h3>Chart组件演示</h3>
      <div style="margin-bottom: 10px">
        <Button
          type="primary"
          @click="changeChartType('bar')"
          :class="{ active: chartType === 'bar' }"
        >
          柱状图
        </Button>
        <Button
          type="primary"
          @click="changeChartType('squareBar')"
          :class="{ active: chartType === 'squareBar' }"
        >
          正方体柱状图
        </Button>
        <Button
          type="primary"
          @click="changeChartType('pie')"
          :class="{ active: chartType === 'pie' }"
        >
          饼图
        </Button>
        <Button
          type="primary"
          @click="changeChartType('rank')"
          :class="{ active: chartType === 'rank' }"
        >
          条形图
        </Button>
        <Button
          type="primary"
          @click="changeChartType('radar')"
          :class="{ active: chartType === 'radar' }"
        >
          雷达图
        </Button>
      </div>
    </div>

    <div style="display: flex; gap: 20px">
      <!-- 图表容器 -->
      <div style="flex: 1; height: 500px; border: 1px solid #ddd; border-radius: 4px">
        <Chart
          :key="chartType"
          :dataset="currentChartData.dataset"
          :options="currentChartData.options"
          :datasetOptions="currentChartData.datasetOptions"
          iconClass=""
          @click="handleChartClick"
          @load="handleLoad"
          style="height: 100%"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use '@supermapgis/common/theme-chalk/button.scss';

.sm-component-web-map {
  height: 500px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.sm-component-button {
  margin-right: 8px;
  margin-bottom: 8px;

  &.active {
    background-color: #1890ff;
    border-color: #1890ff;
  }
}

h3 {
  color: #333;
  margin-bottom: 16px;
}

h4 {
  color: #666;
  margin-bottom: 8px;
}

p {
  color: #888;
  margin-bottom: 4px;
}
</style>
