<template>
  <div class="top-nav">
    <div class="nav-container">
      <!-- Logo区域 -->
      <div class="nav-left">
        <router-link to="/search" class="logo">
          <span class="logo-text">租房平台</span>
        </router-link>
      </div>

      <!-- 导航链接 -->
      <div class="nav-center">
        <router-link 
          v-for="item in currentNavItems" 
          :key="item.path" 
          :to="item.path"
          class="nav-item"
          :class="{ active: currentRoute === item.path }"
        >
          {{ item.name }}
        </router-link>
      </div>

      <!-- 用户区域 -->
      <div class="nav-right">
        <template v-if="!userStore.userRole">
          <el-button type="text" @click="$router.push('/login')">登录</el-button>
          <el-button type="primary" @click="$router.push('/login')">注册</el-button>
        </template>
        <template v-else>
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <span class="username">{{ userStore.username }}</span>
              <el-icon><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user.js'
import { useTokenStore } from '@/stores/token.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const tokenStore = useTokenStore()

// 当前路由
const currentRoute = computed(() => route.path)

// 根据用户角色显示对应的导航项
const currentNavItems = computed(() => {
  console.log(userStore.userRole)
  switch (userStore.userRole) {
    case 'tenant':
      return tenantNavItems
    case 'landlord':
      return landlordNavItems
    case 'admin':
      return adminNavItems
    default:
      return []
  }
})

const tenantNavItems = [
  {path:'/search',name:'找房'},
  {path: '/posts', name: '发现'},
  {path: '/recommend', name: '推荐'},
  {path: '/usercenter', name: '个人中心'},
]

const landlordNavItems = [
  {path: '/search', name: '找房'},
  {path: '/posts', name: '发现'},
  {path: '/landlord', name: '成为房东'},
  {path: '/usercenter', name: '个人中心'},
]

const adminNavItems = [
  {path: '/search', name: '找房'},
  {path: '/posts', name: '发现'},
  {path: '/admin', name: '管理员'},
  {path: '/usercenter', name: '个人中心'},
]

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'logout') {
    // 清除用户信息
    userStore.clearUserInfo()
    tokenStore.removeToken()
    // 跳转到登录页
    router.push('/login')
    ElMessage.success('已退出登录')
  }
}
</script>

<style scoped>
.top-nav {
  height: 60px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.nav-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #333;
}

.logo img {
  height: 32px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
}

.nav-center {
  display: flex;
  gap: 30px;
}

.nav-item {
  text-decoration: none;
  color: #666;
  font-size: 16px;
  padding: 0 5px;
  position: relative;
}

.nav-item:hover {
  color: #409EFF;
}

.nav-item.active {
  color: #409EFF;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #409EFF;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  color: #333;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-icon) {
  margin-right: 4px;
}
</style> 