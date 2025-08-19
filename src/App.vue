<template>
  <div class="app">
    <TopNavBar />
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>

</template>

<script lang="ts" setup name="App">
import TopNavBar from '@/components/TopNavBar.vue'
</script>

<style>
.app {
  min-height: 100vh;
  background: #f5f5f5;
}

.main-content {
  padding-top: 60px; /* 为固定定位的导航栏留出空间 */
}

/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.5;
  color: #333;
}

a {
  text-decoration: none;
  color: inherit;
}
</style>