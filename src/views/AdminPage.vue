<template>
  <div class="admin-page">
    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="activeMenu"
          class="admin-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="houses">
            <el-icon><House /></el-icon>
            <span>房源管理</span>
          </el-menu-item>
          <el-menu-item index="verify">
            <el-icon><Document /></el-icon>
            <span>实名认证审核</span>
          </el-menu-item>
          <el-menu-item index="posts">
            <el-icon><ChatDotRound /></el-icon>
            <span>帖子管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-main>
        <!-- 房源管理 -->
        <div v-if="activeMenu === 'houses'">
          <h2>房源管理</h2>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="待审核房源" name="review">
              <el-table :data="reviewHousesPage" style="width: 100%">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="title" label="标题" />
                <el-table-column prop="ownerId" label="房东id" />
                <el-table-column prop="price" label="价格">
                  <template #default="scope">
                    ¥{{ scope.row.price }}/月
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态">
                  <template #default="scope">
                    <el-tag type="warning">{{ scope.row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作">
                  <template #default="scope">
                    <el-button 
                      size="small" 
                      type="success" 
                      @click="handleHouseApprove(scope.row.id)"
                    >通过审核</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                v-model:current-page="reviewPage"
                v-model:page-size="reviewPageSize"
                :page-sizes="reviewPageSizes"
                layout="jumper, total, sizes, prev, pager, next"
                background
                :total="reviewTotal"
                @size-change="onReviewSizeChange"
                @current-change="onReviewCurrentChange"
                style="margin-top: 20px; justify-content: flex-end"
              />
            </el-tab-pane>
            <el-tab-pane label="已审核房源" name="approved">
              <el-table :data="approvedHousesPage" style="width: 100%">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="title" label="标题" />
                <el-table-column prop="ownerId" label="房东id" />
                <el-table-column prop="price" label="价格">
                  <template #default="scope">
                    ¥{{ scope.row.price }}/月
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态">
                  <template #default="scope">
                    <el-tag type="success">{{ scope.row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作">
                  <template #default="scope">
                    <el-button 
                      size="small" 
                      type="info" 
                      @click="viewHouseDetail(scope.row.id)"
                    >查看</el-button>
                    <el-button 
                      size="small" 
                      type="danger" 
                      @click="handleHouseUnpublish(scope.row.id)"
                    >下架</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                background
                layout="prev, pager, next"
                :total="approvedHouses.length"
                :page-size="approvedPageSize"
                :current-page="approvedPage"
                @current-change="val => approvedPage = val"
                style="margin-top: 20px; text-align: right;"
              />
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 实名认证审核 -->
        <div v-if="activeMenu === 'verify'">
          <h2>实名认证审核</h2>
          <el-table :data="verifyList" style="width: 100%">
            <el-table-column prop="id" label="用户ID" width="80" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="realName" label="真实姓名" />
            <el-table-column prop="idCardUrl" label="身份证照片">
              <template #default="scope">
                <el-image 
                  style="width: 100px; height: 60px"
                  :src="scope.row.idCardUrl"
                  :preview-src-list="[scope.row.idCardUrl]"
                  fit="cover"
                />
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="申请时间" />
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button 
                  size="small" 
                  type="success" 
                  @click="passVerify(scope.row.id)"
                >通过</el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="RejectVerify(scope.row.id)"
                >不通过</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 帖子管理 -->
        <div v-if="activeMenu === 'posts'">
          <h2>帖子管理</h2>
          <el-table :data="posts" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="author" label="作者" />
            <el-table-column prop="createTime" label="发布时间" />
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                  {{ scope.row.status === 1 ? '正常' : '已删除' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="handleViewPost(scope.row)"
                >查看</el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="handleDeletePost(scope.row.id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { House, Document, ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {getReviewHousesService, approveHouseService, getApprovedHousesService} from '@/api/house.js'
import {getVerifyListService, VerifyApproveService, VerifyRejectService} from '@/api/user.js'

const activeMenu = ref('houses')
const activeTab = ref('review')

// 帖子列表
const posts = ref([])

// 处理帖子查看
const handleViewPost = (post: any) => {
  ElMessage.info('查看帖子功能待实现')
}
// 通过审核
const passVerify = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要通过该用户的实名认证吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await VerifyApproveService(id)
    ElMessage.success('审核通过')
    getVerifyList() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('审核失败')
    }
  }
}

// 拒绝审核
const RejectVerify = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要拒绝该用户的实名认证吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await VerifyRejectService(id)
    ElMessage.success('已拒绝认证')
    getVerifyList() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}


// 处理帖子删除
const handleDeletePost = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该帖子吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    // TODO: 调用删除帖子接口
    ElMessage.success('帖子已删除')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 模拟数据
const users = ref([
  { id: 1, username: 'user1', role: '租户', status: '正常' },
  { id: 2, username: 'user2', role: '房东', status: '正常' },
])

const houses = ref([])

const orders = ref([
  { id: 'ORD001', house: '阳光公寓', tenant: 'user1', status: '进行中', createTime: '2024-03-20' },
  { id: 'ORD002', house: '海景房', tenant: 'user1', status: '已完成', createTime: '2024-03-19' },
])

const settings = ref({
  siteName: '租房系统',
  contactPhone: '400-123-4567',
  announcement: '系统维护通知：将于本周六凌晨2点进行系统维护，预计持续2小时。'
})

const approvedHouses = ref([]) // 已审核房源完整数据
const approvedPage = ref(1)
const approvedPageSize = ref(5)
const approvedHousesPage = computed(() => {
  const start = (approvedPage.value - 1) * approvedPageSize.value
  const end = start + approvedPageSize.value
  return approvedHouses.value.slice(start, end)
})

const reviewPage = ref(1)
const reviewPageSize = ref(5)
const reviewPageSizes = [5, 10, 20, 50]
const reviewTotal = computed(() => houses.value.length)
const reviewHousesPage = computed(() => {
  const start = (reviewPage.value - 1) * reviewPageSize.value
  const end = start + reviewPageSize.value
  return houses.value.slice(start, end)
})
const onReviewSizeChange = (size: number) => {
  reviewPageSize.value = size
  reviewPage.value = 1
}
const onReviewCurrentChange = (num: number) => {
  reviewPage.value = num
}

// 处理菜单选择
const handleMenuSelect = (key: string) => {
  activeMenu.value = key
}

// 用户管理相关方法
const handleUserEdit = (user: any) => {
  console.log('编辑用户:', user)
  ElMessage.success('编辑用户功能待实现')
}

const handleUserDisable = (user: any) => {
  console.log('禁用用户:', user)
  ElMessage.success('禁用用户功能待实现')
}

// 房源管理相关方法
const getReviewHouses = async () => {
  try {
    const result = await getReviewHousesService()
    houses.value = result.data
  } catch (error) {
    ElMessage.error('获取房源列表失败')
  }
}

const handleHouseApprove = (id: number) => {
  ElMessageBox.confirm(
    '确定要通过该房源的审核吗？',
    '审核确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await approveHouseService(id)
      ElMessage.success('审核通过')
      getReviewHouses() // 刷新列表
    } catch (error) {
      ElMessage.error('审核失败')
    }
  })
}

