<template>
  <div class="contract-container">
    <div class="contract-header">
      <h2>签约合同</h2>
      <p class="house-info">{{ houseInfo.title }}</p>
    </div>

    <div class="contract-form">
      <el-form :model="contractForm" :rules="rules" ref="contractFormRef" label-width="120px">
        <!-- 租期选择 -->
        <el-form-item label="租期" prop="leaseTerm" >
          <el-select v-model="contractForm.leaseTerm" placeholder="请选择租期" @change="handleStartDateChange">
            <el-option label="1个月" value="1" />
            <el-option label="3个月" value="3" />
            <el-option label="6个月" value="6" />
            <el-option label="12个月" value="12" />
            <el-option label="24个月" value="24" />
          </el-select>
        </el-form-item>

        <!-- 起租日期 -->
        <el-form-item label="起租日期" prop="startDate">
          <el-date-picker
            v-model="contractForm.startDate"
            type="date"
            placeholder="选择起租日期"
            :disabled-date="disabledStartDate"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleStartDateChange"
          />
        </el-form-item>


        <!-- 首期费用 -->
        <el-form-item label="总费用">
          <div class="payment-details">
            <div class="payment-item">
              <span class="label">月租金：</span>
              <span class="amount">¥{{ route.query.price }}</span>
            </div>
            <div class="payment-item total">
              <span class="label">总计：</span>
              <span class="amount">¥{{route.query.price * contractForm.leaseTerm }}</span>
            </div>
          </div>
        </el-form-item>

        <!-- 合同条款 -->
        <el-form-item label="合同条款" prop="agreement">
          <el-checkbox v-model="contractForm.agreement">
            我已阅读并同意
            <el-button type="text" @click="showContractTerms">《房屋租赁合同》</el-button>
          </el-checkbox>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" @click="submitContract" :loading="submitting">
            提交签约
          </el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 合同条款弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="房屋租赁合同"
      width="70%"
      class="contract-terms-dialog"
    >
      <div class="contract-terms">
        <h3>房屋租赁合同</h3>
        <div class="terms-content">
          <p>甲方（出租方）：张三</p>
          <p>乙方（承租方）：李四</p>
          <p>房屋地址：北京市朝阳区xxx小区</p>
          <p>租赁期限：{{ contractForm.leaseTerm }}个月</p>
          <p>租金：¥{{ route.query.price }}/月</p>
          <p>其他条款：</p>
          <ul>
            <li>乙方应按时支付租金，逾期支付将按日收取滞纳金</li>
            <li>乙方应爱护房屋及设施，如有损坏应照价赔偿</li>
            <li>未经甲方同意，乙方不得转租或转借房屋</li>
            <li>合同到期前30天，双方应协商是否续租</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createContractService } from '@/api/appointment.js'
import dayjs from 'dayjs'
import { addUserBehaviorService } from '@/api/user.js'
const route = useRoute()
const router = useRouter()
const contractFormRef = ref(null)
const dialogVisible = ref(false)

// 房源信息
const houseInfo = reactive({
  title: route.query.title || '示例房源标题',
  id: route.query.id,
  price: route.query.price || 2000,
  ownerName: '张三',
  address: '北京市朝阳区xxx小区'
})

// 用户信息
const userInfo = reactive({
  name: '李四'
})

// 合同表单
const contractForm = reactive({
  leaseTerm: '',
  startDate: '',
  endDate: '',
  agreement: false
})

// 表单验证规则
const rules = {
  leaseTerm: [
    { required: true, message: '请选择租期', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '请选择起租日期', trigger: 'change' }
  ],
  agreement: [
    { required: true, message: '请阅读并同意合同条款', trigger: 'change' }
  ]
}

// 提交状态
const submitting = ref(false)



// 禁用起租日期（只能选择今天之后的日期）
const disabledStartDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7
}

// 显示合同条款
const showContractTerms = () => {
  dialogVisible.value = true
}


const handleStartDateChange = () => {
  if (!contractForm.startDate || !contractForm.leaseTerm) {
    contractForm.endDate = ''
    return
  }
  // 起始日期
  const start = dayjs(contractForm.startDate)
  // 结束日期 = 起始日期 + 租期（月） - 1天（如1月1日租1个月，结束为1月31日）
  const end = start.add(Number(contractForm.leaseTerm), 'month').subtract(1, 'day')
  contractForm.endDate = end.format('YYYY-MM-DD')
}



// 提交签约
const submitContract = async () => {
  if (!contractFormRef.value) return
  
  await contractFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
          await createContractService({
          houseId: route.query.id,
          landlordId: route.query.landlordId,
          startDate: contractForm.startDate,
          endDate: contractForm.endDate,
          totalPrice: route.query.price * contractForm.leaseTerm
        })
        ElMessage.success('签约成功')
        router.push('/usercenter')
      } catch (error) {
        ElMessage.error('签约失败，请稍后重试')
      } finally {
        submitting.value = false
      }
    }
    try{
      await addUserBehaviorService(parseInt(route.query.id), 3)
    }catch(error){
      console.error('添加用户行为失败:', error)
    }
  })
}

// 返回上一页
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.contract-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.contract-header {
  text-align: center;
  margin-bottom: 30px;
}

.contract-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.house-info {
  color: #666;
  font-size: 16px;
}

.contract-form {
  margin-bottom: 30px;
}

.deposit-amount {
  font-size: 20px;
  color: #ff4d4f;
  font-weight: bold;
}

.deposit-desc {
  color: #999;
  margin-left: 8px;
}

.payment-details {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.payment-item.total {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
  font-weight: bold;
}

.payment-item .label {
  color: #666;
}

.payment-item .amount {
  color: #ff4d4f;
}

.contract-terms {
  padding: 20px;
}

.contract-terms h3 {
  text-align: center;
  margin-bottom: 20px;
}

.terms-content {
  line-height: 1.8;
}

.terms-content p {
  margin-bottom: 12px;
}

.terms-content ul {
  padding-left: 20px;
}

.terms-content li {
  margin-bottom: 8px;
}
</style> 