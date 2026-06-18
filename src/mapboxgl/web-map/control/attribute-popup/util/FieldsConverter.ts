import { Expression } from 'mapbox-gl';

export interface FieldsCaptionsType {
  [key: string]: string
}
let FieldsConverter = {
  getFieldCaption(fieldName: string, fieldsCaptions: FieldsCaptionsType): string {
    return fieldsCaptions?.[fieldName] ?? fieldName;
  },

  getFieldNameByCaption(fieldCaption: string, fieldsCaptions: FieldsCaptionsType): string {
    let name = fieldCaption;
    for (const fieldName in fieldsCaptions) {
      const caption = fieldsCaptions?.[fieldName];
      if (caption === fieldCaption) {
        name = fieldName;
      }
    }
    return name;
  },

  convertFieldNameToCaption(
    insert: string | Expression,
    fieldsCaptions: FieldsCaptionsType
  ): string | Expression {
    if (typeof insert === 'string') {
      return insert.replace(/\{([^}]+)\}/g, match => {
        const innerValue = match.slice(1, -1);
        const value = FieldsConverter.getFieldCaption(innerValue, fieldsCaptions);
        return value ? `{${value}}` : match;
      });
    } else {
      return insert.map(item => {
        if (Array.isArray(item)) {
          item[1] = FieldsConverter.getFieldCaption(item[1], fieldsCaptions);
        }
        return item;
      }) as Expression;
    }
  },

  convertCaptionToFieldName(
    insert: string | Expression,
    fieldsCaptions: FieldsCaptionsType
  ): string | Expression {
    if (typeof insert === 'string') {
      return insert.replace(/\{([^}]+)\}/g, match => {
        const innerValue = match.slice(1, -1);
        const value = FieldsConverter.getFieldNameByCaption(innerValue, fieldsCaptions);
        return value ? `{${value}}` : match;
      });
    } else {
      return insert.map(item => {
        if (Array.isArray(item)) {
          item[1] = FieldsConverter.getFieldNameByCaption(item[1], fieldsCaptions);
        }
        return item;
      }) as Expression;
    }
  },

  convertTextInfoToFieldName(ops: any, fieldsCaptions: FieldsCaptionsType): any {
    return [...ops].map(op => {
      const { insert } = op;
      if (insert) {
        op.insert = FieldsConverter.convertCaptionToFieldName(insert, fieldsCaptions);
      }
      return op;
    });
  },

  convertTextInfoToCaption(ops: any, fieldsCaptions: FieldsCaptionsType): any {
    return [...ops].map(op => {
      const { insert } = op;
      if (insert) {
        op.insert = FieldsConverter.convertFieldNameToCaption(insert, fieldsCaptions);
      }
      return op;
    });
  }
};

export default FieldsConverter;