// 订单管理相关方法
const handleOrderDetail = (order: any) => {
  console.log('查看订单详情:', order)
  ElMessage.success('查看订单详情功能待实现')
}

// 系统设置相关方法
const saveSettings = () => {
  console.log('保存设置:', settings.value)
  ElMessage.success('设置保存成功')
}

// 示例：获取已审核房源数据
const getApprovedHouses = async () => {
  try {
    const result = await getApprovedHousesService()
    approvedHouses.value = result.data
  } catch (error) {
    ElMessage.error('获取房源列表失败')
  }
}

// 切换tab时加载对应数据
defineExpose({ approvedHousesPage })
watch(activeTab, (val) => {
  if (val === 'approved') {
    getApprovedHouses()
  }
})

// 查看详情和下架方法
const viewHouseDetail = (id: number) => {
  ElMessage.info('查看房源详情功能开发中，房源ID：' + id)
}
const handleHouseUnpublish = (id: number) => {
  ElMessageBox.confirm('确定要下架该房源吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('房源已下架（仅前端演示）')
    // 实际应调用下架接口并刷新列表
  })
}

// 实名认证列表
const verifyList = ref([])

// 获取实名认证待审核列表
const getVerifyList = async () => {
  try {
    const result = await getVerifyListService()
    verifyList.value = result.data
  } catch (error) {
    ElMessage.error('获取实名认证列表失败')
  }
}

// 处理实名认证通过
const handleVerifyApprove = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要通过该用户的实名认证吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await approveVerifyService(id)
    ElMessage.success('审核通过')
    getVerifyList() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('审核失败')
    }
  }
}

// 处理实名认证不通过
const handleVerifyReject = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要拒绝该用户的实名认证吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await rejectVerifyService(id)
    ElMessage.success('已拒绝认证')
    getVerifyList() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 监听菜单切换
watch(activeMenu, (val) => {
  if (val === 'verify') {
    getVerifyList()
  }
})

// 页面加载时获取待审核房源
onMounted(() => {
  getReviewHouses()
})
</script>

<style scoped>
.admin-page {
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

.admin-menu {
  height: 100%;
  border-right: none;
}

.el-main {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}
</style> 