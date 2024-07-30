export function getGroupChildrenLayers(layerGroup) {
  const targetItems = [];
  for (const item of layerGroup) {
    if (item.type !== 'group') {
      targetItems.push(item);
      continue;
    }
    // 图层组
    const group = item;
    targetItems.push(...getGroupChildrenLayers(group.children));
  }
  return targetItems;
}
