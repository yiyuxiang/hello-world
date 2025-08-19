<template>
  <div class="landlord-page">
    <el-container>
      <!-- 侧边栏导航 -->
      <el-aside width="200px">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          @select="handleMenuSelect"
        >
          <el-menu-item index="publish">
            <el-icon><Plus /></el-icon>
            <span>发布房源</span>
          </el-menu-item>

          <el-menu-item index="houses">
            <el-icon><House /></el-icon>
            <span>房源管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主要内容区域 -->
      <el-main>
        <!-- 发布房源表单 -->
        <div v-if="activeMenu === 'publish'"  class="publish-form">
          <h2>发布房源</h2>
          <el-form :model="houseForm" label-width="100px" :rules="rules">
            <el-form-item label="房源标题">
              <el-input v-model="houseForm.title" placeholder="请输入房源标题"></el-input>
            </el-form-item>
            <el-form-item label="房源类型">
              <el-select v-model="houseForm.type" placeholder="请选择房源类型">
                <el-option label="整租" value="整租"></el-option>
                <el-option label="合租" value="合租"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="月租金">
              <el-input-number v-model="houseForm.price" :min="0" :step="100"></el-input-number>
            </el-form-item>
            <el-form-item label="房屋面积">
              <el-input-number v-model="houseForm.area" :min="0" :step="1"></el-input-number>
            </el-form-item>
            <el-form-item label="所在城市">
              <el-input v-model="houseForm.city" placeholder="请输入城市"></el-input>
            </el-form-item>
            <el-form-item label="所在区域">
              <el-input v-model="houseForm.district" placeholder="请输入区域"></el-input>
            </el-form-item>
            <el-form-item label="详细地址">
              <el-input v-model="houseForm.address" placeholder="请输入详细地址"></el-input>
            </el-form-item>
            <el-form-item label="最近地铁线">
              <el-select v-model="houseForm.subway" placeholder="请选择最近的地铁线">
                <el-option label="1号线" value="1号线"></el-option>
                <el-option label="2号线" value="2号线"></el-option>
                <el-option label="3号线" value="3号线"></el-option>
                <el-option label="4号线" value="4号线"></el-option>
                <el-option label="5号线" value="5号线"></el-option>
                <el-option label="6号线" value="6号线"></el-option>
                <el-option label="7号线" value="7号线"></el-option>
                <el-option label="8号线" value="8号线"></el-option>
                <el-option label="11号线" value="11号线"></el-option>
                <el-option label="16号线" value="16号线"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="所在楼层">
              <el-input-number v-model="houseForm.floor" :min="0" :step="1"></el-input-number>
            </el-form-item>
            <el-form-item label="总楼层">
              <el-input-number v-model="houseForm.total_floor" :min="0" :step="1"></el-input-number>
            </el-form-item>
            <el-form-item label="朝向">
              <el-select v-model="houseForm.direction" placeholder="请选择朝向">
                <el-option label="东" value="东"></el-option>
                <el-option label="南" value="南"></el-option>
                <el-option label="西" value="西"></el-option>
                <el-option label="北" value="北"></el-option>
                <el-option label="东南" value="东南"></el-option>
                <el-option label="西南" value="西南"></el-option>
                <el-option label="东北" value="东北"></el-option>
                <el-option label="西北" value="西北"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="房屋描述">
              <el-input type="textarea" v-model="houseForm.description" rows="4"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitHouse">发布房源</el-button>
            </el-form-item>
          </el-form>
        </div>


        <!-- 房源管理列表 -->
        <div v-if="activeMenu === 'houses'" class="houses-list" @click="fetchHouses">
          <h2>房源管理</h2>
          <el-table :data="houses" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="房源编号" width="220"></el-table-column>
            <el-table-column prop="title" label="房源标题" width="320"></el-table-column>
            <el-table-column prop="price" label="租金" width="220">
              <template #default="scope">
                ¥{{ scope.row.price }}/月
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="450">
              <template #default="scope">
                <el-button size="small" @click="uploadHouseImages(scope.row)">上传照片</el-button>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="viewHouseImages(scope.row)"
                >
                  查看图片
                </el-button>
                <el-button 
                  type="info" 
                  size="small" 
                  @click="editHouse(scope.row)"
                >
                  编辑房源
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="deleteHouse(scope.row.id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 上传照片对话框 -->
        <el-dialog
          v-model="uploadDialogVisible"
          title="上传房源照片"
          width="50%"
        >
          <el-upload
            :auto-upload="true"
            action="/api/upload"
            name="file"
            :headers="{'Authorization': tokenStore.token}"
            list-type="picture-card"
            :on-success="handleUploadSuccess"
            :on-remove="handleRemove"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="uploadDialogVisible = false">关闭</el-button>
            </span>
          </template>
        </el-dialog>

        <!-- 查看图片对话框 -->
        <el-dialog
          v-model="viewImagesDialogVisible"
          title="房源图片"
          width="70%"
        >
          <el-carousel :interval="4000" type="card" height="400px">
            <el-carousel-item v-for="(image, index) in currentHouseImages" :key="index">
              <img :src="image.imageUrl" style="width: 100%; height: 100%; object-fit: cover;">
            </el-carousel-item>
          </el-carousel>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="viewImagesDialogVisible = false">关闭</el-button>
            </span>
          </template>
        </el-dialog>

        <!-- 编辑房源对话框 -->
        <el-dialog
          v-model="editDialogVisible"
          title="编辑房源"
          width="50%"
        >
          <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
            <el-form-item label="房源标题" prop="title">
              <el-input v-model="editForm.title"></el-input>
            </el-form-item>
            <el-form-item label="月租金" prop="price">
              <el-input-number v-model="editForm.price" :min="0" :step="100"></el-input-number>
            </el-form-item>
            <el-form-item label="房屋面积" prop="area">
              <el-input-number v-model="editForm.area" :min="0" :step="1"></el-input-number>
            </el-form-item>
            <el-form-item label="所在城市" prop="city">
              <el-input v-model="editForm.city"></el-input>
            </el-form-item>
            <el-form-item label="所在区域" prop="district">
              <el-input v-model="editForm.district"></el-input>
            </el-form-item>
            <el-form-item label="详细地址" prop="address">
              <el-input v-model="editForm.address"></el-input>
            </el-form-item>
            <el-form-item label="所在楼层" prop="floor">
              <el-input-number v-model="editForm.floor" :min="0" :step="1"></el-input-number>
            </el-form-item>
            <el-form-item label="总楼层" prop="totalFloor">
              <el-input-number v-model="editForm.totalFloor" :min="0" :step="1"></el-input-number>
            </el-form-item>
            <el-form-item label="朝向" prop="direction">
              <el-select v-model="editForm.direction">
                <el-option label="东" value="东"></el-option>
                <el-option label="南" value="南"></el-option>
                <el-option label="西" value="西"></el-option>
                <el-option label="北" value="北"></el-option>
                <el-option label="东南" value="东南"></el-option>
                <el-option label="东北" value="东北"></el-option>
                <el-option label="西南" value="西南"></el-option>
                <el-option label="西北" value="西北"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="房屋描述" prop="description">
              <el-input type="textarea" v-model="editForm.description" rows="4"></el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="editDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="updateHouse">确定</el-button>
            </span>
          </template>
        </el-dialog>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, House } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { 
  getLandlordHousesService, 
  addHouseService, 
  updateHouseService, 
  deleteHouseService,
  addHouseImageService,
  getHouseImagesService
} from '@/api/house.js'
import { useTokenStore } from '@/stores/token.js'
import { getUserInfoService } from '@/api/user.js'

