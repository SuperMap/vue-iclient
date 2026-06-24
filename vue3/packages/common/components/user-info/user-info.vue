<template>
  <div class="sm-component-user-info">
    <div v-if="showIcon" :class="{ 'user-logined': !!userName, 'user-icon-holder': true }">
      <sm-tooltip :title="userName" v-bind="$attrs" >
        <i class="sm-components-icon-user" @click="handleClick"/>
      </sm-tooltip>
    </div>
    <sm-tooltip v-if="showName && userName" :title="userName">
      <span v-if="showName && userName" @click="handleClick">{{ userName }}</span>
    </sm-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SmTooltip from '@supermapgis/common/components/tooltip/Tooltip';
import { getUserName, openUserDetails } from 'vue-iclient-core/utils/user';

interface Props {
  /** 根地址 */
  rootUrl: string;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 是否显示名称 tooltip */
  showName?: boolean;
}


const props = withDefaults(defineProps<Props>(), {
  showIcon: true,
  showName: true
});


// 用户名（初始渲染前发起请求获取）
const userName = ref('');

// 初始渲染前调用 core/utils/user-info.js 导出的 getUserName 获取用户名
if (props.rootUrl) {
  getUserName(props.rootUrl).then((name: string) => {
    userName.value = name || '';
  });
}

const handleClick = () => {
  openUserDetails(props.rootUrl);
};
</script>
