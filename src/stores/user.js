import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userRole = ref('')
  const username = ref('')

  // 设置用户信息
  const setUserInfo = (role, name) => {
    userRole.value = role
    username.value = name
  }

  // 清除用户信息
  const clearUserInfo = () => {
    userRole.value = ''
    username.value = ''
  }

  return {
    userRole,
    username,
    setUserInfo,
    clearUserInfo
  }
}) 