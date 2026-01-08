export function getGroupChildrenLayers(layerGroup) {
  const targetItems = [];
  for (const item of layerGroup) {
    if (item.type !== 'group') {
      targetItems.push(item);
      continue;
    }
    // 图层组
    targetItems.push(...getGroupChildrenLayers(item.children));
  }
  return targetItems;
}

export function findLayerCatalog(layerCatalog, targetId) {
  for (const layer of layerCatalog) {
    if (layer.id === targetId) {
      return layer;
    }
    if (layer.children && layer.children.length > 0) {
      const found = findLayerCatalog(layer.children, targetId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function flattenLayerCatalog(layerCatalog) {
  function collectionLayers(referenceNodes) {
    const list = [];
    for (const refNode of referenceNodes) {
      const result = !refNode.children ? [refNode] : collectionLayers(refNode.children);
      list.push(...result);
    }
    return list;
  }
  return collectionLayers(layerCatalog);
}

export function removeLayersByIds(layerCatalog, targetIds) {
  function remove(layerCatalog, targetId) {
    for (const layer of layerCatalog) {
      if (targetId === layer.id) {
        layerCatalog.splice(layerCatalog.indexOf(layer), 1);
        return layer;
      }
      if (layer.children && layer.children.length > 0) {
        const found = remove(layer.children, targetId);
        if (found) {
          return found;
        }
      }
    }
  }
  return targetIds.map(targetId => remove(layerCatalog, targetId));
}

export function sortLayerCatalog(source, reference) {
  function buildSortedTree(referenceNodes, remainingSourceNodes) {
    const sorted = [];

    // 遍历 referenceNodes，按 reference 的顺序构建 sorted 树
    for (const refNode of referenceNodes) {
      const sourceNode = findLayerCatalog(source, refNode.id);
      if (sourceNode) {
        // 如果在 source 中找到了对应的节点，则添加到 sorted 中，并从 remainingSourceNodes 中移除
        sorted.push({ ...sourceNode });
        removeLayersByIds(remainingSourceNodes, [sourceNode.id]);

        if (refNode.children) {
          sorted[sorted.length - 1].children = buildSortedTree(refNode.children, remainingSourceNodes);
        }
      }
    }
    return sorted;
  }

  // remainingSourceNodes 复制源节点数组以跟踪剩余节点
  const remainingSourceNodes = [...source];
  const sortedResult = buildSortedTree(reference, remainingSourceNodes);
  // 将 remainingSourceNodes（即 source 中有但 reference 中没有的节点）添加到 sortedResult 的开头
  sortedResult.unshift(...remainingSourceNodes);

  return sortedResult;
}

export function getLayerCatalogIds(layerCatalog) {
  const ids = [];
  for (const layer of layerCatalog) {
    ids.push(layer.id);
    if (layer.children && layer.children.length > 0) {
      ids.push(...getLayerCatalogIds(layer.children));
    }
  }
  return ids;
}
