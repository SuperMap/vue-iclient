/**
 * 字段信息参数可省略；缺省时由要素属性推导字段，保持轻量调用与完整 REST 元数据调用都可用。
 * @param {*} features
 * @param {*} [fields]
 * @param {*} [fieldCaptions]
 * @param {*} [fieldTypes]
 * @param {*} [originalFields]
 * @param {*} [isSystemFields]
 */
export function statisticsFeatures(
  features,
  fields,
  fieldCaptions,
  fieldTypes,
  originalFields,
  isSystemFields
) {
  const data = {
    features,
    fields: fields || [],
    originalFields: originalFields || [],
    fieldCaptions: fieldCaptions || [],
    fieldValues: [],
    fieldTypes,
    // REST 数据的系统字段标记，与 originalFields 一一对应（对齐 vue-iclient-dev）
    isSystemFields: isSystemFields || []
  };
  if (features && !!features.length && (!fields || !fieldCaptions)) {
    const properties = Object.assign({}, features[0].properties, features[features.length - 1].properties);
    for (let attr in properties) {
      if (!fieldCaptions) {
        data.fieldCaptions.push(attr);
      }
      if (!fields) {
        data.fields.push(attr);
      }
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
