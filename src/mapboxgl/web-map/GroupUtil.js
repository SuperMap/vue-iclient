class GroupUtil {
  getGroupVisible(catalogs, item) {
    const rootGroup = this.getRootGroup(catalogs, item);
    if (!rootGroup) return true;

    const { visible, children } = rootGroup;
    if (!visible) return false;

    return this.getGroupVisible(children, item);
  }

  getRootGroup(catalogs, item) {
    const isRootItem = catalogs.find(c => (c.id === item.id));
    if (isRootItem) return; // 说明是顶层，不存在父图层组

    // 图层组中的图层/图层组
    const groups = catalogs.filter(catalog => catalog.type === 'group');
    return groups.find((g) => this.isChild(g, item));
  }

  // 是否是当前图层组的 子图层/子图层组
  isChild(group, child) {
    const { children } = group;
    const target = children.find((c) => c.id === child.id);
    if (target) return true;

    const childrenGroup = children.filter(catalog => catalog.type === 'group');
    return !!childrenGroup.find((c) => this.isChild(c, child));
  }

  getGroupChildrenLayers(layerGroup) {
    const targetItems = [];
    for (const item of layerGroup) {
      // 图层组和图层都只选择可见的
      if (item.visible === false) continue;

      if (item.type !== 'group') {
        targetItems.push(item);
        continue;
      }
      // 图层组
      const group = item;
      targetItems.push(...this.getGroupChildrenLayers(group.children));
    }
    return targetItems;
  }
}
export default GroupUtil;
