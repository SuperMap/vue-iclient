const ARABIC_NUMBER_MAP: Record<string, string> = {
  '0': '٠',
  '1': '١',
  '2': '٢',
  '3': '٣',
  '4': '٤',
  '5': '٥',
  '6': '٦',
  '7': '٧',
  '8': '٨',
  '9': '٩'
}

const LATIN_NUMBER_MAP: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9'
}

export function hasLatinNumber(value?: string | null): value is string {
  return typeof value === 'string' && /\d/.test(value)
}

export function hasArabicNumber(value?: string | null): value is string {
  return typeof value === 'string' && /[٠-٩]/.test(value)
}

export function toArabicNumber(value: string): string {
  if (!hasLatinNumber(value)) {
    return value
  }
  return value.replace(/[0-9]/g, (digit) => ARABIC_NUMBER_MAP[digit])
}

export function toLatinNumber(value: string): string {
  if (!hasArabicNumber(value)) {
    return value
  }
  return value.replace(/[٠-٩]/g, (digit) => LATIN_NUMBER_MAP[digit])
}

export function resolveLayoutDirection(): string {
  if (typeof document === 'undefined') {
    return 'ltr'
  }
  return document.documentElement.getAttribute('dir') || 'ltr'
}

/** RTL 布局下将输入框中的拉丁数字转为阿拉伯数字显示 */
export function shouldTransformArabicNumbers(direction?: string | null): boolean {
  return (direction ?? resolveLayoutDirection()) === 'rtl'
}
