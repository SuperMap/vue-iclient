export function statisticsFeatures(features, fields, fieldCaptions, fieldTypes) {
  const data = {
    features,
    fields: fields || [],
    fieldCaptions: fieldCaptions || [],
    fieldValues: [],
    fieldTypes
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
