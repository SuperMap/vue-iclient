import type { TreeProps } from 'ant-design-vue';
import { Tree } from 'ant-design-vue';
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

const SmTree = createWrappedComponent<TreeProps>(Tree, 'tree');

export default SmTree;