<template>
  <div class="sm-component-text-list" :style="gisControlBgStyle" @mouseleave="handleMouseLeaveFn({}, null, $event)" ref="textListRef">
    <div
      v-if="headerStyleData.show"
      class="sm-component-text-list__header"
      :style="[listStyle.headerHeight, { background: headerStyleData.background, color: headerStyleData.color }]"
    >
      <div class="sm-component-text-list__header-content">
        <template v-if="animateContent && animateContent.length > 0 && getColumns.length > 0">
          <template v-for="(item, index) in getColumns" :key="index">
            <div
              class="sm-component-text-list__header-title"
              :style="[fontSizeStyle, { flex: getColumnWidth(index) }]"
              :title="item.header"
            >
              <div
                @click="
                  sortByField(
                    item.field,
                    index,
                    !Number.isNaN(+listData[0][item.field]) && item.sort
                  )
                "
              >
                {{ item.header }}
              </div>
              <div
                v-if="!Number.isNaN(+listData[0][item.field]) && item.sort"
                class="arrow-wrap"
                :style="{ borderColor: headerStyleData.sortBtnColor }"
              >
                <i
                  :class="['up-triangle']"
                  :style="[
                    { borderBottomColor: headerStyleData.sortBtnColor },
                    sortType === 'ascend' &&
                      sortIndex === index && { borderBottomColor: headerStyleData.sortBtnSelectColor }
                  ]"
                ></i>
                <i
                  :class="['down-triangle']"
                  :style="[
                    { borderTopColor: headerStyleData.sortBtnColor },
                    sortType === 'descend' &&
                      sortIndex === index && { borderTopColor: headerStyleData.sortBtnSelectColor }
                  ]"
                ></i>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
    <div
      ref="animateRef"
      class="sm-component-text-list__animate"
      :style="[
        listStyle.contentHeight,
        textColorStyle,
        fontSizeStyle,
        { 'overflow-y': autoRolling ? 'hidden' : 'auto' }
      ]"
    >
      <div
        ref="listContentRef"
        :class="['sm-component-text-list__body-content', animate && 'sm-component-text-list__body-content--anim']"
      >
        <template v-if="animateContent && animateContent.length > 0">
          <template v-for="(rowData, index) in animateContent" :key="index">
            <div
              class="sm-component-text-list__list"
              :style="getRowStyle(rowData['idx'], index)"
              :data-index="rowData['idx']"
              @click="handleClick(rowData, rowData['idx'], $event)"
              @mouseenter="handleMouseEnterFn(rowData, rowData['idx'], $event)"
              @mouseleave="handleMouseLeaveFn(rowData, rowData['idx'], $event)"
            >
              <template v-for="(items, itemIndex) in getColumns" :key="itemIndex">
                <div
                  :title="(!items.slots && items.field) ? rowData[items.field] : ''"
                  :class="[items.slots && 'sm-component-text-list__slot', getCellStyle(rowData[items.field], itemIndex)['color'] && 'text-list_thresholds']"
                  :style="[listStyle.rowStyle, { flex: getColumnWidth(itemIndex) }, getCellStyle(rowData[items.field], itemIndex)]"
                >
                  <span v-if="!items.slots">{{ getText(items, rowData) }}</span>
                  <slot v-else :name="items.slots.customRender" :text="getText(items, rowData)" :record="rowData" :rowIndex="index">
                  </slot>
                </div>
              </template>
            </div>
          </template>
        </template>
      </div>
    </div>
    <sm-spin v-if="spinning" size="large" :tip="t('info.loading')" :spinning="spinning" />
  </div>
</template>


<script setup lang="ts">
import type { TextListProps, TextListEvents, HeaderStyleParams, RowStyleParams, ColumnParams } from './types'
import { textListPropsDefault } from './types'
import { ref, computed, watch, onMounted, onBeforeUnmount, onBeforeMount, nextTick } from 'vue';
import { addListener, removeListener } from 'resize-detector';
import { debounce, merge, isEqual, cloneDeep } from 'lodash-es'
import getFeatures from 'vue-iclient-core/utils/get-features';
import { useTimer, useTheme, useLocale } from '@supermapgis/common/hooks/index.common'
import { getColorWithOpacity } from 'vue-iclient-core/utils/util';
import SmSpin from '@supermapgis/common/components/spin/Spin';

const { t } = useLocale()

defineOptions({
  name: 'SmTextList'
})

const props = withDefaults(defineProps<TextListProps>(), textListPropsDefault)
const emit = defineEmits<TextListEvents>()

