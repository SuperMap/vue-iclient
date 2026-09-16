import 'vue-iclient-static/libs/json-sql/jsonsql';
import { normalizeFullWidthCharacters } from 'vue-iclient-core/utils/filter-characters';

/**
 * 用 json-sql（static/libs/json-sql/jsonsql）在客户端执行 attributeFilter。
 * 适用场景：数据源没有可查询的服务，或服务端不执行 attributeFilter（iPortal content.json、仪表盘数据缓存等）。
 *
 * 条件写法与 DV/src/util/LayerUtil.js 的 parseFilterCondition 保持一致：
 * - `=` → `==`、`AND/OR` → `&&/||`、`IN (...)` → `(字段 == v1 || 字段 == v2)`；
 * - 额外支持：`<>` → `!=`、`LIKE / NOT LIKE`、`IS [NOT] NULL`、全角标点（中文输入法）；
 * - 字符串字面量内的 `=` / `or` / `and` 不会被改写；
 * - `=` / `!=` 为宽松比较（字段是字符串时 `'2000' == 2000` 成立），LIKE 忽略大小写；
 * - 不支持 BETWEEN 等写法，条件解析失败时保留原数据并给出一条警告。
 * json-sql 内部用 `var <字段名> = ...` 生成求值函数，字段名必须是合法 JS 标识符，数字开头与含括号/逗号的字段名需要转义。
 */

const JSON_SQL_IDENTIFIER_ESCAPES = {
  '(': '$0',
  ')': '$1',
  '（': '$2',
  '）': '$3',
  ',': '$4',
  '，': '$5'
};

function getJsonSql() {
  if (typeof window === 'undefined') {
    return null;
  }
  const jsonSql = window.jsonsql;
  return jsonSql && typeof jsonSql.query === 'function' ? jsonSql : null;
}

let jsonSqlLoadPromise = null;

/**
 * 确保 json-sql 可用：静态引入被构建工具裁掉（side-effect 被 tree-shaking）时兜底动态加载一次。
 * 调用本地过滤前先 await 这个函数。
 */
export async function ensureJsonSql() {
  if (getJsonSql()) {
    return true;
  }
  if (!jsonSqlLoadPromise) {
    jsonSqlLoadPromise = import('vue-iclient-static/libs/json-sql/jsonsql').catch(() => null);
  }
  await jsonSqlLoadPromise;
  return Boolean(getJsonSql());
}

/** 全角标点 → ASCII（实现见 filter-characters，两条链路共用） */
export { normalizeFullWidthCharacters };

/** 按引号切分条件，字符串字面量内部不做算子替换（值里出现 or / and / = 时不能被改写） */
function splitFilterSegments(filterText) {
  const segments = [];
  let current = '';
  let quote = '';
  for (let i = 0; i < filterText.length; i++) {
    const char = filterText[i];
    current += char;
    if (quote) {
      if (char === quote) {
        segments.push({ text: current, quoted: true, quote });
        current = '';
        quote = '';
      }
      continue;
    }
    if (char === "'" || char === '"') {
      current = current.slice(0, -1);
      if (current) {
        segments.push({ text: current, quoted: false, quote: '' });
      }
      current = char;
      quote = char;
    }
  }
  if (current) {
    segments.push({ text: current, quoted: Boolean(quote), quote });
  }
  return segments;
}

