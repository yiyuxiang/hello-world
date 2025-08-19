<template>
  <div class="user-center">
    <!-- 左侧导航 -->
    <div class="side-nav">
      <div class="user-info">
        <el-avatar :size="80" :src="userInfo.avatar" />
        <h3>{{ userInfo.nickname }}</h3>
        <p v-if="userInfo.role === 'tenant'" class="role-tag">租客</p>
        <p v-if="userInfo.role === 'landlord'" class="role-tag">房东</p>
        <p v-if="userInfo.role === 'admin'" class="role-tag">管理员</p>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="menu"
        @select="handleSelect"
      >
        <el-sub-menu index="personal">
          <template #title>
            <el-icon><User /></el-icon>
            <span>个人信息</span>
          </template>
          <el-menu-item index="info">基本信息</el-menu-item>
          <el-menu-item index="verify">认证信息</el-menu-item>
        </el-sub-menu>

        <!-- 收藏模块 -->
        <el-menu-item v-if="userInfo.role === 'tenant'" index="favorites" @click="getFavoriteList">
          <el-icon><Star /></el-icon>
          <span>我的收藏</span>
        </el-menu-item>

        <!-- 租客功能模块 -->
        <template v-if="userInfo.role === 'tenant'">
          <el-sub-menu index="housing">
            <template #title>
              <el-icon><House /></el-icon>
              <span>租房信息</span>
            </template>
            
            <el-menu-item index="appointments" @click="getTenantAppointments">查看/取消预约</el-menu-item>
            <el-menu-item index="contracts" @click="getUserContractList">查看/取消签约</el-menu-item>
          </el-sub-menu>
        </template>

        <!-- 房东功能模块 -->
        <template v-if="userInfo.role === 'landlord'">
          <el-sub-menu index="management">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>房源信息</span>
            </template>
            <el-menu-item index="rental-manage"  @click="getLandlordAppointments">租赁预约</el-menu-item>
            <el-menu-item index="tenant-manage" @click="getLandlordContractList">合同管理</el-menu-item>
          </el-sub-menu>
        </template>

        <!-- 管理员功能模块 --> 
        <template v-if="userInfo.role === 'admin'">
          <el-sub-menu index="admin">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>管理员功能</span>
            </template>
            
            <el-menu-item index="user-manage">用户管理</el-menu-item>
            <el-menu-item index="house-manage">房源管理</el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
      
    </div>

    

    <!-- 右侧内容区 -->
    <div class="content">
      <!-- 基本信息 -->
      <div v-if="activeMenu === 'info'" class="info-form">
        <h2>基本信息</h2>
        <el-form :model="userInfo" label-width="80px">
          <div class="avatar-upload">
            <h3>头像</h3>
            <div class="avatar-container">
              <el-avatar :size="100" :src="userInfo.avatar" />
              <el-upload
                class="upload-btn"
                name="file"
                :auto-upload="true"
                action="/api/upload"
                :headers="{'Authorization': tokenStore.token}"
                :on-success="handleAvatarChange"
                :show-file-list="false"
              >
                <el-button type="primary">更换头像</el-button>
                <div class="upload-tip">支持JPG、PNG格式，文件小于3M</div>
              </el-upload>
            </div>
          </div>

          <el-form-item label="昵称">
            <div class="input-with-button">
              <el-input v-model="new_nickname" placeholder="请输入昵称" />
              <el-button type="primary" plain @click="handleUpdateUserInfo">保存</el-button>
            </div>
          </el-form-item>

          <el-form-item label="手机号">
            <div class="input-with-button">
              <el-input v-model="new_phone" placeholder="请输入新手机号" />
              <el-button type="primary" plain @click="handleUpdateUserInfo">保存</el-button>
            </div>
          </el-form-item>

          <el-form-item label="邮箱">
            <div class="input-with-button">
              <el-input v-model="new_email" placeholder="请输入邮箱" />
              <el-button type="primary" plain @click="handleUpdateUserInfo">保存</el-button>
            </div>
          </el-form-item>

          <el-form-item label="密码">
            <div class="input-with-button">
              <el-input value="********" type="password" disabled />
              <el-button type="primary" plain @click="showPasswordDialog">修改密码</el-button>
            </div>
          </el-form-item>
        </el-form>

        <!-- 修改密码对话框 -->
        <el-dialog
          v-model="passwordDialogVisible"
          title="修改密码"
          width="500px"
        >
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
          >
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                show-password
                placeholder="请输入当前密码"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="请输入新密码"
              />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="请再次输入新密码"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="passwordDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handlePasswordChange">确认修改</el-button>
            </span>
          </template>
        </el-dialog>
      </div>

      <!-- 证件信息 -->
      <div v-if="activeMenu === 'verify'" class="verify-info">
        <div class="verify-container">
          <!-- 左侧实名认证 -->
          <div class="verify-section">
            <h2>实名认证</h2>
            <!-- 已通过认证 -->
            <div v-if="userInfo.isVerified === 1" class="verify-status">
              <el-result
                icon="success"
                title="实名认证已通过"
                sub-title="您的实名认证信息已通过审核"
              >
                <template #extra>
                  <div class="verify-info-details">
                    <p>真实姓名：{{ userInfo.realName }}</p>
                    <p>认证时间：{{ userInfo.updateTime }}</p>
                  </div>
                </template>
              </el-result>
            </div>
            <!-- 未认证 -->
            <el-form v-else :model="userInfo" label-width="100px">
              <el-form-item label="真实姓名">
                <el-input v-model="userInfo.realName" placeholder="请输入真实姓名" />
              </el-form-item>
              <el-form-item label="身份证照片">
                <el-upload
                  class="upload-demo"
                  action="/api/upload"
                  name="file"
                  :headers="{'Authorization': tokenStore.token}"
                  list-type="picture-card"
                  :auto-upload="true"
                  :on-success="handleIdCardChange"
                >
                  <el-button type="primary">上传</el-button>
                  <template #tip>
                    <div class="el-upload__tip">请上传身份证正面照片，jpg/png格式，≤5MB</div>
                  </template>
                </el-upload>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitVerify">提交认证</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>

      <!-- 租房管理相关组件 -->
      <div v-if="activeMenu === 'view-houses'" class="house-info">
        <h2>我的房源信息</h2>
        <!-- 这里添加房源信息列表组件 -->
      </div>

      <!-- 租户预约列表 -->
      <div v-if="activeMenu === 'appointments'" class="appointments-section">
        <h2>我的预约</h2>
        <div class="appointments-list" v-if="appointments.length">
          <el-card v-for="appointment in appointments" :key="appointment.id" class="appointment-card">
            <div class="appointment-header">
              <h3 class="house-title" @click="viewHouseDetail(appointment.houseId)">
                房源编号 : {{ appointment.houseId }}
              </h3>
              <el-tag :type="getStatusType(appointment.status)">
                {{ getStatusText(appointment.status) }}
              </el-tag>
            </div>
            <div class="appointment-info">
              <div class="info-item">
                <span class="label">房东id ：</span>
                <span class="value">{{ appointment.landlordId }}</span>
              </div>
              <div class="info-item">
                <span class="label">预约时间：</span>
                <span class="value">{{ appointment.appointmentTime }}</span>
              </div>
              <div class="info-item">
                <span class="label">联系电话：</span>
                <span class="value">{{ appointment.telephone }}</span>
              </div>
              <div class="info-item" v-if="appointment.remark">
                <span class="label">备注信息：</span>
                <span class="value">{{ appointment.remark }}</span>
              </div>
            </div>
            <div class="appointment-actions">
              <el-button 
                v-if="appointment.status === 0"
                type="danger" 
                text 
                @click="handleCancelAppointment(appointment.id, appointment.appointmentTime)"
              >
                取消预约
              </el-button>
              <el-button 
                v-if="appointment.status === 1"
                type="primary" 
                @click="viewHouseDetail(appointment.houseId)"
              >
                签约
              </el-button>
            </div>
          </el-card>
        </div>
        <div class="empty-state" v-else>
          <el-empty description="暂无预约记录">
            <el-button type="primary" @click="router.push('/search')">
              去找房
            </el-button>
          </el-empty>
        </div>
      </div>

      <!-- 房东预约管理 -->
      <div v-if="activeMenu === 'rental-manage'" class="rental-manage">
        <h2>租赁预约管理</h2>
        <div class="appointments-list" v-if="appointments.length">
          <el-card v-for="appointment in appointments" :key="appointment.id" class="appointment-card">
            <div class="appointment-header">
              <h3 class="house-title" @click="viewHouseDetail(appointment.houseId)">
                房源编号 : {{ appointment.houseId }}
              </h3>
              <el-tag :type="getStatusType(appointment.status)">
                {{ getStatusText(appointment.status) }}
              </el-tag>
            </div>
            <div class="appointment-info">
              <div class="info-item">
                <span class="label">租客id ：</span>
                <span class="value">{{ appointment.tenantId }}</span>
              </div>
              <div class="info-item">
                <span class="label">预约时间：</span>
                <span class="value">{{ appointment.appointmentTime }}</span>
              </div>
              <div class="info-item">
                <span class="label">租客电话：</span>
                <span class="value">{{ appointment.telephone }}</span>
              </div>
              <div class="info-item" v-if="appointment.remark">
                <span class="label">备注信息：</span>
                <span class="value">{{ appointment.remark }}</span>
              </div>
            </div>
            <div class="appointment-actions">
              <el-button 
                v-if="appointment.status === 0"
                type="success" 
                @click="handleConfirmAppointment(appointment.id)"
              >
                确认预约
              </el-button>
              <el-button 
                v-if="appointment.status === 0"
                type="danger" 
                @click="handleRejectAppointment(appointment.id)"
              >
                拒绝预约
              </el-button>
            </div>
          </el-card>
        </div>
        <div class="empty-state" v-else>
          <el-empty description="暂无预约记录" />
        </div>
      </div>

      <div v-if="activeMenu === 'contracts'" class="contracts">
        <h2>我的合同</h2>
        <div class="appointments-list" v-if="contracts.length">
          <el-card v-for="contract in contracts" :key="contract.id" class="appointment-card">
            <div class="appointment-header">
              <h3 class="house-title" @click="viewHouseDetail(contract.houseId)">
                房源编号 : {{ contract.houseId }}
              </h3>
              <el-tag :type="getContractStatusType(contract.status)">
                {{ getContractStatusText(contract.status) }}
              </el-tag>
            </div>
            <div class="appointment-info">
              <div class="info-item">
                <span class="label">房东id ：</span>
                <span class="value">{{ contract.landlordId }}</span>
              </div>
              <div class="info-item">
                <span class="label">起始日期：</span>
                <span class="value">{{ contract.startDate }}</span>
              </div>
              <div class="info-item">
                <span class="label">结束日期：</span>
                <span class="value">{{ contract.endDate }}</span>
              </div>
              <div class="info-item">
                <span class="label">总金额：</span>
                <span class="value">¥{{ contract.totalPrice }}</span>
              </div>
            </div>
            <div class="appointment-actions">
              <el-button 
                v-if="contract.status === 1"
                type="danger" 
                text 
                @click="handleApplyTerminate(contract.id)"
              >
                申请终止
              </el-button>
            </div>
          </el-card>
        </div>
        <div class="empty-state" v-else>
          <el-empty description="暂无合同记录" />
        </div>
      </div>

      

      <!-- 房东功能组件 -->
      <div v-if="activeMenu === 'tenant-manage'" class="tenant-manage">
        <h2>我的合同</h2>
        <div class="appointments-list" v-if="contracts.length">
          <el-card v-for="contract in contracts" :key="contract.id" class="appointment-card">
            <div class="appointment-header">
              <h3 class="house-title" @click="viewHouseDetail(contract.houseId)">
                房源编号 : {{ contract.houseId }}
              </h3>
              <el-tag :type="getContractStatusType(contract.status)">
                {{ getContractStatusText(contract.status) }}
                </el-tag>
            </div>
            <div class="appointment-info">
              <div class="info-item">
                <span class="label">租客id ：</span>
                <span class="value">{{ contract.tenantId }}</span>
              </div>
              <div class="info-item">
                <span class="label">起始日期：</span>
                <span class="value">{{ contract.startDate }}</span>
              </div>
              <div class="info-item">
                <span class="label">结束日期：</span>
                <span class="value">{{ contract.endDate }}</span>
              </div>
              <div class="info-item">
                <span class="label">总金额：</span>
                <span class="value">¥{{ contract.totalPrice }}</span>
              </div>
            </div>
            <div class="appointment-actions">
              <template v-if="contract.status === 0">
                <el-button 
                  type="success" 
                  @click="handleConfirmContract(contract.id)"
                >
                  同意签约
                </el-button>
                <el-button 
                  type="danger" 
                  @click="handleRejectContract(contract.id)"
                >
                  拒绝签约
                </el-button>
              </template>
              <template v-if="contract.status === 3">
                <el-button 
                  type="success" 
                  @click="handleConfirmTerminate(contract.id)"
                >
                  同意终止
                </el-button>
                <el-button 
                  type="danger" 
                  @click="handleRejectTerminate(contract.id)"
                >
                  拒绝终止
                </el-button>
              </template>
            </div>
          </el-card>
        </div>
        <div class="empty-state" v-else>
          <el-empty description="暂无合同记录" />
        </div>  
      </div>

      <!-- 我的收藏 -->
      <div v-if="activeMenu === 'favorites'" class="favorites-section">
        <h2>我的收藏</h2>
        <div class="appointments-list" v-if="favorites.length">
          <el-card v-for="favorite in favorites" :key="favorite.id" class="appointment-card">
            <div class="appointment-header">
              <h3 class="house-title" @click="viewHouseDetail(favorite.id)">
                房源编号 : {{ favorite.id }}
              </h3>
              <el-tag type="info">已收藏</el-tag>
            </div>
            <div class="appointment-info">
              <div class="info-item">
                <span class="label">房源标题：</span>
                <span class="value">{{ favorite.title }}</span>
              </div>
              <div class="info-item">
                <span class="label">价格：</span>
                <span class="value">¥{{ favorite.price }}/月</span>
              </div>
              <div class="info-item" v-if="favorite.createTime">
                <span class="label">房源地址：</span>
                <span class="value">{{ favorite.address }}</span>
              </div>
            </div>
            <div class="appointment-actions">
              <el-button 
                type="danger" 
                text 
                @click="removeFavorite(favorite.id)"
              >
                取消收藏
              </el-button>
            </div>
          </el-card>
        </div>
        <div class="empty-state" v-else>
          <el-empty description="暂无收藏的房源">
            <el-button type="primary" @click="router.push('/search')">
              去找房
            </el-button>
          </el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { getUserInfoService, updatePasswordService, updateUserInfoService,updateUserAvatarService,verifyService  } from '@/api/user.js'
