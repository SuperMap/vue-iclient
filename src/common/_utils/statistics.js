export function statisticsFeatures(features, fieldCaptions, fieldTypes) {
  const data = {
    features,
    fieldCaptions: fieldCaptions || [],
    fieldValues: [],
    fieldTypes
  };
  if (features && !!features.length && !fieldCaptions) {
    const feature = features[0];
    // 获取每个字段的名字和类型
    for (let attr in feature.properties) {
      data.fieldCaptions.push(attr);
    }
  }
  for (let m in data.fieldCaptions) {
    const fieldValue = [];
    for (let j in features) {
      const feature = features[j];
      const caption = data.fieldCaptions[m];
      const value = feature.properties[caption];
      fieldValue.push(value);
    }
    // fieldValues   [[每个字段的所有要素值],[],[]]
    data.fieldValues.push(fieldValue);
  }
  return data;
}
