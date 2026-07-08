import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_ROOTS = ['src'];
const TARGET_EXTENSIONS = new Set(['.vue', '.scss']);
const SKIP_DIRECTORIES = new Set([
  '.git',
  '.idea',
  '.vscode',
  'coverage',
  'dist',
  'node_modules'
]);
const RTL_MIXIN_IMPORT = '@import "vue-iclient/src/common/_utils/style/mixins/rtl-mixin.scss";';
const RTL_MIXIN_FILE = path.join('src', 'common', '_utils', 'style', 'mixins', 'rtl-mixin.scss');
const RTL_PHYSICAL_START = 'rtl:physical:start';
const RTL_PHYSICAL_END = 'rtl:physical:end';

/**
 * 解析 border
 */
function parseBorderValue(borderValue) {
  const trimmed = borderValue.trim();
  const parts = trimmed.split(/\s+/);
  const [width, style, color] = parts;
  return { width, style, color };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitImportantDeclaration(value) {
  const importantPattern = /\s*!important\s*$/i;
  const trimmed = value.trim();

  if (!importantPattern.test(trimmed)) {
    return {
      normalizedValue: trimmed,
      hasImportant: false
    };
  }

  return {
    normalizedValue: trimmed.replace(importantPattern, '').trim(),
    hasImportant: true
  };
}

function collectProtectedRanges(styleContent) {
  const ranges = [];
  const markerPattern = /\/\*\s*(rtl:physical:start|rtl:physical:end)\s*\*\//g;
  let currentStart = null;
  let match;

  while ((match = markerPattern.exec(styleContent)) !== null) {
    const marker = match[1];
    if (marker === RTL_PHYSICAL_START) {
      currentStart = match.index;
      continue;
    }

    if (marker === RTL_PHYSICAL_END && currentStart !== null) {
      ranges.push({ start: currentStart, end: markerPattern.lastIndex });
      currentStart = null;
    }
  }

  if (currentStart !== null) {
    ranges.push({ start: currentStart, end: styleContent.length });
  }

  return ranges;
}

function isProtectedRange(offset, ranges) {
  return ranges.some((range) => offset >= range.start && offset < range.end);
}

function replaceProperty(styleContent, propertyName, replacer) {
  const protectedRanges = collectProtectedRanges(styleContent);
  const pattern = new RegExp(
    `(^|[\\r\\n{;])(\\s*)${escapeRegExp(propertyName)}\\s*:\\s*([^;]+);`,
    'gm'
  );

  return styleContent.replace(
    pattern,
    (match, prefix, indent, value, offset) => {
      if (isProtectedRange(offset, protectedRanges)) {
        return match;
      }

      const {
        normalizedValue,
        hasImportant
      } = splitImportantDeclaration(value);
      const replacement = replacer(normalizedValue, { hasImportant });

      if (replacement == null) {
        return match;
      }

      return `${prefix}${indent}${replacement}`;
    }
  );
}

function replaceDirectionalProperty(styleContent, propertyName, mixinName, direction) {
  return replaceProperty(
    styleContent,
    propertyName,
    (value, { hasImportant }) =>
      `@include ${mixinName}(${direction}, ${value}, ${hasImportant});`
  );
}

function replaceBorderCornerRadius(styleContent, propertyName, vertical, direction) {
  return replaceProperty(
    styleContent,
    propertyName,
    (value, { hasImportant }) =>
      `@include border-corner-radius(${vertical}, ${direction}, ${value}, ${hasImportant});`
  );
}

function ensureRtlMixinImport(content) {
  if (content.includes('rtl-mixin.scss')) {
    return content;
  }

  const moduleDirectivePattern =
    /^(\uFEFF?(?:\s*@charset\s+[^;]+;\s*)?(?:\s*@(?:forward|use)\s+[^;]+;\s*)*)/;
  const match = content.match(moduleDirectivePattern);

  if (match && match[0]) {
    return `${match[0]}${RTL_MIXIN_IMPORT}\n${content.slice(match[0].length)}`;
  }

  return `${RTL_MIXIN_IMPORT}\n${content}`;
}

function ensureScssLangAttr(styleAttrs) {
  if (/\blang\s*=\s*['"]scss['"]/.test(styleAttrs)) {
    return styleAttrs;
  }

  if (/\blang\s*=/.test(styleAttrs)) {
    return styleAttrs.replace(/\blang\s*=\s*['"][^'"]*['"]/, 'lang="scss"');
  }

  if (styleAttrs.trim() === '') {
    return ' lang="scss"';
  }

  return `${styleAttrs} lang="scss"`;
}

/**
 * 样式转换核心逻辑（Vue + SCSS 共用）
 */
function transformStyleContent(styleContent) {
  let updated = styleContent;

  /* margin-left */
  updated = replaceProperty(
    updated,
    'margin-left',
    (value, { hasImportant }) => `@include spacing-margin(${value}, left, ${hasImportant});`
  );

  /* margin-right */
  updated = replaceProperty(
    updated,
    'margin-right',
    (value, { hasImportant }) => `@include spacing-margin(${value}, right, ${hasImportant});`
  );

  /* margin shorthand */
  updated = replaceProperty(
    updated,
    'margin',
    (value, { hasImportant }) => {
      const parts = value.trim().split(/\s+/);
      if (parts.length === 4) {
        return `@include spacing-complate-margin(${value}, ${hasImportant});`;
      }
      return null;
    }
  );

  /* padding-left */
  updated = replaceProperty(
    updated,
    'padding-left',
    (value, { hasImportant }) => `@include spacing-padding(${value}, left, ${hasImportant});`
  );

  /* padding-right */
  updated = replaceProperty(
    updated,
    'padding-right',
    (value, { hasImportant }) => `@include spacing-padding(${value}, right, ${hasImportant});`
  );

  /* padding shorthand */
  updated = replaceProperty(
    updated,
    'padding',
    (value, { hasImportant }) => {
      const parts = value.trim().split(/\s+/);
      if (parts.length === 4) {
        return `@include spacing-complate-padding(${value}, ${hasImportant});`;
      }
      return null;
    }
  );

  /* border-left */
  updated = replaceProperty(
    updated,
    'border-left',
    (value, { hasImportant }) => {
      const { width, style, color } = parseBorderValue(value);
      return `@include border-line-style(left, ${width}, ${style}, ${color}, ${hasImportant});`;
    }
  );

  /* border-right */
  updated = replaceProperty(
    updated,
    'border-right',
    (value, { hasImportant }) => {
      const { width, style, color } = parseBorderValue(value);
      return `@include border-line-style(right, ${width}, ${style}, ${color}, ${hasImportant});`;
    }
  );

  /* border-left/right width */
  updated = replaceDirectionalProperty(
    updated,
    'border-left-width',
    'border-line-width',
    'left'
  );

  updated = replaceDirectionalProperty(
    updated,
    'border-right-width',
    'border-line-width',
    'right'
  );

  /* border-left/right style */
  updated = replaceDirectionalProperty(
    updated,
    'border-left-style',
    'border-line-type',
    'left'
  );

  updated = replaceDirectionalProperty(
    updated,
    'border-right-style',
    'border-line-type',
    'right'
  );

  /* border-left/right color */
  updated = replaceDirectionalProperty(
    updated,
    'border-left-color',
    'border-line-color',
    'left'
  );

  updated = replaceDirectionalProperty(
    updated,
    'border-right-color',
    'border-line-color',
    'right'
  );

  /* left */
  updated = replaceProperty(
    updated,
    'left',
    (value, { hasImportant }) => `@include position-row(left, ${value}, false, ${hasImportant});`
  );

  /* right */
  updated = replaceProperty(
    updated,
    'right',
    (value, { hasImportant }) => `@include position-row(right, ${value}, false, ${hasImportant});`
  );

  /* float */
  updated = replaceProperty(
    updated,
    'float',
    (value, { hasImportant }) => {
      if (value === 'left') {
        return `@include float-row(left, ${hasImportant});`;
      }
      if (value === 'right') {
        return `@include float-row(right, ${hasImportant});`;
      }
      return null;
    }
  );

  /* text-align */
  updated = replaceProperty(
    updated,
    'text-align',
    (value, { hasImportant }) => `@include text-align-transform(${value}, ${hasImportant});`
  );

  /* translate */
  updated = replaceProperty(
    updated,
    'transform',
    (value, { hasImportant }) => {
      const match = value.match(/^translate\(\s*([^,]+)\s*,\s*([^)]+)\s*\)$/);
      if (!match) {
        return null;
      }
      return `@include transform-translate(${match[1]}, ${match[2]}, ${hasImportant});`;
    }
  );

  /* translateX */
  updated = replaceProperty(
    updated,
    'transform',
    (value, { hasImportant }) => {
      const match = value.match(/^translateX\(\s*([^)]+)\s*\)$/);
      if (!match) {
        return null;
      }
      return `@include transform-translateX(${match[1]}, ${hasImportant});`;
    }
  );

  /* border-radius */
  updated = replaceProperty(
    updated,
    'border-radius',
    (value, { hasImportant }) => {
      const parts = value.trim().split(/\s+/);
      if (parts.length === 4) {
        return `@include spacing-complate-radius(${value}, ${hasImportant});`;
      }
      return null;
    }
  );

  /* border corner radius */
  updated = replaceBorderCornerRadius(
    updated,
    'border-top-left-radius',
    'top',
    'left'
  );

  updated = replaceBorderCornerRadius(
    updated,
    'border-top-right-radius',
    'top',
    'right'
  );

  updated = replaceBorderCornerRadius(
    updated,
    'border-bottom-left-radius',
    'bottom',
    'left'
  );

  updated = replaceBorderCornerRadius(
    updated,
    'border-bottom-right-radius',
    'bottom',
    'right'
  );

  return updated;
}