import { getAppointmentListService,cancelAppointmentService, getLandlordAppointmentListService,
   confirmAppointmentService, rejectAppointmentService, getUserContractListService, 
   getLandlordContractListService,confirmContractService,rejectContractService,applyTerminateContractService,
   agreeTerminateContractService,disagreeTerminateContractService } from '@/api/appointment.js'
import { getFavoriteListService, deleteFavoriteService } from '@/api/house.js'
import {useTokenStore} from '@/stores/token.js'
const router = useRouter()
const tokenStore = useTokenStore()

// 当前选中的菜单
const activeMenu = ref('info')

// 新昵称
const new_nickname = ref('')
// 新手机号
const new_phone = ref('')
// 新邮箱
const new_email = ref('')


// 用户信息
const userInfo = ref({
  id: '',
  username: '',
  password: '',
  nickname: '',
  avatar: '',
  phone: '',
  email: '',
  role: 'tenant',
  status: 1,
  createTime: '',
  updateTime: '',
  introduction: '',
  idCardUrl: '',
  stuCardUrl: '',
  realName: '',
  isVerified: 0,
  isStudent: 0
})

// 收藏列表
const favorites = ref([]) 
// 获取预约记录
const appointments = ref([])

// 获取签约记录
const contracts = ref([])

const getAppointments = async () => {
  try {
    let res
    let res1
    if (userInfo.value.role === 'tenant') {
      res = await getAppointmentListService()
      res1 = await getUserContractListService()
    } else if (userInfo.value.role === 'landlord') {
      res = await getLandlordAppointmentListService()
      res1 = await getLandlordContractListService()
    }
    appointments.value = res.data
    contracts.value = res1.data
  } catch (error) {
    console.error('获取预约列表失败:', error)
    ElMessage.error('获取预约列表失败')
  }
}

