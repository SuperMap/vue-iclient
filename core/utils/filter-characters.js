/**
 * 过滤条件的公共字符处理：中文输入法常带出全角符号，先统一成 ASCII，
 * 否则本地 json-sql 会生成无法解析的表达式。
 * 目前只有本地过滤（json-sql-filter）在用；表达式条件由 mapboxFilterToQueryFilter
 * 直接生成文本，不经过这里。
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