const { textColorStyle, gisControlBgStyle, colorPrimary } = useTheme(props)

// 响应式数据
const animate = ref(false);
const spinning = ref(false);
const listData = ref<Array<Object>>([]);
const animateContent = ref<Array<Object>>([]);
const startInter = ref<any>(null);
const containerHeight = ref(0);
const containerWidth = ref(0);
const resizeHandler = ref<Function>(() => {});
const listStyle = ref<any>({});
const featuresData = ref<any>(null);
const headerStyleData = ref<HeaderStyleParams>({ show: true });
const rowStyleData = ref<RowStyleParams>({ height: 0 });
const sortType = ref('descend');
const sortTypeList = ref<Array<string>>(['ascend', 'descend', 'none']);
const sortTypeIndex = ref(0);
const sortField = ref('');
const sortIndex = ref<number | null>(null);
const handleMouseEnterFn = ref<Function>(() => {});
const handleMouseLeaveFn = ref<Function>(() => {});
const activeHoverRowIndex = ref<number | null>(null);
const activeClickRowIndex = ref<Array<number>>([]);
const eventTriggerColorList = ref<{ clickColor: string | null }>({
  clickColor: null
});
const rowHoverColor = ref('rgba(128, 128,128, 0.8)');
const curRollingStartIndex = ref(0);
const animateRef = ref<HTMLElement | null>(null);
const textListRef = ref<HTMLElement | null>(null);
const listContentRef = ref<HTMLElement | null>(null);

// 计算属性
const getAutoRollingIndexBounds = computed(() => {
  return [curRollingStartIndex.value + 1, curRollingStartIndex.value + 1 + props.rows];
});

const getRowStyle = computed(() => {
  return (index: number, rawIndex: number) => {
    if (props.highlightCurrentRow) {
      if (activeClickRowIndex.value && activeClickRowIndex.value.includes(index)) {
        return {
          background: eventTriggerColorList.value.clickColor
        };
      }
    }
    if (activeHoverRowIndex.value === index) {
      return {
        background: rowHoverColor.value
      };
    }
    if ((rawIndex + 1) % 2 !== 0) {
      return {
        background: rowStyleData.value.oddStyle?.background
      };
    } else {
      return {
        background: rowStyleData.value.evenStyle?.background
      };
    }
  };
});

const getCellStyle = computed(() => {
  return (value: any, columnIndex: number) => {
    if (isNaN(+value) || !props.thresholdsStyle || !props.thresholdsStyle[columnIndex]) {
      return {};
    }
    const rangeGroup = props.thresholdsStyle[columnIndex];
    let colorRangeInfo = rangeGroup.data.map(item => ({ ...item }));
    const matchColorRange = colorRangeInfo.find(item => {
      let status;
      if (item.min) {
        status = +value >= +item.min;
      }
      if (item.max) {
        status = status === undefined ? true : status;
        status = status && +value <= +item.max;
      }
      return status;
    });
    if (matchColorRange) {
      return { [rangeGroup.type]: matchColorRange.color };
    }
    return {};
  };
});

const fontSizeStyle = computed(() => {
  return {
    fontSize: typeof props.fontSize === 'string' ? props.fontSize : `${props.fontSize! * 1.1}px`
  };
});

const getColumnWidth = computed(() => {
  return (index: number) => {
    if (getColumns.value && getColumns.value.length > 0 && index < getColumns.value.length) {
      const width = getColumns.value[index].width;
      return width ? `0 0 ${(width / 100) * containerWidth.value}px` : 1;
    }
    return 1;
  };
});

const getColumns = computed<ColumnParams[]>(() => {
  if (Array.isArray(props.columns)) {
    return props.columns;
  } else {
    return props.fields.map((field, index) => {
      return {
        header: props.header[index],
        field: props.fields[index],
        width: props.columnWidths[index],
        fixInfo: { prefix: '', suffix: '' },
        sort: true,
        defaultSortType: 'none'
      };
    });
  }
});

// const filterProperty = computed(() => {
//   return (rowData: any, propertyName: string) => {
//     let copyRowData = { ...rowData };
//     delete copyRowData[propertyName];
//     return copyRowData;
//   };
// });

// 方法
const handleContent = (content: any) => {
  if (content) {
    let listData: any[] = [];
    content.forEach((data: any, index: number) => {
      const obj = { idx: index };
      for (let key in data) {
        obj[key] = (data[key] === null || data[key] === undefined) ? '-' : data[key];
      }
      JSON.stringify(obj) !== '{}' && listData.push(obj);
    });
    return listData;
  } else {
    return content;
  }
};