onBeforeMount(() => {
  getAppointments()
})

// 获取收藏房源列表
const getFavoriteList = async () => {
  try{  
    const res = await getFavoriteListService()
    favorites.value = res.data
    console.log(favorites.value)
  }catch(error){
    console.error('获取收藏房源列表失败:', error)
    ElMessage.error('获取收藏房源列表失败')
  }
}



// 修改密码相关
const passwordDialogVisible = ref(false)
const passwordFormRef = ref(null)
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码验证规则
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.value.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}
const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 显示修改密码对话框
const showPasswordDialog = () => {
  passwordDialogVisible.value = true
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

// 处理密码修改
const handlePasswordChange = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    await updatePasswordService({
      old_pwd: passwordForm.value.currentPassword,
      new_pwd: passwordForm.value.newPassword,
      re_pwd: passwordForm.value.confirmPassword
    })
    ElMessage.success('密码修改成功')
    passwordDialogVisible.value = false
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '密码修改失败')
  }
}

// 处理菜单选择
const handleSelect = (index) => {
  activeMenu.value = index
}

// 获取用户信息
const getUserInfo = async () => {
  let res = await getUserInfoService()
  userInfo.value = res.data
  console.log('用户信息:', userInfo.value)
  // 初始化表单数据
  new_nickname.value = userInfo.value.nickname || ''
  new_phone.value = userInfo.value.phone || ''
  new_email.value = userInfo.value.email || ''
}
onBeforeMount(() => {
  getUserInfo()
})