function collectFiles(dirPath, results = { vue: [], scss: [] }) {
  if (!fs.existsSync(dirPath)) {
    return results;
  }

  let entries = [];

  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (error) {
    console.warn(`跳过目录 ${dirPath}: ${error.message}`);
    return results;
  }

  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isSymbolicLink()) {
      return;
    }

    if (entry.isDirectory()) {
      if (SKIP_DIRECTORIES.has(entry.name)) {
        return;
      }

      collectFiles(fullPath, results);
      return;
    }

    if (!entry.isFile()) {
      return;
    }

    const extension = path.extname(entry.name);
    if (!TARGET_EXTENSIONS.has(extension)) {
      return;
    }

    if (extension === '.vue') {
      results.vue.push(fullPath);
      return;
    }

    if (extension === '.scss' && !fullPath.endsWith(RTL_MIXIN_FILE)) {
      results.scss.push(fullPath);
    }
  });

  return results;
}

/**
 * 处理 Vue 文件
 */
function processVueFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let modified = false;

    const styleRegex = /<style([^>]*)>([\s\S]*?)<\/style>/g;

    newContent = newContent.replace(
      styleRegex,
      (match, styleAttrs, styleContent) => {
        const updatedStyleContent = transformStyleContent(styleContent);

        if (updatedStyleContent === styleContent) {
          return match;
        }

        const updatedStyleAttrs = ensureScssLangAttr(styleAttrs);
        const finalStyleContent = ensureRtlMixinImport(updatedStyleContent);

        modified = true;

        return `<style${updatedStyleAttrs}>${finalStyleContent}</style>`;
      }
    );

    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`已修改 Vue: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`错误 ${filePath}:`, error.message);
  }
}

/**
 * 处理独立 SCSS 文件
 */
function processScssFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = transformStyleContent(content);

    if (newContent !== content) {
      const finalContent = ensureRtlMixinImport(newContent);

      fs.writeFileSync(filePath, finalContent, 'utf8');
      console.log(`已修改 SCSS: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`错误 ${filePath}:`, error.message);
  }
}

/**
 * 主流程
 */
function processFiles() {
  const targets = { vue: [], scss: [] };

  TARGET_ROOTS.forEach((root) => {
    collectFiles(path.join(__dirname, root), targets);
  });

  console.log(`找到 ${targets.vue.length} 个 Vue 文件`);
  console.log(`找到 ${targets.scss.length} 个 SCSS 文件`);

  targets.vue.forEach((file) => {
    processVueFile(file);
  });

  targets.scss.forEach((file) => {
    processScssFile(file);
  });

  console.log('处理完成');
}

processFiles();