const handleFeatures = (data: any) => {
  let features = data && data.features;
  let content: any[] = [];
  features &&
    features.forEach((feature: any, index: number) => {
      let properties = feature.properties;
      if (!properties) {
        return;
      }
      const contentObj = { idx: index };
      for (let key in properties) {
        contentObj[key] = (properties[key] === null || properties[key] === undefined) ? '-' : properties[key];
      }
      JSON.stringify(contentObj) !== '{}' && content.push(contentObj);
    });

  return content;
};

const getListHeightStyle = () => {
  animateContent.value = listData.value && listData.value.concat();
  if (!containerHeight.value || !listData.value) {
    return;
  }
  let height = containerHeight.value;
  const headerHeightNum = headerStyleData.value.show ? headerStyleData.value.height || height * 0.15 : 0;
  let headerHeight = { height: `${headerHeightNum}px` };
  const contentHeightNum = height - headerHeightNum;
  let contentHeight = { height: `${contentHeightNum}px` };
  let rowHeight = rowStyleData.value.height;
  if (!rowHeight) {
    if (listData.value.length <= props.rows) {
      const listDataLength = Math.max(props.autoRolling ? listData.value.length - 1 : listData.value.length, 1);
      rowHeight = contentHeightNum / listDataLength;
    } else {
      rowHeight = contentHeightNum / props.rows;
    }
  }
  let rowStyle = { height: `${rowHeight}px`, lineHeight: `${rowHeight}px` };

  if (props.autoRolling) {
    if (listData.value.length > 2) {
      itemByItem();
    }
  } else {
    clearInterval(startInter.value);
  }
  listStyle.value = { headerHeight, contentHeight, rowStyle };
};

const getFeaturesFromDataset = (initLoading = true) => {
  // 如果是geojson就不加loading
  let { url, geoJSON } = props.dataset;
  url && initLoading && (spinning.value = true);
  // 有url或geojson ,dataset才发请求
  if (url || geoJSON) {
    let dataset = cloneDeep(props.dataset);
    getFeatures(dataset).then(data => {
      props.dataset.url && initLoading && (spinning.value = false);
      featuresData.value = data;
      // 对定时刷新数据 按当前选择排序
      listData.value = sortContent(handleFeatures(data));
      getListHeightStyle();
    });
  }
};

const itemByItem = () => {
  clearInterval(startInter.value);
  startInter.value = setInterval(() => {
    let wrapper = listContentRef.value;
    // @ts-ignore
    wrapper && wrapper.style && (wrapper.style.marginTop = `-${listStyle.value.rowStyle.height}`);
    animate.value = !animate.value;
    setTimeout(() => {
      // @ts-ignore
      let first = listContentRef.value && listContentRef.value.children && listContentRef.value.children[0];
      if (first) {
        curRollingStartIndex.value = +first.dataset.index;
      }
      // @ts-ignore
      first && listContentRef.value.appendChild(first);
      // @ts-ignore
      wrapper && wrapper.style && (wrapper.style.marginTop = '0px'); // 保持滚动距离初始值一直为 0
      animate.value = !animate.value;
    }, 500);
  }, 2000);
};

const sortByField = (fieldName: string, index: number, isSortField: boolean) => {
  if (!isSortField) {
    return;
  }
  sortField.value = fieldName;
  sortIndex.value = index;
  sortTypeIndex.value++;
  if (sortTypeIndex.value > sortTypeList.value.length - 1) {
    sortTypeIndex.value = 0;
  }
  sortType.value = sortTypeList.value[sortTypeIndex.value];
  reset();
};

const sortContent = (content: any) => {
  if (!content) {
    return null;
  }
  let sortContent: any[] = [];
  // 没有排序类型 或者 排序字段不存在
  if (sortType.value === 'none' || !sortField.value || content.length <= 1) {
    sortContent = content;
  } else {
    sortContent = cloneDeep(content);
    if (sortType.value === 'descend') {
      sortContent.sort((a: any, b: any) => {
        return b[sortField.value] - a[sortField.value];
      });
    } else if (sortType.value === 'ascend') {
      sortContent.sort((a: any, b: any) => {
        return a[sortField.value] - b[sortField.value];
      });
    }
  }
  return sortContent;
};

