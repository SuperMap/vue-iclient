import { FetchRequest } from '@supermapgis/iclient-common/util/FetchRequest';

/**
 * 结构化数据（iPortal 结构化数据项）的字段名映射。
 *
 * OGC API Features 的 `filter` 只能用**表中的字段名**（structureddata.json 的 tableFieldNames），
 * 而设置面板、数据缓存、图层配置里用的是显示名（fieldNames），两者可能不同
 * （如「区站号」↔ quzhanhao、`站号_1` ↔ `站号1`），直接拿显示名拼 CQL 过滤不生效。
 *
 * 与 MapStudio 的做法一致（FilterUtil.replaceFilterFieldNames + mapboxFilterToQueryFilter）：
 * 图层配置里保留显示名，查询前按 structureddata.json 的
 * `fieldNames[i] → tableFieldNames[i]` 替换成表字段名。
 */

/** 同一次会话里一份数据只取一次字段映射（失败的请求会被清掉，允许下次重试） */
const fieldMapCache = new Map();
const warnedUrls = new Set();

/**
 * `{数据根路径}/structureddata.json`。
 * 与 items.json 的拼法保持一致：去掉 query，只保留数据根路径
 * （顺带容忍传进来的是 content.json 这种同级地址）。
 */
export function buildStructuredDataInfoUrl(dataUrl) {
  const base = String(dataUrl || '')
    .split('?')[0]
    .replace(/\/+$/, '')
    .replace(/\/content\.json$/i, '');
  if (!base) {
    return '';
  }
  return /\/structureddata\.json$/i.test(base) ? base : `${base}/structureddata.json`;
}

/**
 * structureddata.json 响应 → 字段名映射。
 * 响应体直接带 fieldNames / tableFieldNames（部分部署会包一层 data）。
 * @returns {{ toTableField: Object, toTableFieldLower: Object } | null}
 */
export function buildStructuredDataFieldMap(dataInfo) {
  const record =
    dataInfo && typeof dataInfo === 'object' && dataInfo.data && typeof dataInfo.data === 'object'
      ? dataInfo.data
      : dataInfo;
  const fieldNames = Array.isArray(record?.fieldNames) ? record.fieldNames : [];
  const tableFieldNames = Array.isArray(record?.tableFieldNames) ? record.tableFieldNames : [];
  const toTableField = {};
  const toTableFieldLower = {};
  fieldNames.forEach((fieldName, index) => {
    const tableFieldName = tableFieldNames[index];
    if (typeof fieldName !== 'string' || !fieldName) {
      return;
    }
    if (typeof tableFieldName !== 'string' || !tableFieldName) {
      return;
    }
    toTableField[fieldName] = tableFieldName;
    const lowerFieldName = fieldName.toLowerCase();
    if (!(lowerFieldName in toTableFieldLower)) {
      toTableFieldLower[lowerFieldName] = tableFieldName;
    }
  });
  return Object.keys(toTableField).length ? { toTableField, toTableFieldLower } : null;
}

function fetchStructuredDataFieldMap(infoUrl, withCredentials) {
  return FetchRequest.get(infoUrl, null, { withCredentials })
    .then(response => response.json())
    .then(dataInfo => buildStructuredDataFieldMap(dataInfo))
    .catch(() => null);
}

/**
 * 取字段名映射；取不到（无权限、非结构化数据、网络失败）时返回 null，
 * 调用方按「不做替换」处理，保持原有行为。
 */
export function getStructuredDataFieldMap(dataUrl, options = {}) {
  const infoUrl = buildStructuredDataInfoUrl(dataUrl);
  if (!infoUrl) {
    return Promise.resolve(null);
  }
  const cacheKey = `${infoUrl}|${options.withCredentials ? 1 : 0}`;
  const cached = fieldMapCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const request = fetchStructuredDataFieldMap(infoUrl, options.withCredentials).then(fieldMap => {
    if (!fieldMap) {
      fieldMapCache.delete(cacheKey);
      if (!warnedUrls.has(cacheKey)) {
        warnedUrls.add(cacheKey);
        console.warn(
          `[structured-data-field-map] 未取到结构化数据字段映射，过滤条件按原字段名生成：${infoUrl}`
        );
      }
    }
    return fieldMap;
  });
  fieldMapCache.set(cacheKey, request);
  return request;
}

/** 仅测试用：清空映射缓存 */
export function clearStructuredDataFieldMapCache() {
  fieldMapCache.clear();
  warnedUrls.clear();
}