function normalizeFilterExpression(expression) {
  return expression
    .replace(/<>/g, '!=')
    .replace(/([^=!<>])=([^=])/g, '$1==$2')
    // 引号切段后单 = 可能落在段尾/段首（名称='北京' → 名称= | '北京'），
    // 漏掉就会被 json-sql 当成赋值表达式（恒为真，条件失效）
    .replace(/([^=!<>])=$/, '$1==')
    .replace(/^=(?!=)/, '==')
    .replace(/\bAND\b/gi, '&&')
    .replace(/\bOR\b/gi, '||')
    // NOT 只在带括号时可用：NOT (a = 1) → !(a == 1)；NOT a = 1 交给 json-sql 报错，避免 !a == 1 这种语义错误
    .replace(/\bNOT\b\s*(?=\()/gi, '!');
}

/** 按逗号切分 IN 列表（引号内不切分），保留引号 */
function splitInListValues(listText) {
  const values = [];
  let current = '';
  let quote = '';
  for (let i = 0; i < listText.length; i++) {
    const char = listText[i];
    if (quote) {
      current += char;
      if (char === quote) {
        quote = '';
      }
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      current += char;
      continue;
    }
    if (char === ',') {
      if (current.trim()) {
        values.push(current.trim());
      }
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) {
    values.push(current.trim());
  }
  return values;
}

/** `字段 IN ('a','b')` → `(字段 == 'a' || 字段 == 'b')`（同 DV 的 parseFilterCondition） */
function translateInOperators(expression) {
  return expression.replace(
    /(^|[\s(])("[^"]*"|[^\s()!'"=<>]+)\s+(NOT\s+)?IN\s*\(([^()]*)\)/gi,
    (match, boundary, field, notKeyword, listText) => {
      const values = splitInListValues(listText);
      if (!values.length) {
        return match;
      }
      const expanded = values.map(value => `${field} == ${value}`).join(' || ');
      return `${boundary}${notKeyword ? '!' : ''}(${expanded})`;
    }
  );
}

/** `字段 IS NULL` / `字段 IS NOT NULL` → `字段 == null` / `字段 != null`（缺失字段按 null 处理） */
function translateNullChecks(expression) {
  return expression.replace(
    /(^|[\s(])("[^"]*"|[^\s()!'"=<>]+)\s+IS\s+(NOT\s+)?NULL/gi,
    (match, boundary, field, notKeyword) =>
      `${boundary}${field} ${notKeyword ? '!=' : '=='} null`
  );
}

function escapeLikeRegExpSource(text) {
  return String(text)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\//g, '\\/');
}

/** `%` → `.*`、`_` → `.`，其余按字面量转义 */
function likePatternToRegExpSource(pattern) {
  let source = '';
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    if (char === '%') {
      source += '.*';
    } else if (char === '_') {
      source += '.';
    } else {
      source += escapeLikeRegExpSource(char);
    }
  }
  return `^${source}$`;
}

/**
 * json-sql 没有 LIKE，这里把 `字段 LIKE '模式'` 翻成 `/^模式$/i.test(String(字段))`。
 * 只处理「模式带引号」的写法，且字段名不含引号/比较符，避免误伤字符串值里的 LIKE 字样。
 */
function translateLikeOperators(expression) {
  return expression.replace(
    /(^|[\s(])("[^"]*"|[^\s()!'"=<>]+)\s+(NOT\s+)?LIKE\s+(?:'([^']*)'|"([^"]*)")/gi,
    (match, boundary, field, notKeyword, singleQuoted, doubleQuoted) => {
      const pattern = singleQuoted !== undefined ? singleQuoted : doubleQuoted;
      if (pattern === undefined) {
        return match;
      }
      const source = likePatternToRegExpSource(pattern);
      const test = `/${source}/i.test(String(${field} == null ? '' : ${field}))`;
      return `${boundary}${notKeyword ? '!' : ''}${test}`;
    }
  );
}

/** SQL 写法 → json-sql 的 JS 表达式写法；已写对的 == / != / >= / <= / <> 与字符串值都不会被破坏 */
export function normalizeAttributeFilter(filterText) {
  const normalized = normalizeFullWidthCharacters(filterText);
  const withJsOperators = splitFilterSegments(normalized)
    .map(segment => (segment.quoted ? segment.text : normalizeFilterExpression(segment.text)))
    .join('');
  return translateLikeOperators(
    translateNullChecks(translateInOperators(withJsOperators))
  );
}

function escapeJsonSqlIdentifier(name) {
  let identifier = /^\d/.test(name) ? `$${name}` : name;
  Object.keys(JSON_SQL_IDENTIFIER_ESCAPES).forEach(char => {
    identifier = identifier.split(char).join(JSON_SQL_IDENTIFIER_ESCAPES[char]);
  });
  return identifier;
}

