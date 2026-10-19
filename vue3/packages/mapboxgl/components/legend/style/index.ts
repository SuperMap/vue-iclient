// 图例中的矢量图标（styleRendererData.icon）依赖 iClient 的 supermapol-icons 字体，
// 这里与 web-map 样式入口保持一致显式引入一次，避免图例图标渲染不出来
import '@supermapgis/iclient-mapboxgl/css'
import '@supermapgis/mapboxgl/theme-chalk/base.scss'
import '@supermapgis/mapboxgl/theme-chalk/legend.scss'
