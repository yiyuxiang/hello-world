<template>
  <div class="recommend-page">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">为您推荐</h1>
        <p class="page-subtitle">基于您的浏览历史和偏好，我们精心挑选了这些房源</p>
      </div>
    </div>


    <!-- 房源列表 -->
    <div class="house-list" v-loading="loading">
      <el-card 
        v-for="house in pagedHouseList" 
        :key="house.id" 
        class="house-card" 
        @click="viewHouseDetail(house.id)"
      >
        <div class="recommendation-badge" v-if="house.recommendationScore">
          <el-tag type="success" effect="dark">
            推荐指数 {{ Math.round(house.recommendationScore * 100) }}%
          </el-tag>
        </div>
        <img 
          :src="house.image ? house.image : defaultImage" 
          class="house-image" 
        />
        <div class="house-content">
          <h3 class="house-title">{{ house.title }}</h3>
          <div class="house-meta">
            <span>{{ house.area }}㎡</span>
            <span v-if="house.floor && house.totalFloor"> | {{ house.floor }}/{{ house.totalFloor }}层</span>
            <span v-if="house.direction"> | 朝{{ house.direction }}</span>
            <span v-if="house.description"> {{ house.description.slice(0, 18) }}{{ house.description.length > 18 ? '...' : '' }}</span>
          </div>
          <div class="house-price">¥{{ house.price }}<span class="unit">/月</span></div>
          <div class="house-feature-tags">
            <span v-for="tag in house.tags" :key="tag" class="feature-tag">{{ tag }}</span>
          </div>
          <div class="recommendation-reason" v-if="house.recommendationReason">
            <el-icon><Star /></el-icon>
            <span>{{ house.recommendationReason }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @current-change="handleCurrentChange"
        background
      />
    </div>

    <!-- 无数据提示 -->
    <el-empty
      v-if="!loading && houseList.length === 0"
      description="暂无推荐房源"
    >
      <template #description>
        <p>暂时没有找到适合您的房源</p>
        <p>您可以尝试浏览更多房源来获取个性化推荐</p>
      </template>
      <el-button type="primary" @click="goToSearch">去搜索房源</el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getRecommendationsService } from '@/api/house.js'
import { getHouseDetailService,getHouseImagesService } from '@/api/house.js'
const router = useRouter()
const defaultImage = 'https://yyxyyxyyx.oss-cn-wuhan-lr.aliyuncs.com/41e4cd66-61ae-442d-ac1c-5538cd817847.webp'

// 分页相关
const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(0)
const houseList = ref([])
const loading = ref(false)


// 获取推荐房源列表
const getRecommendations = async () => {
  loading.value = true
  try {

    const res = await getRecommendationsService(6)
    let idList = res.data
    total.value = idList.length
    for(let i = 0; i < idList.length; i++){
      let house = await getHouseDetailService(idList[i])
      // 获取每个房源的图片
      
      houseList.value.push(house.data)
      let pic = await getHouseImagesService(idList[i])
      console.log(pic.data[0])
      houseList.value[i].image =  pic.data[0].imageUrl
    }
    
  } catch (error) {
    console.error('获取推荐房源失败:', error)
    ElMessage.error('获取推荐房源失败')
  } finally {
    loading.value = false
  }
}


// 分页数据
const pagedHouseList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return houseList.value.slice(start, end)
})


// 处理换页
const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 查看房源详情
const viewHouseDetail = (id) => {
  router.push(`/house/${id}`)
}

// 跳转到搜索页面
const goToSearch = () => {
  router.push('/search')
}

onMounted(() => {
  getRecommendations()
})

</script>

<style scoped>
.recommend-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f7fafd;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(179, 216, 255, 0.08);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 28px;
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.page-subtitle {
  font-size: 16px;
  color: #6a7a8c;
  margin: 0;
}

.recommendation-tags {
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.reason-tag {
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 20px;
  background: #eaf3fb;
  color: #6a8dff;
  border: none;
}

.house-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 28px;
  margin-top: 24px;
}

.house-card {
  position: relative;
  cursor: pointer;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 24px rgba(179, 216, 255, 0.08);
  transition: transform 0.25s, box-shadow 0.25s;
  background: #fff;
  border: 2px solid #eaf3fb;
  min-height: 340px;
}

.house-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 32px rgba(106, 141, 255, 0.13);
}

.recommendation-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.house-image {
  width: 100%;
  height: 210px;
  object-fit: cover;
  transition: filter 0.2s;
}

.house-card:hover .house-image {
  filter: brightness(0.96);
}

.house-content {
  padding: 16px;
  position: relative;
}

.house-title {
  font-size: 17px;
  color: #2c3e50;
  margin: 0 0 8px 0;
  line-height: 1.4;
  font-weight: 600;
}

.house-meta {
  color: #6a7a8c;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.house-price {
  color: #6a8dff;
  font-size: 22px;
  font-weight: bold;
  margin: 12px 0;
}

.unit {
  font-size: 14px;
  color: #8ca0b3;
  font-weight: normal;
}

.house-feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.feature-tag {
  background: #eaf3fb;
  color: #6a7a8c;
  border-radius: 8px;
  font-size: 13px;
  padding: 4px 12px;
  line-height: 1.4;
}

.recommendation-reason {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6a8dff;
  font-size: 14px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #eaf3fb;
}

.recommendation-reason .el-icon {
  color: #ffd700;
}

.pagination-container {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .house-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .house-list {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
}
</style> 