import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export const useFavoriteStore = defineStore('favorite', () => {
  const favorites = ref([])
  
  // 添加收藏
  const addFavorite = (house) => {
    const exists = favorites.value.some(item => item.id === house.id)
    if (exists) {
      ElMessage.warning('该房源已在收藏列表中')
      return false
    }
    favorites.value.push({
      ...house,
      favoriteTime: new Date().toISOString()
    })
    ElMessage.success('收藏成功')
    return true
  }

  // 取消收藏
  const removeFavorite = (houseId) => {
    const index = favorites.value.findIndex(item => item.id === houseId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      ElMessage.success('已取消收藏')
      return true
    }
    return false
  }

  // 检查是否已收藏
  const isFavorite = (houseId) => {
    return favorites.value.some(item => item.id === houseId)
  }

  // 获取收藏列表
  const getFavorites = () => {
    return favorites.value
  }

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavorites
  }
}) 