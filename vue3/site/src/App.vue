<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref, reactive, onBeforeMount } from 'vue'
import demoRoutes from './router/demoRoutes'
import { setTheme } from '@supermapgis/common/components/theme/theme'
import Button from '@supermapgis/common/components/button/Button'

const routes = reactive(demoRoutes)
const theme = ref('light')

onBeforeMount(() => {
  setTheme({ themeStyle: theme.value })
})

const changeStyle = () => {
  setTheme({ themeStyle: 'dark' })
}
const changeStyle1 = () => {
  setTheme({ themeStyle: 'light' })
}
const changeStyle2 = () => {
  let transparent = {
    themeType: 'dark',
    blue: 'purple',
    green: '#00bc00',
    red: '#e41318',
    gold: '#f2b200',
    colorPrimary: 'purple',
    colorSuccess: '#00bc00',
    colorWarning: '#f2b200',
    colorError: '#e41318',
    colorInfo: 'purple',
    colorTextBase: 'pink',
    colorBgBase: 'orange',
    gisControlBg: 'green',
    gisControlHeaderBg: 'red',
    // gisControlItemBgSelected: 'black',
    gisControlItemBgHover: 'blue'
  }
  setTheme({ themeStyle: transparent })
}
</script>

<template>
  <header>
    <nav>
      <RouterLink v-for="(route, key) in routes" :to="route.path">
        {{ key }}. {{ route.name }}
      </RouterLink>
    </nav>
  </header>

  <main>
    <div class="changeTheme">
      <Button @click="changeStyle">深色主题</Button>
      <Button @click="changeStyle1">浅色主题</Button>
      <Button @click="changeStyle2" background="red">自定义主题</Button>
    </div>
    <div class="view">
      <RouterView v-slot="{ Component, route }">
        <component :is="Component" :key="route.path"></component>
      </RouterView>
    </div>
  </main>
</template>

<style>
body {
  background-color: var(--color-bg-base);
  color: var(--color-text);
}
#app {
  display: inline-flex;
  width: 100%;
}
header {
  line-height: 1.5;
  max-height: 100vh;
}

main {
  width: 100%;
  height: 900px;
}
.changeTheme {
  margin-bottom: 20px;
}
.view {
  width: 100%;
  height: 100%;
  border: 1px solid;
  padding: 20px;
}
.view > div {
  width: 100%;
  height: 100%;
}

nav {
  width: 250px;
  height: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
  color: var(--color-text);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  /* header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  } */

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
