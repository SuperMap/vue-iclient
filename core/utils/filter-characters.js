/**
 * 过滤条件的公共字符处理：中文输入法常带出全角符号，先统一成 ASCII，
 * 否则本地 json-sql 与结构化数据的 CQL 都会生成无法解析的表达式。
 * 本地过滤（json-sql-filter）与结构化数据（cql-filter）共用这一份，互不依赖。
 */

const FULL_WIDTH_CHARACTER_MAP = {
  '＝': '=',
  '＜': '<',
  '＞': '>',
  '！': '!',
  '（': '(',
  '）': ')',
  '，': ',',
  '‘': "'",
  '’': "'",
  '“': '"',
  '”': '"',
  '　': ' '
};

/** 全角标点 → ASCII */
export function normalizeFullWidthCharacters(filterText) {
  return String(filterText).replace(
    /[＝＜＞！（），‘’“”　]/g,
    char => FULL_WIDTH_CHARACTER_MAP[char] || char
  );
}