const router = useRouter()
const tokenStore = useTokenStore()
const loading = ref(false)
const activeMenu = ref('publish')
const houseFormRef = ref(null)
const editFormRef = ref(null)
const editDialogVisible = ref(false)
const uploadDialogVisible = ref(false)
const viewImagesDialogVisible = ref(false)
const currentHouseImages = ref([])
const currentHouse = ref({})
const isCover = ref(1)

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入房源标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择房源类型', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入月租金', trigger: 'blur' }
  ],
  area: [
    { required: true, message: '请输入房屋面积', trigger: 'blur' }
  ],
  city: [
    { required: true, message: '请输入所在城市', trigger: 'blur' }
  ],
  district: [
    { required: true, message: '请输入所在区域', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ],
  subway: [
    { required: true, message: '请选择最近的地铁线', trigger: 'change' }
  ]
}

// 房源表单数据
const houseForm = ref({
  id: 1,
  title: '',
  price: 0,
  area: 0,
  address: '',
  city: '',
  district: '',
  description: '',
  floor: 0,
  totalFloor: 0,
  direction: '',
  type: '',
  subway: ''
})

// 编辑表单数据
const editForm = ref({
  id: 1,
  title: '',
  price: 0,
  area: 0,
  city: '',
  district: '',
  address: '',
  floor: 0,
  totalFloor: 0,
  direction: '',
  description: ''
})

// 房源列表数据
const houses = ref([])

// 用户信息
const userInfo = ref({
  isVerified: 0
})

