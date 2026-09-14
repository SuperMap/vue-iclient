import { normalizeFullWidthCharacters } from 'vue-iclient-core/utils/filter-characters';

/**
 * 把用户填写的过滤条件转成结构化数据（OGC API Features）用的 CQL 文本。
 *
 * 约定与下面两个实现对齐：
 * - iClient-JavaScript/src/common/util/FilterCondition.js#mapboxFilterToCqlFilter：
 *   STRUCTURE_DATA 的属性名一律包双引号，字符串值用单引号（内部单引号双写 '' ），数值裸写；
 * - MapStudio/src/util/data/MSDataUtil.ts#formatSearchKeyword：
 *   结构化数据属性名包双引号，文本模糊匹配用 ilike。
 *
 * 只做词法级改写：函数名、括号、比较符、BETWEEN 之类的原生 CQL 写法原样保留，
 * 所以用户仍然可以直接写 lower("名称") like '%x%' 这类表达式。
 * 值的位置（比较符/LIKE 之后、IN 列表内）支持三种写法，都会输出成单引号字面量：
 * 名称 = '北京'、名称 = "北京"、名称 = 北京。
 */

const CQL_KEYWORDS = new Set([
  'AND',
  'OR',
  'NOT',
  'IN',
  'LIKE',
  'ILIKE',
  'IS',
  'NULL',
  'TRUE',
  'FALSE',
  'BETWEEN',
  'DIV',
  'MOD'
]);

const CQL_TOKEN_STOP = /[\s(),'"<>=!]/;

function tokenizeCqlFilter(filterText) {
  const tokens = [];
  let index = 0;
  while (index < filterText.length) {
    const char = filterText[index];
    if (/\s/.test(char)) {
      let space = '';
      while (index < filterText.length && /\s/.test(filterText[index])) {
        space += filterText[index];
        index += 1;
      }
      tokens.push({ type: 'space', value: space });
      continue;
    }
    if (char === "'" || char === '"') {
      const quote = char;
      let value = '';
      index += 1;
      while (index < filterText.length) {
        if (filterText[index] === quote) {
          if (filterText[index + 1] === quote) {
            value += quote;
            index += 2;
            continue;
          }
          index += 1;
          break;
        }
        value += filterText[index];
        index += 1;
      }
      tokens.push({ type: quote === "'" ? 'string' : 'identifier', value });
      continue;
    }
    if (char === '(' || char === ')' || char === ',') {
      tokens.push({ type: 'punct', value: char });
      index += 1;
      continue;
    }
    if ('<>=!'.includes(char)) {
      const two = filterText.slice(index, index + 2);
      if (['>=', '<=', '!=', '<>', '=='].includes(two)) {
        tokens.push({ type: 'op', value: two === '==' ? '=' : two });
        index += 2;
        continue;
      }
      tokens.push({ type: 'op', value: char });
      index += 1;
      continue;
    }
    if (/[0-9]/.test(char) || (char === '-' && /[0-9]/.test(filterText[index + 1] || ''))) {
      const match = filterText.slice(index).match(/^-?\d+(\.\d+)?/);
      tokens.push({ type: 'number', value: match[0] });
      index += match[0].length;
      continue;
    }
    let word = '';
    while (index < filterText.length && !CQL_TOKEN_STOP.test(filterText[index])) {
      word += filterText[index];
      index += 1;
    }
    if (!word) {
      index += 1;
      continue;
    }
    tokens.push({ type: CQL_KEYWORDS.has(word.toUpperCase()) ? 'keyword' : 'word', value: word });
  }
  return tokens;
}

/** 裸词后面紧跟 `(` 说明是函数名，不能当属性名加引号 */
function isFunctionName(tokens, index) {
  for (let i = index + 1; i < tokens.length; i += 1) {
    if (tokens[i].type === 'space') {
      continue;
    }
    return tokens[i].type === 'punct' && tokens[i].value === '(';
  }
  return false;
}

const COMPARISON_OPERATORS = new Set(['=', '<>', '>', '>=', '<', '<=']);

/** 比较符 / LIKE 之后是「值」的位置 */
function isValueTrigger(token) {
  if (!token) {
    return false;
  }
  if (token.type === 'op') {
    return COMPARISON_OPERATORS.has(token.value);
  }
  if (token.type === 'keyword') {
    const keyword = token.value.toUpperCase();
    return keyword === 'LIKE' || keyword === 'ILIKE';
  }
  return false;
}

function quoteIdentifier(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

function quoteValue(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * 渲染时按位置区分属性名和值：
 * - 比较符 / LIKE 之后、IN 列表的 `(` 和 `,` 之后 → 值的位置：
 *   双引号或裸词都按字符串字面量输出（用户常写 小区名="科仪南楼" 或 小区名=科仪南楼）；
 * - 其它位置 → 属性名，包双引号（函数名除外）。
 * 代价：`"a" = "b"` 这种属性对属性的比较会被当成字符串值，本过滤框里按值处理更符合使用习惯。
 */
function renderCqlTokens(tokens) {
  const parts = [];
  const parenStack = [];
  let previous = null;
  tokens.forEach((token, index) => {
    if (token.type === 'space') {
      parts.push(token.value);
      return;
    }
    const inInList = parenStack.length > 0 && parenStack[parenStack.length - 1];
    const atListBoundary =
      previous &&
      previous.type === 'punct' &&
      (previous.value === '(' || previous.value === ',');
    const valuePosition = isValueTrigger(previous) || (inInList && atListBoundary);

    switch (token.type) {
      case 'string':
        parts.push(quoteValue(token.value));
        break;
      case 'identifier':
      case 'word': {
        if (token.type === 'word' && isFunctionName(tokens, index)) {
          parts.push(token.value);
        } else {
          parts.push(valuePosition ? quoteValue(token.value) : quoteIdentifier(token.value));
        }
        break;
      }
      case 'keyword': {
        const keyword = token.value.toUpperCase();
        // 结构化数据的文本检索按 MapStudio 的写法用 ilike（不区分大小写）
        parts.push(keyword === 'LIKE' ? 'ILIKE' : keyword);
        break;
      }
      case 'punct': {
        parts.push(token.value);
        if (token.value === '(') {
          parenStack.push(
            Boolean(previous && previous.type === 'keyword' && previous.value.toUpperCase() === 'IN')
          );
        } else if (token.value === ')') {
          parenStack.pop();
        }
        break;
      }
      default:
        parts.push(token.value);
    }
    previous = token;
  });
  return parts.join('');
}

/**
 * @param {string} attributeFilter - 用户填写的过滤条件。
 * @returns {string} CQL 文本；条件为空时返回空串。
 */
export function toStructuredDataCqlFilter(attributeFilter) {
  const filterText = typeof attributeFilter === 'string' ? attributeFilter.trim() : '';
  if (!filterText) {
    return '';
  }
  return renderCqlTokens(tokenizeCqlFilter(normalizeFullWidthCharacters(filterText)));
}
