<template>
  <div class="search-page">
    <!-- 搜索框 -->
    <div class="search-header">
      <el-input
        v-model="searchForm.keyword"
        placeholder="请输入小区/商圈/地铁站等..."
        class="search-input"
      >
        <template #append>
          <el-button type="primary" @click="handleTopSearch">开始找房</el-button>
        </template>
      </el-input>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <!-- 找房方式 -->
      <div class="filter-row">
        <div class="filter-label">找房方式</div>
        <div class="filter-options">
          <el-radio-group v-model="filters.searchType">
            <el-radio-button label="区域">区域</el-radio-button>
            <el-radio-button label="地铁">地铁</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 区域/地铁条件 -->
      <div class="filter-row" v-if="filters.searchType === '区域'">
        <div class="filter-label">区域</div>
        <div class="filter-options">
          <el-radio-group v-model="filters.area">
            <el-radio v-for="area in wuhanAreas" :key="area" :label="area">{{ area }}</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div class="filter-row" v-else>
        <div class="filter-label">地铁</div>
        <div class="filter-options">
          <el-radio-group v-model="filters.metro">
            <el-radio v-for="line in wuhanMetroLines" :key="line" :label="line">{{ line }}</el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 类型 -->
      <div class="filter-row">
        <div class="filter-label">类型</div>
        <div class="filter-options">
          <el-radio-group v-model="filters.houseType">
            <el-radio label="不限">不限</el-radio>
            <el-radio label="合租">合租</el-radio>
            <el-radio label="整租">整租</el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 租金 -->
      <div class="filter-row">
        <div class="filter-label">租金</div>
        <div class="filter-options">
          <el-radio-group v-model="filters.priceRange">
            <el-radio label="不限">不限</el-radio>
            <el-radio label="1500元以下">1500元以下</el-radio>
            <el-radio label="1500-2500元">1500-2500元</el-radio>
            <el-radio label="2500-3500元">2500-3500元</el-radio>
            <el-radio label="3500-4500元">3500-4500元</el-radio>
            <el-radio label="4500-6000元">4500-6000元</el-radio>
            <el-radio label="6000元以上">6000元以上</el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 已选条件标签 -->
      <div v-if="selectedTags.length > 0" class="selected-tags">
        <span v-for="(tag, idx) in selectedTags" :key="tag.value" class="selected-tag">
          {{ tag.label }}
          <el-icon class="close-icon" @click="removeTag(tag)"><Close /></el-icon>
        </span>
        <el-button type="text" @click="clearAllFilters">清空条件</el-button>
      </div>
    </div>

    <!-- 房源列表 -->
    <div class="house-list">
      <el-card v-for="house in pagedHouseList" :key="house.id" class="house-card" @click="viewHouseDetail(house.id)">
        <img :src="house.images && house.images.length > 0 ? house.images[0].imageUrl : defaultImage" class="house-image" />
        <div class="house-content">
          <h3 class="house-title">{{ house.title }}</h3>
          <div class="house-meta">
            <span>{{ house.area }}㎡</span>
            <span v-if="house.floor && house.totalFloor"> |    {{ house.floor }}/{{ house.totalFloor }}层</span>
            <span v-if="house.direction"> |   朝{{ house.direction }}</span>
            <span v-if="house.description"> {{ house.description.slice(0, 18) }}{{ house.description.length > 18 ? '...' : '' }}</span>
          </div>
          <div class="house-price">¥{{ house.price }}<span class="unit">/月</span></div>
          <div class="house-feature-tags">
            <span v-for="tag in house.tags" :key="tag" class="feature-tag">{{ tag }}</span>
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
  </div>
</template>


<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getHouseImagesService,getSearchListService,getTopSearchListService } from '@/api/house.js'
import { Close } from '@element-plus/icons-vue'
const router = useRouter()
const defaultImage = 'https://yyxyyxyyx.oss-cn-wuhan-lr.aliyuncs.com/41e4cd66-61ae-442d-ac1c-5538cd817847.webp'

// 武汉区域和地铁
const wuhanAreas = [
  '江岸区', '江汉区', '硚口区', '汉阳区', '武昌区', '青山区', '洪山区',
  '东西湖区', '蔡甸区', '江夏区', 
]
const wuhanMetroLines = [
  '1号线', '2号线', '3号线', '4号线', '5号线', '6号线', '7号线', '8号线', '11号线', '16号线'
]