// 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await getUserInfoService()
    userInfo.value = res.data
    if (userInfo.value.isVerified !== 1) {
      ElMessageBox.alert(
        '您还未完成实名认证，请先完成认证后再访问房东页面',
        '提示',
        {
          confirmButtonText: '去认证',
          type: 'warning',
          callback: () => {
            router.push('/usercenter?activeMenu=verify')
          }
        }
      )
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 处理菜单选择
const handleMenuSelect = (index) => {
  if (userInfo.value.isVerified !== 1) {
    ElMessageBox.alert(
      '您还未完成实名认证，请先完成认证后再访问房东页面',
      '提示',
      {
        confirmButtonText: '去认证',
        type: 'warning',
        callback: () => {
          router.push('/usercenter?activeMenu=verify')
        }
      }
    )
    return
  }
  activeMenu.value = index
  if (index === 'houses') {
    fetchHouses()
  }
}

// 处理图片上传成功
const handleUploadSuccess = (file) => {
  addHouseImageService({
    houseId: currentHouse.value.id,
    imageUrl: file.data,
    isCover: isCover.value,
    createTime: new Date().toISOString()
  })
  ElMessage.success('图片上传成功')
}
// 获取房源列表
const fetchHouses = async () => {
  loading.value = true
  try {
    const res = await getLandlordHousesService()
    houses.value = res.data
  } catch (error) {
    console.error('获取房源列表失败:', error)
    ElMessage.error('获取房源列表失败')
  } finally {
    loading.value = false
  }
}

// 上传房源照片
const uploadHouseImages = async (house) => {
  let res = await getHouseImagesService(house.id)

  if(res.data != null){
    // 存在封面 ，将isCover设置为0
    isCover.value = 0
  }
  else {
    isCover.value = 1
  }
  currentHouse.value = house
  uploadDialogVisible.value = true
}

// 查看房源图片
const viewHouseImages = async (house) => {
  let res = await getHouseImagesService(house.id)
  currentHouseImages.value = res.data
  
  viewImagesDialogVisible.value = true
}


// 处理图片上传成功
const handleUploadSuccessPlus = (file) => {
  if (!currentHouse.value.images) {
    currentHouse.value.images = []
  }
  currentHouse.value.images.push(file.data)
  ElMessage.success('图片上传成功')
}

// 处理图片删除
const handleRemovePlus = (file) => {
  const index = currentHouse.value.images.indexOf(file.url)
  if (index !== -1) {
    currentHouse.value.images.splice(index, 1)
  }
}


// 提交房源信息
const submitHouse = () => {
  if (userInfo.value.isVerified !== 1) {
    ElMessageBox.alert(
      '您还未完成实名认证，请先完成认证后再发布房源',
      '提示',
      {
        confirmButtonText: '去认证',
        type: 'warning',
        callback: () => {
          router.push('/usercenter?activeMenu=verify')
        }
      }
    )
    return
  }

  // 调用接口
  addHouseService(houseForm.value)
  
  // 重置表单
  Object.assign(houseForm.value, {
    title: '',
    price: 0,
    area: 0,
    city: '',
    district: '',
    address: '',
    floor: 0,
    totalFloor: 0,
    direction: '',
    description: '',
    type: '',
    subway: ''
  })

  ElMessage.success('房源发布成功,请等待审核!')
}


// 更新房源
const updateHouse = async () => {
  if (!editFormRef.value) return

  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        console.log(editForm.value)
        await updateHouseService(editForm.value)        
        ElMessage.success('房源更新成功')
        editDialogVisible.value = false
        fetchHouses()
        
      } catch (error) {
        console.error('更新房源失败:', error)
        ElMessage.error('更新房源失败')
      }
    }
  })
}

// 删除房源
const deleteHouse = (id) => {
  ElMessageBox.confirm(
    '确定要删除这个房源吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteHouseService(id)
      ElMessage.success('房源删除成功')
      fetchHouses()
    } catch (error) {
      console.error('删除房源失败:', error)
      ElMessage.error('删除房源失败')
    }
  })
}

// 获取状态对应的类型
const getStatusType = (status) => {
  const types = {
    '待出租': 'info',
    '已出租': 'success',
    '已下架': 'danger'
  }
  return types[status] || 'info'
}

// 编辑房源
const editHouse = (house) => {
  editForm.value = {
    id: house.id,
    title: house.title,
    price: house.price,
    area: house.area,
    city: house.city,
    district: house.district,
    address: house.address,
    floor: house.floor,
    totalFloor: house.totalFloor,
    direction: house.direction,
    description: house.description
  }
  editDialogVisible.value = true
}

// 在组件挂载时检查实名认证状态
onMounted(async () => {
  await getUserInfo()
  if (userInfo.value.isVerified !== 1) {
    router.push('/usercenter?activeMenu=verify')
  }
})

</script>

<style scoped>
.landlord-page {
  height: 100vh;
  background-color: #f5f7fa;
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
}

.el-menu-vertical {
  border-right: none;
}

.el-main {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  font-weight: 500;
  color: #333;
}

.publish-form {
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.houses-list {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-table {
  margin-top: 20px;
}

.el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.el-upload:hover {
  border-color: #409EFF;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 