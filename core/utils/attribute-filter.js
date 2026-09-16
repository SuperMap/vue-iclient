import { mapboxFilterToQueryFilter } from '@supermapgis/iclient-common/util/FilterCondition';

/**
 * 属性过滤条件归一化：把设置面板生成的 mapbox filter 表达式转成过滤用文本。
 *
 * - 数组（表达式）：交给 iClient 的 mapboxFilterToQueryFilter —— 字符串值加单引号、
 *   数值裸写、`== null` / `!= null` 落成 IS NULL / IS NOT NULL、in / !in 落成 IN / NOT IN；
 *   结构化数据（OGC API Features 的 CQL）额外把属性名包成双引号。
 * - 字符串：图层配置里的旧版手写条件，原样返回（已经带好引号，不再做词法改写）。
 *
 * 表达式形状与 MapStudio 图层过滤面板、MapDashboard 的 DataFilterConditions 一致：
 * `['all' | 'any' | 'none', ['==', '字段', 值], ['in', '字段', 值1, 值2], ...]`。
 *
 * @param {Array|string} filter - mapbox filter 表达式或旧版文本条件。
 * @param {string} [dataType] - 数据源类型，'STRUCTUREDDATA' 时按结构化数据 CQL 生成。
 * @returns {string} attributeFilter / CQL filter 文本；没有条件时返回空串。
 */
export function toAttributeFilter(filter, dataType) {
  if (!filter) {
    return '';
  }
  if (Array.isArray(filter)) {
    return mapboxFilterToQueryFilter(
      filter,
      dataType === 'STRUCTUREDDATA' ? 'STRUCTURE_DATA' : ''
    );
  }
  return typeof filter === 'string' ? filter : '';
}

function toTableFieldName(field, fieldMap) {
  if (typeof field !== 'string' || !field || !fieldMap) {
    return field;
  }
  return fieldMap.toTableField?.[field] ?? fieldMap.toTableFieldLower?.[field.toLowerCase()] ?? field;
}

/**
 * 把表达式里的字段名换成结构化数据的表字段名（structureddata.json 的 tableFieldNames）。
 *
 * 面板、数据缓存、图层配置里用的是显示名（fieldNames），而 OGC API Features 的 filter
 * 只认表字段名，两者可能不同（如「区站号」↔ quzhanhao）。与 MapStudio 的
 * `FilterUtil.replaceFilterFieldNames` 一致：递归处理 all / any / none，
 * 映射里没有的名字（含本来就是表字段名的情况）原样保留。
 *
 * @param {Array} filter - mapbox filter 表达式。
 * @param {{toTableField?: Object, toTableFieldLower?: Object}|null} fieldMap - 字段名映射。
 * @returns {Array} 替换后的表达式；没有表达式或没有映射时原样返回。
 */
export function mapFilterFieldNames(filter, fieldMap) {
  if (!fieldMap || !Array.isArray(filter)) {
    return filter;
  }
  const [operator, ...operands] = filter;
  switch (operator) {
    case '==':
    case '!=':
    case '>':
    case '>=':
    case '<':
    case '<=':
      return [operator, toTableFieldName(operands[0], fieldMap), operands[1]];
    case 'in':
    case '!in':
      return [operator, toTableFieldName(operands[0], fieldMap), ...operands.slice(1)];
    case 'has':
    case '!has':
      return [operator, toTableFieldName(operands[0], fieldMap)];
    case 'all':
    case 'any':
    case 'none':
      return [operator, ...operands.map(item => mapFilterFieldNames(item, fieldMap))];
    default:
      return filter;
  }
}