// 修改用户基本信息
const handleUpdateUserInfo = async () => {
  // 昵称验证
  if (!new_nickname.value) {
    ElMessage.warning('请输入新的昵称')
    return
  }
  if (new_nickname.value.length < 5 || new_nickname.value.length > 20) {
    ElMessage.warning('昵称长度应在5-20个字符之间')
    return
  }

  // 手机号验证
  if (!new_phone.value) { 
    ElMessage.warning('请输入新的手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(new_phone.value)) {
    ElMessage.warning('请输入正确的手机号格式')
    return
  }

  // 邮箱验证
  if (!new_email.value) {
    ElMessage.warning('请输入新的邮箱')
    return
  }
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(new_email.value)) {
    ElMessage.warning('请输入正确的邮箱格式')
    return
  }
  
  try {
    await updateUserInfoService({
      id: userInfo.value.id,
      username: userInfo.value.username,
      nickname: new_nickname.value,
      phone: new_phone.value,
      email: new_email.value
    })
    ElMessage.success('修改成功')
    // 更新成功后刷新用户信息
    await getUserInfo()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '修改失败')
  }
}

const handleAvatarChange = async (file)  => {
  // 调用上传头像的接口
  try{
    await updateUserAvatarService(file.data)
    ElMessage.success('头像修改成功')
    // 更新成功后刷新用户信息
    await getUserInfo()
  }
  catch(error){
    console.error('头像修改失败:', error)
    ElMessage.error('头像修改失败')
  }
}


