export function statisticsFeatures(features, fields, fieldCaptions, fieldTypes) {
  const data = {
    features,
    fields: fields || [],
    fieldCaptions: fieldCaptions || [],
    fieldValues: [],
    fieldTypes
  };
  if (features && !!features.length && !fieldCaptions && !fields) {
    const properties = Object.assign({}, features[0].properties, features[features.length - 1].properties);
    // 获取每个字段的名字和类型
    for (let attr in properties) {
      data.fieldCaptions.push(attr);
      data.fields.push(attr);
    }
  }
  for (let m in data.fields) {
    const fieldValue = [];
    for (let j in features) {
      const feature = features[j];
      const field = data.fields[m];
      const value = feature.properties[field];
      fieldValue.push(value);
    }
    // fieldValues   [[每个字段的所有要素值],[],[]]
    data.fieldValues.push(fieldValue);
  }
  return data;
}
