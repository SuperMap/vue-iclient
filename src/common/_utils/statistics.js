export function statisticsFeatures(features, fields, fieldCaptions, fieldTypes) {
  const data = {
    features,
    fields: fields || [],
    fieldValues: [],
    fieldTypes
  };
  if(features && !!features.length) {
    if(fieldCaptions && fieldCaptions.length) {
      features.forEach(feature => {
        const newProperties = {};
        for (const field in feature.properties) {
          const index = fields.indexOf(field);
          const fieldCaption = fieldCaptions[index];
          newProperties[fieldCaption || field] = feature.properties[field];
        }
        feature.properties = newProperties;
      });
    }
    const properties = Object.assign({}, features[0].properties, features[features.length - 1].properties);
    data.fields = Object.keys(properties);
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
