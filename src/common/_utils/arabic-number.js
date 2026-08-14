const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicNumber(value) {
  return String(value == null ? '' : value).replace(/[0-9]/g, digit => ARABIC_DIGITS[digit]);
}

export function toLatinNumber(value) {
  return String(value == null ? '' : value).replace(/[٠-٩]/g, digit => String(ARABIC_DIGITS.indexOf(digit)));
}

export function resolveLayoutDirection() {
  if (typeof document === 'undefined') {
    return 'ltr';
  }
  return document.documentElement.getAttribute('dir') || 'ltr';
}

/** RTL 布局下将输入框中的拉丁数字转为阿拉伯数字。 */
export function shouldTransformArabicNumbers(direction) {
  return (direction == null ? resolveLayoutDirection() : direction) === 'rtl';
}
