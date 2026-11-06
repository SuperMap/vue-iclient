import { normalizeStyle, type CSSProperties, type StyleValue } from 'vue'

/**
 * Keep layout styles on a control's root and paint backgrounds on its collapsible
 * content. Controls using CollapseCard get this behavior automatically; controls
 * with their own collapse UI should use the same split when forwarding attrs.
 */
export function splitControlStyle(style: unknown) {
  // Wrapping in an array also parses CSS strings using Vue's style normalization.
  const normalizedStyle = normalizeStyle([style as StyleValue]) as CSSProperties
  const rootStyle: CSSProperties = {}
  const backgroundStyle: CSSProperties = {}

  for (const [key, value] of Object.entries(normalizedStyle)) {
    const target = /^background(?:[A-Z-]|$)/.test(key) ? backgroundStyle : rootStyle
    target[key as keyof CSSProperties] = value as never
  }

  return { rootStyle, backgroundStyle }
}
