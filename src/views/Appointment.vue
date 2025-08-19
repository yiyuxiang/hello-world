<template>
  <div class="appointment-container">
    <div class="appointment-header">
      <h2>预约看房</h2>
      <p class="house-info">{{ houseInfo.title }}</p>
    </div>

    <div class="appointment-form">
      <el-form :model="appointmentForm" :rules="rules" ref="appointmentFormRef" label-width="100px">
        <!-- 预约时间选择 -->
        <el-form-item label="预约时间" prop="appointmentTime">
          <el-date-picker
            v-model="appointmentForm.appointmentTime"
            type="datetime"
            placeholder="选择预约时间"
            :disabled-date="disabledDate"
            :disabled-hours="disabledHours"
            :disabled-minutes="disabledMinutes"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>

        <!-- 联系方式 -->
        <el-form-item label="联系电话" prop="telephone">
          <el-input v-model="appointmentForm.telephone" placeholder="请输入联系电话" />
        </el-form-item>

        <!-- 备注信息 -->
        <el-form-item label="备注信息" prop="remark">
          <el-input
            v-model="appointmentForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入备注信息（选填）"
          />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" @click="submitAppointment" :loading="submitting">
            提交预约
          </el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 预约须知 -->
    <div class="appointment-notice">
      <h3>预约须知</h3>
      <ul>
        <li>请提前24小时预约看房时间</li>
        <li>看房时间为工作日的9:00-18:00</li>
        <li>请保持电话畅通，工作人员会与您联系确认</li>
        <li>如需取消预约，请提前2小时通知</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createAppointmentService } from '@/api/appointment'
import { addUserBehaviorService } from '@/api/user.js'

const route = useRoute()
const router = useRouter()

// 房源信息
const houseInfo = reactive({
  title: route.query.title || '示例房源标题',
  id: route.query.id,
  price: route.query.price || 2000
})

// 预约表单
const appointmentFormRef = ref(null)
const appointmentForm = ref({ 
  appointmentTime: '',
  telephone: '',
  remark: ''
})

// 表单验证规则
const rules = {
  appointmentTime: [
    { required: true, message: '请选择预约时间', trigger: 'change' }
  ],
  telephone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 提交状态
const submitting = ref(false)

// 提交预约
const submitAppointment = async () => {
  if (!appointmentFormRef.value) return 
  else{
      submitting.value = true
      try {
        // 确保时间格式正确
        const appointmentTime = appointmentForm.value.appointmentTime
        
        await createAppointmentService({
          houseId: houseInfo.id,
          appointmentTime: appointmentTime,
          remark: appointmentForm.value.remark,
          telephone: appointmentForm.value.telephone,
          landlordId: route.query.landlordId
        })
        
        ElMessage.success('预约成功，工作人员会尽快与您联系')
        router.push('/search')
      } catch (error) {
        console.error('预约失败:', error)
      } finally {
        submitting.value = false
      }

      try{
        await addUserBehaviorService(parseInt(route.query.id), 1)
      }catch(error){
        console.error('添加用户行为失败:', error)
      }
    }

}

// 返回上一页
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.appointment-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.appointment-header {
  text-align: center;
  margin-bottom: 30px;
}

.appointment-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.house-info {
  color: #666;
  font-size: 16px;
}

.appointment-form {
  margin-bottom: 30px;
}

.appointment-notice {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 4px;
}

.appointment-notice h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
}

.appointment-notice ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.appointment-notice li {
  color: #666;
  margin-bottom: 10px;
  padding-left: 20px;
  position: relative;
}

.appointment-notice li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #409EFF;
}
</style>