const setDefaultSortType = () => {
  let fieldIndex = 0;
  let column =
    props.columns &&
    props.columns.find((column: ColumnParams, index: number) => {
      if (['ascend', 'descend'].includes(column.defaultSortType) && column.sort) {
        fieldIndex = index;
        return true;
      }
      return false;
    });
  if (column) {
    sortType.value = column.defaultSortType;
    let index = sortTypeList.value.findIndex(item => {
      return item === column.defaultSortType;
    });
    sortTypeIndex.value = index;
    sortField.value = column.field;
    sortIndex.value = fieldIndex;
    return;
  }
  sortField.value = '';
  sortType.value = 'none';
};

const handleClick = (item: any, rowIndex: number, event: Event) => {
  if (props.highlightColor && typeof props.highlightColor === 'function') {
    eventTriggerColorList.value.clickColor = props.highlightColor(item, rowIndex, event);
  }
  if (props.highlightColor && typeof props.highlightColor === 'string') {
    eventTriggerColorList.value.clickColor = props.highlightColor;
  }
  emit('row-click', item, rowIndex, event);
  emit('cell-click', item, rowIndex, event);
};

const handleMouseEnter = (item: any, rowIndex: number, event: Event) => {
  activeHoverRowIndex.value = rowIndex;
  emit('cell-mouse-enter', item, rowIndex, event);
};

const handleMouseLeave = (item: any, rowIndex: number, event: Event) => {
  activeHoverRowIndex.value = null;
  emit('cell-mouse-leave', item, rowIndex, event);
};

const setCurrentRow = (rowIndexList: any) => {
  if (rowIndexList && rowIndexList.length) {
    activeClickRowIndex.value = rowIndexList.map((item: any) => typeof item !== 'object' ? item : item.dataIndex);
  } else {
    activeClickRowIndex.value = [];
  }
};

const filterUnit = (str) => {
  return str.match(/[\d\D]+(?=px)/gim)?.[0] || '';
};

const reset = () => {
  nextTick(() => {
    animateContent.value = [];
    nextTick(() => {
      animateContent.value = [...listData.value];
      // @ts-ignore
      animateRef.value && (animateRef.value.scrollTop = 0);
    });
  });
};

// const rowsIndexViewBounds = () => {
//   if (animateRef.value && props.rows) {
//     // @ts-ignore
//     let beginIndex = Math.ceil(animateRef.value.scrollTop / filterUnit(listStyle.value.rowStyle.height));
//     let endIndex = beginIndex + props.rows;
//     return [beginIndex, endIndex];
//   }
//   return [];
// };

const clamp = (num: number, min: number, max: number) => {
  if ((min || min === 0) && (max || max === 0) && num > min && num < max) {
    return true;
  }
  return false;
};

const destory = () => {
  if (props.autoResize) {
    clearInterval(startInter.value);
    // @ts-ignore
    removeListener(textListRef.value, resizeHandler.value);
  }
};

const getText = (items: ColumnParams, rowData: any) => {
  const { fixInfo, field } = items;
  const { prefix = '', suffix = '' } = fixInfo || { prefix: '', suffix: '' };
  return rowData[field] || rowData[field] === 0 ? prefix + rowData[field] + suffix : '';
};

// const setContent = (content: any) => {
//   listData.value = handleContent(content);
//   getListHeightStyle();
// };

const setListData = () => {
  if (props.content && props.content.length > 0) {
    listData.value = handleContent(props.content);
  } else if (props.dataset && (props.dataset.url || props.dataset.geoJSON)) {
    getFeaturesFromDataset();
  }
};

const timing = () => {
  if (props.dataset && props.dataset.url) {
    getFeaturesFromDataset(false);
  }
};

useTimer(props, { timing })

// 生命周期钩子
onBeforeMount(() => {
  headerStyleData.value = merge(
    { show: true, background: colorPrimary.value, color: textColorStyle.value },
    props.headerStyle
  );
  rowStyleData.value = merge(
    {
      oddStyle: { background: getColorWithOpacity(gisControlBgStyle.value, 0.4) },
      evenStyle: { background: getColorWithOpacity(colorPrimary.value, 0.4) }
    },
    props.rowStyle
  );
  handleMouseEnterFn.value = debounce(handleMouseEnter, 20, { leading: true });
  handleMouseLeaveFn.value = debounce(handleMouseLeave, 20, { leading: true });
});