// 身份证上传相关方法
const handleIdCardChange = async (file) => {
  // 调用上传身份证的接口
  userInfo.value.idCardUrl = file.data
  
}

const handleRemove = (file, fileList) => {
  console.log(file, fileList)
}

// 学生证上传前的处理
const beforeUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isJPG) {
    ElMessage.error('只能上传JPG/PNG格式的图片!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

// 提交认证
const submitVerify = async () => {
  if (!userInfo.value.realName) {
    ElMessage.warning('请填写真实姓名')
    return
  }

  try {
    await verifyService(userInfo.value.realName,userInfo.value.idCardUrl)
    ElMessage.success('认证信息提交成功')
    await getUserInfo() // 刷新用户信息
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '认证信息提交失败')
  }
}

// 查看房源详情
const viewHouseDetail = (id) => {
  router.push(`/house/${id}`)
}

// 取消收藏
const removeFavorite = async (houseId) => {
  //将houseId转换为int类型 后端是Long类型
  console.log(houseId)
  const houseIdNumber = parseInt(houseId)
  console.log(houseIdNumber)
  try{
      await deleteFavoriteService(houseIdNumber)
      getFavoriteList()
    }catch(error){
      console.error('取消收藏失败:', error)
    }
}

// 取消预约
const handleCancelAppointment = async (id, appTime) => {
  // 将字符串时间转换为Date对象
  const appointmentTime = new Date(appTime)
  const now = new Date()
  
  // 计算时间差（毫秒）
  const diff = appointmentTime.getTime() - now.getTime()
  console.log(diff)
  // 如果已经超过预约时间
  if (diff < 0) {
    ElMessage.warning('预约时间已过，无法取消')
    return
  }
  
  // 如果距离预约时间小于2小时
  if (diff < 2 * 60 * 60 * 1000) {
    ElMessage.warning('距离预约时间不足2小时，无法取消')
    return
  }

  try {
    await cancelAppointmentService(id)
    ElMessage.success('取消预约成功')
    // 刷新预约列表
    getAppointments()
  } catch (error) {
    console.error('取消预约失败:', error)
    ElMessage.error('取消预约失败，请稍后重试')
  }
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 0:
      return 'warning'
    case 1:
      return 'success'
    case 2:
      return 'warning'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0:
      return '待确认'
    case 1:
      return '已确认'
    case 2:
      return '已拒绝'
    default:
      return '已取消'
  }
}

