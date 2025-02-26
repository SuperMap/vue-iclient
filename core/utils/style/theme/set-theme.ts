export const isBrowser = typeof window !== 'undefined';

export const isNativeSupport = isBrowser && window.CSS && window.CSS.supports && window.CSS.supports('(--a: 0)');
export function toStyleVariable(variable: string) {
  return `--${variable.replace(/[A-Z]/g, '-$&').toLowerCase()}`;
}

export function getRootStyleSelector(className?: string) {
  return className && isNativeSupport ? `.${className}` : ':root';
}