onMounted(() => {
  setListData();
  setDefaultSortType();
  // resize 监听
  if (props.autoResize) {
    resizeHandler.value = debounce(
      () => {
        if (textListRef.value) {
          // @ts-ignore
          containerHeight.value = textListRef.value.offsetHeight;
          // @ts-ignore
          containerWidth.value = textListRef.value.offsetWidth;
        }
      },
      500,
      { leading: true }
    );
    // @ts-ignore
    addListener(textListRef.value, resizeHandler.value);
  }

  // 等待元素渲染好 获取高度 计算 list 高度
  setTimeout(() => {
    if (textListRef.value) {
      // @ts-ignore
      containerHeight.value = textListRef.value.offsetHeight;
      // @ts-ignore
      containerWidth.value = textListRef.value.offsetWidth;
    }
  }, 0);
});

onBeforeUnmount(() => {
  destory();
});

// 监听
watch(() => props.content, () => {
  listData.value = handleContent(props.content);
  getListHeightStyle();
});

watch(() => props.dataset, (newVal) => {
  if (props.dataset && (props.dataset.url || props.dataset.geoJSON)) {
    getFeaturesFromDataset();
  } else {
    featuresData.value = [];
    listData.value = [];
    animateContent.value = [];
    clearInterval(startInter.value);
  }
}, { deep: true });

watch(animateContent, (content) => {
  emit('contentChange', content);
});

watch(() => props.columns, (oldVal, newVal) => {
  if ((props.content || featuresData.value) && !isEqual(oldVal, newVal)) {
    setDefaultSortType();
    const listData = props.content ? handleContent(props.content) : handleFeatures(featuresData.value);
    listData.value = sortContent(listData);
    getListHeightStyle();
  }
});

watch(() => props.autoRolling, () => {
  if (!listData.value) {
    listData.value = [];
  }
  if (props.autoRolling) {
    if (listData.value.length > 2) {
      itemByItem();
    }
  } else {
    clearInterval(startInter.value);
  }
  getListHeightStyle();
  reset();
}, { immediate: true });

watch(() => props.rows, () => {
  getListHeightStyle();
});

watch(() => props.rowStyle, (next) => {
  rowStyleData.value = Object.assign({}, rowStyleData.value, next);
  getListHeightStyle();
});

watch(() => props.headerStyle, (next) => {
  headerStyleData.value = Object.assign({}, headerStyleData.value, next);
  getListHeightStyle();
});

watch(containerHeight, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    clearInterval(startInter.value);
    getListHeightStyle();
  }
});

watch(sortType, () => {
  let rawContent = props.content ? handleContent(props.content) : handleFeatures(featuresData.value);
  listData.value = sortContent(rawContent);
  getListHeightStyle();
});

watch(sortField, () => {
  let rawContent = props.content ? handleContent(props.content) : handleFeatures(featuresData.value);
  listData.value = sortContent(rawContent);
  getListHeightStyle();
});

watch(() => props.highlightColor, (newVal) => {
  if (newVal && typeof newVal === 'string') {
    Object.keys(eventTriggerColorList.value).forEach(colorType => {
      eventTriggerColorList.value[colorType] = newVal;
    });
  }
}, { immediate: true });

watch(() => props.highlightOptions, (newVal) => {
  let autoBounds = getAutoRollingIndexBounds.value;
  if (!props.autoRolling && newVal && newVal.length) {
    // @ts-ignore
    if (animateRef.value) {
      let scrollHeight = 0;
      let dataIndex = animateContent.value.findIndex((item: any, index: number) => {
        // @ts-ignore
        return item.idx === newVal[0].dataIndex;
      });
      if (dataIndex || dataIndex === 0) {
        let rowHeight = filterUnit(listStyle.value.rowStyle.height);
        scrollHeight = dataIndex * rowHeight;
        // @ts-ignore
        let currentScrollTop = animateRef.value.scrollTop;
        if (scrollHeight < currentScrollTop || scrollHeight > currentScrollTop + rowHeight * props.rows) {
          // @ts-ignore
          animateRef.value.scrollTop = scrollHeight;
        }
      }
    }
    // @ts-ignore
  } else if (props.autoRolling) {
    const newDataIndex = newVal && newVal.length && newVal[0].dataIndex;
    if (!clamp(newDataIndex, autoBounds[0], autoBounds[1])) {
      let splitIndex;
      if (newDataIndex <= props.rows) {
        reset();
      } else {
        splitIndex = newDataIndex - props.rows;
        nextTick(() => {
          animateContent.value = [];
          nextTick(() => {
            let copyListData = cloneDeep(listData.value);
            let tempArr = copyListData.splice(0, splitIndex + 1);
            copyListData = [...copyListData, ...tempArr];
            animateContent.value = copyListData;
          });
        });
      }
    }
  }
  setCurrentRow(newVal);
}, { immediate: true, deep: true });

</script>