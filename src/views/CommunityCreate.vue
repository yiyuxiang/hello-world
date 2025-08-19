<template>
  <div class="community-create">
    <el-card>
      <template #header>
        <div class="header">
          <h2>发布新帖子</h2>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入帖子标题" />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            placeholder="请输入帖子内容"
          />
        </el-form-item>

        <el-form-item label="图片">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-change="handleImageChange"
            :on-remove="handleImageRemove"
            :limit="9"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">发布</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, UploadFile } from 'element-plus'

const router = useRouter()
const formRef = ref<FormInstance>()

const form = reactive({
  title: '',
  content: '',
  images: [] as string[]
})

const rules = {
  title: [
    { required: true, message: '请输入帖子标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' },
    { min: 10, message: '内容至少 10 个字符', trigger: 'blur' }
  ]
}

const handleImageChange = (file: UploadFile) => {
  // TODO: 实现图片上传功能
  // 这里应该调用上传API，获取图片URL
  const reader = new FileReader()
  reader.onload = (e) => {
    form.images.push(e.target?.result as string)
  }
  reader.readAsDataURL(file.raw as Blob)
}

const handleImageRemove = (file: UploadFile) => {
  const index = form.images.indexOf(file.url as string)
  if (index !== -1) {
    form.images.splice(index, 1)
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // TODO: 调用API发布帖子
        // await createPost(form)
        ElMessage.success('发布成功')
        router.push('/community')
      } catch (error) {
        ElMessage.error('发布失败')
      }
    }
  })
}

const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  form.images = []
}
</script>

<style scoped>
.community-create {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  margin: 0;
}

:deep(.el-upload--picture-card) {
  width: 120px;
  height: 120px;
  line-height: 120px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 120px;
  height: 120px;
}
</style> 