import type { TreeProps } from 'ant-design-vue';
import { Tree as ATree } from 'ant-design-vue';
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmTree = createWrappedComponent<TreeProps>(ATree);

export default SmTree;