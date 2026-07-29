export function statisticsFeatures(features, fields, fieldCaptions, fieldTypes, originalFields) {
  const data = {
    features,
    fields: fields || [],
    originalFields: originalFields || [],
    fieldCaptions: fieldCaptions || [],
    fieldValues: [],
    fieldTypes
  };

  // 如果缺少 fields 或 fieldCaptions，从 features 的首尾要素中提取属性名（保持原逻辑）
  if (features && features.length && (!fields || !fieldCaptions)) {
    const firstProps = features[0].properties;
    const lastProps = features[features.length - 1].properties;
    const propSet = new Set();

    // 合并首尾要素的所有属性名
    for (let key in firstProps) propSet.add(key);
    for (let key in lastProps) propSet.add(key);

    const propNames = Array.from(propSet);
    if (!fields) data.fields = propNames.slice(); // 拷贝一份
    if (!fieldCaptions) data.fieldCaptions = propNames.slice();
  }

  const fieldList = data.fields;
  const fieldCount = fieldList.length;
  const featureCount = features.length;

  // 预分配 fieldValues 数组
  const fieldValues = new Array(fieldCount);
  for (let i = 0; i < fieldCount; i++) {
    fieldValues[i] = new Array(featureCount);
  }

  // 外层遍历要素，内层遍历字段
  for (let i = 0; i < featureCount; i++) {
    const props = features[i].properties;
    for (let j = 0; j < fieldCount; j++) {
      fieldValues[j][i] = props[fieldList[j]];
    }
  }

  data.fieldValues = fieldValues;
  return data;
}
