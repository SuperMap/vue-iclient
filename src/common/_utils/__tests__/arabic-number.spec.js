import {
  resolveLayoutDirection,
  shouldTransformArabicNumbers,
  toArabicNumber,
  toLatinNumber
} from '../arabic-number';

describe('arabic number utility', () => {
  let previousDirection;

  beforeEach(() => {
    previousDirection = document.documentElement.getAttribute('dir');
  });

  afterEach(() => {
    if (previousDirection === null) {
      document.documentElement.removeAttribute('dir');
    } else {
      document.documentElement.setAttribute('dir', previousDirection);
    }
  });

  it('converts Latin digits while preserving other characters', () => {
    expect(toArabicNumber('Room 12.5')).toBe('Room ١٢.٥');
    expect(toArabicNumber('١٢ and 3')).toBe('١٢ and ٣');
  });

  it('returns an empty string for nullish values', () => {
    expect(toArabicNumber(null)).toBe('');
    expect(toArabicNumber(undefined)).toBe('');
    expect(toLatinNumber(null)).toBe('');
    expect(toLatinNumber(undefined)).toBe('');
  });

  it('converts Arabic digits back to Latin digits', () => {
    expect(toLatinNumber('Room ١٢.٥')).toBe('Room 12.5');
    expect(toLatinNumber('Room 12')).toBe('Room 12');
  });

  it('resolves the document direction and defaults to ltr', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    expect(resolveLayoutDirection()).toBe('rtl');

    document.documentElement.removeAttribute('dir');
    expect(resolveLayoutDirection()).toBe('ltr');
  });

  it('defaults to ltr when document is unavailable', () => {
    const originalDocument = global.document;
    try {
      delete global.document;
      expect(resolveLayoutDirection()).toBe('ltr');
    } finally {
      global.document = originalDocument;
    }
  });

  it('uses explicit direction values before the document direction', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    expect(shouldTransformArabicNumbers('ltr')).toBe(false);
    expect(shouldTransformArabicNumbers('rtl')).toBe(true);
    expect(shouldTransformArabicNumbers()).toBe(true);
    expect(shouldTransformArabicNumbers(null)).toBe(true);
  });
});