// 在 script setup 部分添加分页相关的数据
const currentPage = ref(1)
const pageSize = ref(6)  // 固定为6条
const total = ref(0)
const allHouseList = ref([]) // 存储所有房源数据

// 获取房屋列表
const getHouseList = async () => {
  try {
    const res = await getSearchListService()
    houseList.value = res.data
    total.value = houseList.value.length

    for(let i = 0; i < houseList.value.length; i++){
    let ans = await getHouseImagesService(houseList.value[i].id)
      houseList.value[i].images = ans.data
      console.log(houseList.value[i].images)  
    }
  } catch (error) {
    console.error('获取房屋列表失败:', error)
  }
}

onMounted(() => {
  getHouseList()
})

// 处理换页
const handleCurrentChange = (page) => {
  currentPage.value = page
}

const handleTopSearch = async () => {
  try{  
    const res = await getTopSearchListService(searchForm.keyword)
    houseList.value = res.data
    // 获取每个房源的图片
    for(let i = 0; i < houseList.value.length; i++) {
      let ans = await getHouseImagesService(houseList.value[i].id)
      houseList.value[i].images = ans.data
    }
    total.value = houseList.value.length
  }catch(error){
    console.error('关键词搜索房源失败:', error)
  }
}




// 搜索表单
const searchForm = reactive({
  keyword: ''
})

// 筛选条件
const filters = reactive({
  searchType: '区域',
  area: '',
  metro: '',
  houseType: '不限',
  priceRange: '不限'
})


const houseList = ref([])

const pagedHouseList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return houseList.value.slice(start, end)
})

// 计算已选标签
const selectedTags = computed(() => {
  const tags = []
  if (filters.searchType === '区域' && filters.area) tags.push({ label: filters.area, value: 'area' })
  if (filters.searchType === '地铁' && filters.metro) tags.push({ label: filters.metro, value: 'metro' })
  if (filters.houseType !== '不限') tags.push({ label: filters.houseType, value: 'houseType' })
  if (filters.priceRange !== '不限') tags.push({ label: filters.priceRange, value: 'priceRange' })
  return tags
})

// 移除单个标签
const removeTag = (tag) => {
  if (tag.value === 'area') filters.area = ''
  else if (tag.value === 'metro') filters.metro = ''
  else if (tag.value === 'houseType') filters.houseType = '不限'
  else if (tag.value === 'priceRange') filters.priceRange = '不限'
  handleSearch()
}

// 清空所有筛选
const clearAllFilters = () => {
  filters.area = ''
  filters.metro = ''
  filters.houseType = '不限'
  filters.priceRange = '不限'
  handleSearch()
}

const queryParams = ref({
  area: null,
  subway: null,
  type: null,
  minPrice: 0,
  maxPrice: 0
})

// 搜索处理
const handleSearch = async () => {
  try {
    // 构建查询参数
    if(filters.priceRange !== '不限'){
      // 处理价格范围字符串
      if(filters.priceRange === '1500元以下'){
        queryParams.value.minPrice = 0
        queryParams.value.maxPrice = 1500
      }
      else if(filters.priceRange === '6000元以上'){
        queryParams.value.minPrice = 6000
        queryParams.value.maxPrice = 999999
      }
      else {
        // 处理类似 "1500-2500元" 的格式
        const priceRange = filters.priceRange.replace('元', '')
        const [min, max] = priceRange.split('-')
        queryParams.value.minPrice = parseInt(min)
        queryParams.value.maxPrice = parseInt(max)
      }
    }
    else{
      queryParams.value.minPrice = -1
      queryParams.value.maxPrice = -1
    }

    if(filters.searchType === '区域'){
      queryParams.value.area = filters.area
      queryParams.value.subway = null
    }
    else{
      queryParams.value.subway = filters.metro 
      queryParams.value.area = null
    }
    if(filters.houseType !== '不限'){
      queryParams.value.type = filters.houseType
    }
    else{
      queryParams.value.type = null
    }
    // 调用后端接口
    const res = await getSearchListService(queryParams.value)
    
    houseList.value = res.data
    total.value = houseList.value.length
    // 获取每个房源的图片
    for(let i = 0; i < houseList.value.length; i++) {
      let ans = await getHouseImagesService(houseList.value[i].id)
      houseList.value[i].images = ans.data
    }
  } catch (error) {
    console.error('搜索房源失败:', error)
  }
}