// 确认预约
const handleConfirmAppointment = async (id) => {
  
  try {
    await ElMessageBox.confirm('确认接受该预约申请吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await confirmAppointmentService(id)
    ElMessage.success('已确认预约')
    getAppointments()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认预约失败:', error)
      ElMessage.error('确认预约失败')
    }
  }
}

// 拒绝预约
const handleRejectAppointment = async (id) => {
  try {
    await ElMessageBox.confirm('确认拒绝该预约申请吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await rejectAppointmentService(id)
    ElMessage.success('已拒绝预约')
    getAppointments()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('拒绝预约失败:', error)
      ElMessage.error('拒绝预约失败')
    }
  }
}

// 监听菜单切换
watch(activeMenu, (newValue) => {
  if (newValue === 'appointments' || newValue === 'rental-manage') {
    getAppointments()
  }
})

// 获取合同状态类型
const getContractStatusType = (status) => {
  switch (status) {
    case 0:
      return 'warning'
    case 1:
      return 'success'
    case 2:
      return 'danger'
    case 3:
      return 'warning'
    case 4:
      return 'danger'
    case 5:
      return 'info'
    default:
      return 'info'
  }
}

// 获取合同状态文本
const getContractStatusText = (status) => {
  switch (status) {
    case 0:
      return '待确认'
    case 1:
      return '履行中'
    case 2:
      return '已拒绝'
    case 3:
      return '待处理终止'
    case 4:
      return '已终止'
    case 5:
      return '已结束'
    default:
      return '未知状态'
  }
}

