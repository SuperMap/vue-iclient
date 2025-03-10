import type { TreeProps } from 'ant-design-vue';
import { Tree } from 'ant-design-vue';
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmTree = createWrappedComponent<TreeProps>(Tree, 'tree');

export default SmTree;