/**
 * 条件里的字段名换成 json-sql 用的标识符：
 * - 裸字段名直接替换；
 * - 双引号包裹的属性名（结构化数据/CQL 的写法，如 "名称" = '北京'）命中字段名时去掉引号，
 *   否则保持原样（当成字符串值，例如 name = "北京"）；
 * - 单引号字符串字面量内的内容不动。
 */
function escapeJsonSqlCondition(condition, fieldNames) {
  const identifiers = new Map();
  fieldNames.forEach(name => identifiers.set(name, escapeJsonSqlIdentifier(name)));
  return splitFilterSegments(condition)
    .map(segment => {
      if (segment.quote === "'") {
        return segment.text;
      }
      if (segment.quote === '"') {
        const inner = segment.text.slice(1, -1);
        return identifiers.has(inner) ? identifiers.get(inner) : segment.text;
      }
      let text = segment.text;
      identifiers.forEach((escaped, name) => {
        if (escaped !== name) {
          text = text.split(name).join(escaped);
        }
      });
      return text;
    })
    .join('');
}

function queryJsonSql(jsonSql, condition, properties) {
  return jsonSql.query(`select * from json where (${condition})`, { properties });
}

function collectFeatureFieldNames(features) {
  const names = new Set();
  (features || []).forEach(feature => {
    const properties = feature && feature.properties;
    if (properties) {
      Object.keys(properties).forEach(key => names.add(key));
    }
  });
  return Array.from(names);
}

/**
 * 创建逐要素过滤谓词。
 * @param {string} attributeFilter - 过滤条件。
 * @param {string[]} [fieldNames] - 字段名集合，用于预声明字段（缺失字段按 undefined 处理，不会抛 ReferenceError）。
 * @returns {((properties: Object) => boolean) | null} 无过滤条件 / json-sql 不可用 / 条件不受支持时返回 null，调用方应保留原数据。
 */
export function createAttributeFilterPredicate(attributeFilter, fieldNames = []) {
  const filterText = typeof attributeFilter === 'string' ? attributeFilter.trim() : '';
  if (!filterText) {
    return null;
  }
  const jsonSql = getJsonSql();
  if (!jsonSql) {
    console.warn('[json-sql-filter] json-sql 未加载，过滤条件已忽略');
    return null;
  }
  const fieldList = fieldNames.filter(name => typeof name === 'string' && name);
  const condition = escapeJsonSqlCondition(normalizeAttributeFilter(filterText), fieldList);
  const escapedFields = fieldList.map(escapeJsonSqlIdentifier);
  const probe = {};
  escapedFields.forEach(name => {
    probe[name] = undefined;
  });
  try {
    queryJsonSql(jsonSql, condition, probe);
  } catch (error) {
    console.warn(
      `[json-sql-filter] 过滤条件无法解析，已保留全部数据："${filterText}" → "${condition}"`
    );
    return null;
  }
  return properties => {
    const scope = {};
    escapedFields.forEach(name => {
      scope[name] = undefined;
    });
    Object.keys(properties || {}).forEach(key => {
      scope[escapeJsonSqlIdentifier(key)] = properties[key];
    });
    try {
      return queryJsonSql(jsonSql, condition, scope).length > 0;
    } catch (error) {
      return false;
    }
  };
}

/**
 * 过滤要素数组。条件为空、json-sql 不可用或条件不受支持时原样返回输入数组。
 * @param {Array} features - GeoJSON Feature 数组。
 * @param {string} attributeFilter - 过滤条件。
 */
export function filterFeaturesByAttributeFilter(features, attributeFilter) {
  if (!Array.isArray(features) || !features.length) {
    return features;
  }
  const predicate = createAttributeFilterPredicate(
    attributeFilter,
    collectFeatureFieldNames(features)
  );
  if (!predicate) {
    return features;
  }
  return features.filter(feature => predicate(feature && feature.properties));
}
