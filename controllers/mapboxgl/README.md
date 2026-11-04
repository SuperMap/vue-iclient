# @supermapgis/iclient-components-core

MapboxGL ViewModels, shared core modules, and runtime assets distributed as one ESM-only package.

```sh
npm install @supermapgis/iclient-components-core
```

The build output and publish root are `controllers/mapboxgl/dist`. It contains one `package.json`, this README, and three top-level directories: `mapboxgl`, `core`, and `static`. Import controller modules from `@supermapgis/iclient-components-core/mapboxgl/src/...`, shared modules from `@supermapgis/iclient-components-core/core/...`, and runtime assets from `@supermapgis/iclient-components-core/static/...`. These paths match the published package structure and work with Webpack 4.

Build the package with `pnpm build:iclient-components-core`. The build emits ESM modules and declarations into `controllers/mapboxgl/dist`, with no CommonJS output. Publish the contents of that directory to the configured registry with `pnpm publish:iclient-components-core`.