// 查看合同详情
const handleViewContract = async (contract) => {
  try {
    await ElMessageBox.confirm('确定要查看该合同吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    // TODO: 调用查看合同接口
    // await viewContractService(contract.id)
    ElMessage.success('合同查看成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('合同查看失败')
    }
  }
}

// 申请终止合同
const handleApplyTerminate = async (id) => {
  try {
    await ElMessageBox.confirm('确定要申请终止该合同吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await applyTerminateContractService(id)
    ElMessage.success('终止申请已提交')
    getAppointments() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('申请终止失败')
    }
  }
}

// 确认签约
const handleConfirmContract = async (id) => {
  try {
    await ElMessageBox.confirm('确认接受该签约申请吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await confirmContractService(id)
    ElMessage.success('已确认签约')
    getAppointments()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('确认签约失败')
    }
  }
}

// 拒绝签约
const handleRejectContract = async (id) => {
  try {
    await ElMessageBox.confirm('确认拒绝该签约申请吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await rejectContractService(id)
    ElMessage.success('已拒绝签约')
    getAppointments()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('拒绝签约失败')
    }
  }
}

// 确认终止
const handleConfirmTerminate = async (id) => {
  try {
    await ElMessageBox.confirm('确认同意终止该合同吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await agreeTerminateContractService(id)
    ElMessage.success('已确认终止合同')
    getAppointments()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('确认终止失败')
    }
  }
}

// 拒绝终止
const handleRejectTerminate = async (id) => {
  try {
    await ElMessageBox.confirm('确认拒绝终止该合同吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await disagreeTerminateContractService(id)
    ElMessage.success('已拒绝终止合同')
    getAppointments()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('拒绝终止失败')
    }
  }
}
</script>

<style scoped>
.user-center {
  display: flex;
  min-height: calc(100vh - 60px);
  padding: 20px;
  background: #f5f5f5;
  gap: 20px;
}

.side-nav {
  width: 240px;
  background: #fff;
  border-radius: 8px;
  padding: 20px 0;
  height: fit-content;
}

.user-info {
  text-align: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.user-info h3 {
  margin-top: 10px;
  color: #333;
}

.role-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 8px;
}

.menu {
  border-right: none;
}

.content {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  min-height: 500px;
}

.info-form h2,
.verify-info h2 {
  margin-bottom: 30px;
  font-weight: 500;
  color: #333;
}

.avatar-upload {
  margin-bottom: 30px;
}

.avatar-upload h3 {
  margin-bottom: 20px;
  font-weight: normal;
  color: #606266;
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.upload-btn {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

.phone-input,
.email-input,
.password-input,
.input-with-button {
  display: flex;
  gap: 10px;
}

.verify-code-input {
  display: flex;
  gap: 10px;
}

:deep(.el-input) {
  max-width: 300px;
}

:deep(.el-button) {
  min-width: 100px;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-icon) {
  margin-right: 4px;
}

.favorites-section {
  margin-bottom: 30px;
}

.favorites-section h2 {
  margin-bottom: 24px;
  font-weight: 500;
  color: #333;
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
  text-align: center;
}

.appointments-section {
  margin-bottom: 30px;
}

.appointments-section h2 {
  margin-bottom: 24px;
  font-weight: 500;
  color: #333;
}

.appointment-card {
  margin-bottom: 20px;
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.house-title {
  font-size: 16px;
  color: #333;
  margin: 0;
  cursor: pointer;
}

.house-title:hover {
  color: #409EFF;
}

.appointment-info {
  margin-bottom: 16px;
}

.info-item {
  margin-bottom: 8px;
  color: #666;
}

.info-item .label {
  color: #999;
  margin-right: 8px;
}

.appointment-actions {
  display: flex;
  justify-content: flex-end;
}

.verify-info {
  padding: 20px;
}

.verify-info h2 {
  margin-bottom: 30px;
  font-weight: 500;
  color: #333;
}

.verify-info .el-form {
  max-width: 500px;
}

.verify-info .el-upload {
  width: 100%;
}

.verify-info .el-upload__tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

.verify-container {
  display: flex;
  gap: 40px;
  padding: 20px;
}

.verify-section {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.verify-section h2 {
  margin-bottom: 24px;
  font-weight: 500;
  color: #333;
  font-size: 18px;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
}

.verify-info .el-form {
  max-width: 100%;
}

.verify-info .el-upload {
  width: 100%;
}

.verify-info .el-upload__tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

:deep(.el-tag) {
  font-size: 14px;
  padding: 4px 12px;
  height: auto;
  line-height: 1.5;
}

.verify-status {
  padding: 20px;
  text-align: center;
}

.verify-info-details {
  margin-top: 20px;
  text-align: left;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.verify-info-details p {
  margin: 10px 0;
  color: #606266;
}
</style>