// 监听筛选条件变化
watch(() => filters.searchType, () => handleSearch())
watch(() => filters.area, () => handleSearch())
watch(() => filters.metro, () => handleSearch())
watch(() => filters.houseType, () => handleSearch())
watch(() => filters.priceRange, () => handleSearch())

const viewHouseDetail = (id) => {
  router.push(`/house/${id}`)
}
</script>

<style scoped>
.search-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-size: 15px;
  background: #f7fafd;
  min-height: 100vh;
}

.search-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.search-input {
  width: 100%;
  max-width: 600px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(179, 216, 255, 0.08);
  background: #fff;
}

.search-input :deep(.el-input__inner) {
  font-size: 15px;
}

.search-input :deep(.el-button) {
  font-size: 15px;
}

.filter-section {
  background: #f4f8fc;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(179, 216, 255, 0.08);
  padding: 24px 24px 10px 24px;
  margin-bottom: 28px;
  border: 1.5px solid #eaf3fb;
}

.filter-row {
  display: flex;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eaf3fb;
  align-items: center;
}

.filter-row:last-child {
  border-bottom: none;
}

.filter-label {
  width: 80px;
  color: #6a7a8c;
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
}

.filter-options {
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 18px;
}

.filter-options :deep(.el-radio) {
  margin-right: 10px;
  margin-bottom: 8px;
  font-size: 15px;
  line-height: 1.2;
}

.filter-options :deep(.el-radio__label) {
  font-size: 15px;
  padding-left: 6px;
  color: #6a7a8c;
}

.filter-options :deep(.el-radio__input.is-checked .el-radio__inner) {
  background: #b3d8ff;
  border-color: #b3d8ff;
}

.filter-options :deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #6a8dff;
  font-weight: 600;
}

.filter-options :deep(.el-radio__inner) {
  width: 16px;
  height: 16px;
  border: 1.5px solid #dbeafe;
  transition: border-color 0.2s;
}

.price-input {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.price-input :deep(.el-input-number) {
  width: 90px;
  font-size: 14px;
}

.price-input :deep(.el-input-number__decrease),
.price-input :deep(.el-input-number__increase) {
  width: 22px;
  height: 22px;
  line-height: 22px;
}

.price-input :deep(.el-input__wrapper) {
  padding: 0 4px;
}

.price-input :deep(.el-input__inner) {
  font-size: 15px;
  height: 26px;
}

.price-input :deep(.el-button) {
  padding: 5px 12px;
  height: 26px;
  font-size: 15px;
  background: #b3d8ff;
  color: #fff;
  border: none;
  border-radius: 12px;
  transition: background 0.2s;
}
.price-input :deep(.el-button):hover {
  background: #6a8dff;
}

.separator {
  color: #b3b8c1;
  font-size: 15px;
  margin: 0 2px;
}

.unit {
  color: #8ca0b3;
  margin-right: 6px;
  font-size: 15px;
}

/* 多彩特色标签 */
.filter-options .el-tag {
  margin-right: 8px;
  cursor: pointer;
  font-size: 15px;
  padding: 0 14px;
  height: 32px;
  line-height: 30px;
  border-radius: 16px;
  border: none;
  background: #eaf3fb;
  color: #6a8dff;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(179,216,255,0.04);
}
.filter-options .el-tag.active,
.filter-options .el-tag:hover {
  background: #b3d8ff;
  color: #fff;
  box-shadow: 0 2px 8px rgba(106,141,255,0.10);
}

.selected-tags {
  margin: 18px 0 10px 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 16px;
}
.selected-tag {
  display: inline-flex;
  align-items: center;
  background: #eaf3fb;
  color: #6a8dff;
  border-radius: 16px;
  padding: 0 14px 0 10px;
  height: 32px;
  font-size: 15px;
  margin-right: 0;
  border: 1.5px solid #b3d8ff;
  font-weight: 500;
  transition: background 0.2s, color 0.2s, border 0.2s;
  box-shadow: 0 1px 4px rgba(179,216,255,0.04);
}
.selected-tag:hover {
  background: #b3d8ff;
  color: #fff;
  border: 1.5px solid #6a8dff;
}
.close-icon {
  margin-left: 6px;
  font-size: 16px;
  cursor: pointer;
  color: #b3d8ff;
  transition: color 0.2s;
}
.selected-tag:hover .close-icon {
  color: #fff;
}
.selected-tags .el-button {
  margin-left: 10px;
  color: #6a8dff;
  font-size: 15px;
  padding: 0 10px;
  height: 28px;
  border-radius: 14px;
  border: none;
  background: #eaf3fb;
  transition: background 0.2s, color 0.2s;
}
.selected-tags .el-button:hover {
  background: #b3d8ff;
  color: #fff;
}

.house-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 28px;
  margin-top: 24px;
}

