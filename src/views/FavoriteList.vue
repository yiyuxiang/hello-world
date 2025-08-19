<template>
  <div class="favorite-list">
    <div class="page-header">
      <h2>我的收藏</h2>
    </div>

    <div class="list-content" v-if="favorites.length">
      <el-row :gutter="20">
        <el-col 
          v-for="house in favorites" 
          :key="house.id" 
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="6"
        >
          <el-card class="house-card" shadow="hover">
            <div class="image-wrapper" @click="viewHouseDetail(house.id)">
              <img :src="house.coverImage" :alt="house.title">
              <div class="favorite-time">
                收藏于 {{ formatDate(house.favoriteTime) }}
              </div>
            </div>
            <div class="house-info">
              <h3 class="title" @click="viewHouseDetail(house.id)">
                {{ house.title }}
              </h3>
              <div class="price">
                <span class="amount">¥{{ house.price }}</span>
                <span class="unit">/月</span>
              </div>
              <div class="tags">
                <el-tag size="small" v-for="tag in house.tags.slice(0, 2)" :key="tag">
                  {{ tag }}
                </el-tag>
              </div>
              <div class="actions">
                <el-button 
                  type="danger" 
                  text 
                  @click="removeFavorite(house.id)"
                >
                  取消收藏
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="empty-state" v-else>
      <el-empty description="暂无收藏的房源">
        <el-button type="primary" @click="router.push('/search')">
          去找房
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favorite'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const favoriteStore = useFavoriteStore()

const favorites = computed(() => favoriteStore.getFavorites())

const viewHouseDetail = (id) => {
  router.push(`/house/${id}`)
}

const removeFavorite = async (houseId) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消收藏该房源吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    favoriteStore.removeFavorite(houseId)
  } catch {
    // 用户取消操作
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<style scoped>
.favorite-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.house-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.house-card:hover {
  transform: translateY(-5px);
}

.image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 75%;
  overflow: hidden;
  cursor: pointer;
}

.image-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-time {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 12px;
  text-align: center;
}

.house-info {
  padding: 12px;
}

.title {
  font-size: 16px;
  margin: 0 0 8px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.title:hover {
  color: #409EFF;
}

.price {
  margin-bottom: 8px;
}

.amount {
  font-size: 20px;
  font-weight: bold;
  color: #ff4d4f;
}

.unit {
  font-size: 14px;
  color: #666;
}

.tags {
  margin-bottom: 12px;
}

.tags .el-tag {
  margin-right: 8px;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  margin-top: 60px;
}
</style> 