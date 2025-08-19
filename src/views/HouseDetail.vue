<template>
  <div class="house-detail">
    <div class="detail-container">
      <!-- 顶部操作栏 -->
      <div class="action-bar">
        <div class="left">
          <el-button @click="router.back()" text>
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
        <div class="right favorite-right">
          <el-button 
            :type="isFavorited ? 'warning' : 'default'" 
            text
            class="favorite-btn"
            @click="toggleFavorite"
          >
            <el-icon style="font-size: 28px;"><Star /></el-icon>
            <span style="font-size: 20px;">{{ isFavorited ? '已收藏' : '收藏' }}</span>
          </el-button>
        </div>
      </div>

      <div class="main-content">
        <!-- 图片展示区 -->
        <div class="image-section">
          <div class="main-image">
            <img :src="houseDetail.images[currentImageIndex].imageUrl" :alt="houseDetail.title">
            <div class="image-nav">
              <el-button class="nav-btn prev" @click="prevImage" :disabled="currentImageIndex === 0">
                <el-icon><ArrowLeft /></el-icon>
              </el-button>
              <el-button class="nav-btn next" @click="nextImage" :disabled="currentImageIndex === houseDetail.images.length - 1">
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="thumbnail-list">
            <div 
              v-for="(image, index) in houseDetail.images" 
              :key="index"
              class="thumbnail"
              :class="{ active: index === currentImageIndex }"
              @click="currentImageIndex = index"
            >
              <img :src="image.imageUrl" :alt="houseDetail.title">
            </div>
          </div>
        </div>

        <!-- 房源信息区 -->
        <div class="info-section">
          <div class="title-section">
            <h1>{{ houseDetail.title }}</h1>
            <div class="price-info">
              <span class="current-price">¥{{ houseDetail.price }}</span>
              <span class="price-unit">/月(季付价)</span>
              <span class="original-price" v-if="houseDetail.originalPrice">¥{{ houseDetail.originalPrice }}</span>
            </div>
          </div>

          <!-- 优惠信息 -->
          <div class="promotion-section" v-if="houseDetail.promotions.length">
            <div v-for="promo in houseDetail.promotions" :key="promo" class="promotion-item">
              <span class="promotion-tag">限时好礼</span>
              <span class="promotion-text">{{ promo }}</span>
            </div>
          </div>

          <!-- 房源标签 -->
          <div class="feature-tags">
            <el-tag 
              v-for="tag in houseDetail.tags" 
              :key="tag"
              class="tag-item"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </div>

          <!-- 基本信息 -->
          <div class="basic-info">
            <div class="info-item">
              <div class="value">{{ houseDetail.area }}㎡</div>
              <div class="label">使用面积</div>
            </div>
            <div class="info-item">
              <div class="value">{{ houseDetail.direction }}</div>
              <div class="label">朝向</div>
            </div>
            <div class="info-item">
              <div class="value">{{ houseDetail.layout }}</div>
              <div class="label">户型</div>
            </div>
            <div class="info-item">
              <div class="value">第{{ houseDetail.floor }}层 / 共{{ houseDetail.total_floor }}层</div>
              <div class="label">楼层</div>
            </div>
          </div>

          <!-- 位置信息 -->
          <div class="location-info">
            <div class="info-row">
              <span class="info-label">位置</span>
              <span class="info-value">{{ houseDetail.address }}</span>
            </div>
          </div>

          <!-- 联系人信息 -->
          <div class="contact-section">
            <div class="phone-section">
              <span class="phone-number">{{ houseDetail.agentPhone }}</span>
              
            </div>
            <div class="contact-actions">
              <el-button 
                type="primary" 
                @click="handleReserve" 
                class="reserve-btn"
                :disabled="hasAppointment"
              >
                {{ hasAppointment ? '已预约' : '预约看房' }}
              </el-button>
              <el-button 
                type="success" 
                @click="handleSignContract" 
                class="sign-btn"
                :disabled="hasContract"
              >
                {{ hasContract ? '签约中' : '立即签约' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 房源详情标签页 -->
      <div class="detail-tabs">
        <el-tabs>
          <el-tab-pane label="房源简介">
            <div class="description-content">{{ houseDetail.description }}</div>
          </el-tab-pane>
          <el-tab-pane label="配套设施">
            <div class="facilities-grid">
              <div v-for="facility in houseDetail.facilities" :key="facility.name" class="facility-item">
                <el-icon><component :is="facility.icon" /></el-icon>
                <span>{{ facility.name }}</span>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="室友信息">
            <div class="roommates-list">
              <div v-for="roommate in houseDetail.roommates" :key="roommate.room" class="roommate-item">
                <div class="room-info">
                  <span class="room-name">{{ roommate.room }}</span>
                  <el-tag 
                    :type="roommate.status === '已入住' ? 'success' : 'info'"
                    size="small"
                  >
                    {{ roommate.status }}
                  </el-tag>
                </div>
                <div class="tenant-info" v-if="roommate.tenant">
                  <div class="basic-info">
                    <span class="gender">{{ roommate.tenant.gender }}</span>
                    <span class="occupation">{{ roommate.tenant.occupation }}</span>
                  </div>
                  <div class="duration">
                    <span>入住时长：{{ roommate.tenant.duration }}</span>
                  </div>
                </div>
                <div class="no-tenant" v-else>
                  暂无租客入住
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFavoriteStore } from '@/stores/favorite'
import { getHouseDetailService,getHouseImagesService,addFavoriteService,deleteFavoriteService,checkCollectService } from '@/api/house'
import { checkAppointmentService, checkContractService } from '@/api/appointment'
import { addUserBehaviorService, getUserInfoService } from '@/api/user.js'
const router = useRouter()
const route = useRoute()
const currentImageIndex = ref(0)
const favoriteStore = useFavoriteStore()
const isFavorited = ref(false)


const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const nextImage = () => {
  if (currentImageIndex.value < houseDetail.value.images.length - 1) {
    currentImageIndex.value++
  }
}

const getHouseDetail = async () => {
  const res = await getHouseDetailService(Number(route.params.id))
  houseDetail.value.id = res.data.id
  houseDetail.value.title = res.data.title
  houseDetail.value.owner_id = res.data.ownerId
  houseDetail.value.price = res.data.price
  houseDetail.value.area = res.data.area
  houseDetail.value.city = res.data.city
  houseDetail.value.district = res.data.district
  houseDetail.value.description = res.data.description
  houseDetail.value.status = res.data.status
  houseDetail.value.floor = res.data.floor
  houseDetail.value.coverUrl = res.data.coverUrl
  houseDetail.value.total_floor = res.data.totalFloor
  houseDetail.value.direction = res.data.direction
  houseDetail.value.address = res.data.address
}


// 检查是否收藏房源
const checkCollect = async () => {
  const res = await checkCollectService(Number(route.params.id))
  isFavorited.value = res.data
}


// 获取房屋详情
const houseDetail = ref({
  id: 1,
  title: '现代简约三居室 · 南加州大学附近',
  owner_id: 1,
  price: '3800',
  area: '120',
  city: '武汉',
  district: '洪山区',
  description: '南加州大学附近，现代简约三居室，精装修，南北通透，拎包入住',
  status: 0,
  floor: 1,
  total_floor: 10,
  direction: '南',
  address: '武汉市洪山区南加州大学附近',
  originalPrice: 1899,
  images: [
    'https://yyxyyxyyx.oss-cn-wuhan-lr.aliyuncs.com/41e4cd66-61ae-442d-ac1c-5538cd817847.webp',
    'https://yyxyyxyyx.oss-cn-wuhan-lr.aliyuncs.com/41e4cd66-61ae-442d-ac1c-5538cd817847.webp',
  ],
  promotions: [
    '限时立减，今日签约可优惠￥1512',
    '限时好礼，领1500元券包，享直减优惠'
  ],

  facilities: [
    { name: '智能锁', icon: 'Lock' },
    { name: '路由器', icon: 'Connection' },
    { name: '油烟机', icon: 'KitchenKnife' },
    { name: '微波炉', icon: 'Food' },
    { name: '洗衣机', icon: 'Dish' },
    { name: '热水器', icon: 'WaterCup' },
    { name: '椅子', icon: 'SoldOut' },
    { name: '衣柜', icon: 'Closet' }
  ],
  roommates: []
})

const handleEditPhone = () => {
  ElMessage.success('跳转到修改号码页面')
}

// 用户信息
const userInfo = ref({
  isVerified: 0
})

// 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await getUserInfoService()
    userInfo.value = res.data
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 跳转预约
const handleReserve = () => {
  console.log(userInfo.value.isVerified)
  if (userInfo.value.isVerified !== 1) {
    ElMessageBox.confirm(
      '您还未完成实名认证，请先完成认证后再进行预约',
      '提示',
      {
        confirmButtonText: '去认证',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      router.push('/usercenter?activeMenu=verify')
    })
    return
  }
  
  if (hasAppointment.value) {
    ElMessage.info('您已预约过该房源')
    return
  }
  router.push({
    path: '/appointment',
    query: {
      id: houseDetail.value.id,
      title: houseDetail.value.title,
      price: houseDetail.value.price,
      landlordId: houseDetail.value.owner_id
    }
  })
}

// 切换收藏状态
const toggleFavorite = async () => {
  if (isFavorited.value) {
    try{
      await deleteFavoriteService(houseDetail.value.id)
    }catch(error){
      console.error('取消收藏失败:', error)
    }
  } else {
    try{
      await addFavoriteService(houseDetail.value.id)  
      await addUserBehaviorService(houseDetail.value.id, 2)
    }catch(error){
      console.error('收藏失败:', error)
    }
  }
  isFavorited.value = !isFavorited.value
}

// 检查是否有预约
const hasAppointment = ref(false)

// 检查是否已签约
const hasContract = ref(false)

const HouseId = ref(1)

// 检查预约状态
const checkAppointment = async () => {
  try {
    const res = await checkAppointmentService(HouseId.value)
    hasAppointment.value = res.data 
  } catch (error) {
    console.error('检查状态失败:', error)
  }
}

// 检查签约状态
const checkContract = async () => {
  try {
    const res = await checkContractService(HouseId.value)
    hasContract.value = res.data
    console.log(res.data)
  } catch (error) {
    console.error('检查状态失败:', error)
  }
}

// 处理签约
const handleSignContract = () => {
  if (userInfo.value.isVerified !== 1) {
    ElMessageBox.confirm(
      '您还未完成实名认证，请先完成认证后再进行签约',
      '提示',
      {
        confirmButtonText: '去认证',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      router.push('/usercenter?activeMenu=verify')
    })
    return
  }

  if (hasContract.value) {
    ElMessage.info('您已签约该房源')
    return
  }
  router.push({
    path: '/contract',
    query: {
      id: houseDetail.value.id,
      title: houseDetail.value.title,
      price: houseDetail.value.price,
      landlordId: houseDetail.value.owner_id
    }
  })
}

// 初始化检查收藏状态
onMounted(async () => {
  HouseId.value = Number(route.params.id)
  isFavorited.value = favoriteStore.isFavorite(HouseId.value)
  getHouseDetail()
  let res = await getHouseImagesService(route.params.id)
  console.log(res.data)
  houseDetail.value.images = res.data
  checkAppointment()
  checkContract()
  checkCollect()
  getUserInfo() // 获取用户信息
})
</script>

<style scoped>
.house-detail {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

.detail-container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.main-content {
  display: flex;
  padding: 20px;
  gap: 30px;
}

.image-section {
  flex: 0 0 500px;
}

.main-image {
  position: relative;
  width: 100%;
  height: 350px;
  border-radius: 8px;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-nav {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}

.nav-btn {
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  padding: 10px;
  border-radius: 50%;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.thumbnail-list {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  overflow-x: auto;
}

.thumbnail {
  flex: 0 0 80px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.thumbnail.active {
  opacity: 1;
  border: 2px solid #409EFF;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-section {
  flex: 1;
  min-width: 0;
}

.house-brand {
  color: #ff4d4f;
  font-size: 16px;
  margin-bottom: 8px;
}

.title-section h1 {
  font-size: 24px;
  margin: 8px 0;
  color: #333;
}

.price-info {
  margin: 16px 0;
}

.current-price {
  font-size: 28px;
  color: #ff4d4f;
  font-weight: bold;
}

.price-unit {
  color: #666;
  font-size: 14px;
  margin-left: 4px;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  margin-left: 8px;
}

.promotion-section {
  margin: 16px 0;
}

.promotion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.promotion-tag {
  background: #fff1f0;
  color: #ff4d4f;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 12px;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
}

.basic-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  margin: 20px 0;
}

.info-item {
  text-align: center;
  margin-left: 30px;
}

.info-item .value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.info-item .label {
  font-size: 14px;
  color: #666;
}

.contact-section {
  margin-top: 24px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.phone-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.phone-number {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.edit-phone-btn {
  color: #1989fa;
  font-size: 14px;
  padding: 0;
}

.edit-phone-btn:hover {
  color: #409EFF;
}

.contact-actions {
  display: flex;
  justify-content: center;
}

.reserve-btn {
  width: 100%;
  height: 44px;
  background-color: #222;
  border-color: #222;
  font-size: 16px;
}

.reserve-btn:hover {
  background-color: #000;
  border-color: #000;
}

.sign-btn {
  width: 100%;
  height: 44px;
  background-color: #67c23a;
  border-color: #67c23a;
  font-size: 16px;
}

.sign-btn:hover {
  background-color: #85ce61;
  border-color: #85ce61;
}

.detail-tabs {
  padding: 20px;
  border-top: 1px solid #eee;
}

.facilities-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 20px 0;
}

.facility-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.roommates-list {
  padding: 20px 0;
}

.roommate-item {
  padding: 16px;
  border-radius: 8px;
  background: #f9f9f9;
  margin-bottom: 12px;
}

.roommate-item:last-child {
  margin-bottom: 0;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.room-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.tenant-info {
  color: #666;
  font-size: 14px;
}

.basic-info {
  display: flex;
  gap: 16px;
  margin-bottom: 4px;
}

.gender {
  color: #1989fa;
}

.occupation {
  color: #666;
}

.duration {
  font-size: 13px;
  color: #999;
}

.no-tenant {
  color: #999;
  font-size: 14px;
  font-style: italic;
}

.location-info {
  margin-top: 20px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.info-row {
  display: flex;
  margin-bottom: 12px;
}

.info-label {
  width: 80px;
  color: #666;
}

.info-value {
  color: #333;
  flex: 1;
}

@media screen and (max-width: 1024px) {
  .detail-container {
    margin: 0 20px;
  }
}

@media screen and (max-width: 900px) {
  .main-content {
    flex-direction: column;
  }

  .image-section {
    flex: none;
    width: 100%;
  }

  .main-image {
    height: 400px;
  }
}

@media screen and (max-width: 768px) {
  .facilities-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .contact-actions {
    flex-direction: column;
  }

  .basic-info {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 18px 0 18px;
}

.favorite-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.favorite-btn {
  font-size: 20px !important;
  padding: 10px 32px !important;
  height: 48px !important;
  border-radius: 8px !important;
  display: flex;
  align-items: center;
}

.favorite-btn .el-icon {
  font-size: 28px !important;
  margin-right: 8px;
}
</style> 