.house-card {
  cursor: pointer;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 24px rgba(179,216,255,0.08);
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.2s;
  background: #f4f8fc;
  border: 2px solid #b3d8ff;
  min-height: 340px;
  display: flex;
  flex-direction: column;
}
.house-card:hover {
  transform: translateY(-8px) scale(1.025);
  box-shadow: 0 8px 32px rgba(106,141,255,0.13);
  border-color: #b3d8ff;
}

.house-image {
  width: 100%;
  height: 210px;
  object-fit: cover;
  border-radius: 0;
  background: #f7fafd;
  transition: filter 0.2s;
}
.house-card:hover .house-image {
  filter: brightness(0.96) saturate(1.1);
}

.house-content {
  padding: 5px 12px 5px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.house-title {
  font-size: 17px;
  color: #6a7a8c;
  margin-bottom: 6px;
  line-height: 1.4;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.house-meta {
  color: #8ca0b3;
  font-size: 13px;
  margin-bottom: 8px;
  line-height: 1.2;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.house-price {
  color: #6a8dff;
  font-size: 20px;
  font-weight: bold;
  /* margin-bottom: 8px; */
  margin-top: 2px;
}

.house-price .unit {
  font-size: 14px;
  color: #8ca0b3;
  font-weight: normal;
}

.house-feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 2px;
}

.feature-tag {
  background: #eaf3fb;
  color: #8ca0b3;
  border-radius: 8px;
  font-size: 13px;
  padding: 2px 10px;
  line-height: 20px;
  font-weight: 500;
  border: 1px solid #e0e7ef;
}

.card-actions {
  margin-top: 12px;
  text-align: right;
}
.card-actions .el-button {
  border-radius: 16px;
  font-size: 15px;
  padding: 4px 18px;
  background: #b3d8ff;
  color: #fff;
  border: none;
  transition: background 0.2s;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(179,216,255,0.10);
}
.card-actions .el-button:hover {
  background: #6a8dff;
}

/* 响应式布局调整 */
@media screen and (max-width: 1200px) {
  .house-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .house-list {
    grid-template-columns: 1fr;
  }
  .filter-section {
    padding: 16px 8px 6px 8px;
  }
  .house-content {
    padding: 12px 8px 8px 8px;
  }
  .search-header {
    margin-bottom: 16px;
  }
}

.pagination-container {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.pagination-container :deep(.el-pagination) {
  --el-pagination-button-bg-color: #f4f8fc;
  --el-pagination-hover-color: #6a8dff;
  --el-pagination-button-color: #6a7a8c;
  --el-pagination-button-disabled-color: #c0c4cc;
  --el-pagination-button-disabled-bg-color: #f4f8fc;
  --el-pagination-hover-bg-color: #eaf3fb;
}

.pagination-container :deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #6a8dff;
  color: #fff;
}

.pagination-container :deep(.el-pagination .el-select .el-input) {
  width: 110px;
}

.pagination-container :deep(.el-pagination .el-pagination__total) {
  margin-right: 16px;
  color: #6a7a8c;
}

.pagination-container :deep(.el-pagination .el-pagination__sizes) {
  margin-right: 16px;
}

.pagination-container :deep(.el-pagination .el-pagination__jump) {
  margin-left: 16px;
  color: #6a7a8c;
}

.pagination-container :deep(.el-pagination .el-pagination__jump .el-input__inner) {
  text-align: center;
  width: 50px;
  margin: 0 8px;
}

</style> 