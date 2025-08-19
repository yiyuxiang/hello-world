<template>
  
  <div class="discover-page">
    <div class="content-container">
      <div class="header">
        <div class="search-bar">
        
        </div>
        <div class="view-toggle">
          <el-radio-group v-model="viewMode" @change="handleViewModeChange">
            <el-radio-button label="all">社区帖子</el-radio-button>
            <el-radio-button label="my">我的帖子</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="post-grid">
        <div v-for="post in postList" :key="post.id" class="post-card" @click="goToDetail(post.id)">
          <div class="post-cover">
            <img :src="post.imageUrl" :alt="post.title" />
          </div>
          <div class="post-info">
            <div class="post-title">{{ post.title }}</div>
            <div class="post-meta">
              <div class="author-info">
                <img class="author-avatar" :src="post.avatar" />
                <span class="author-name">{{ post.authorId }}</span>
              </div>
              <div class="post-actions">
                <div class="likes">
                  <i class="el-icon-star-off"></i>
                  <span>{{ post.likes || '10+' }}</span>
                </div>
                <el-button 
                  v-if="viewMode === 'my'"
                  type="danger" 
                  size="small" 
                  class="delete-btn"
                  @click.stop="handleDeletePost(post.id)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="load-more" v-if="hasMore">
        <el-button type="text" @click="loadMore">查看更多</el-button>
      </div>
    </div>

    <!-- 发帖按钮 -->
    <el-button
      type="primary"
      class="post-button"
      circle
      @click="showPostDialog = true"
    >
      <el-icon><Plus /></el-icon>
    </el-button>

    <!-- 发帖对话框 -->
    <el-dialog
      v-model="showPostDialog"
      title="发布新帖子"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="newPost" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="newPost.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input
            v-model="newPost.content"
            type="textarea"
            :rows="4"
            placeholder="请输入内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            action="/api/upload"
            name="file"
            list-type="picture-card"
            :headers="{'Authorization': tokenStore.token}"
            :auto-upload="true"
            :on-success="handleImageChange"
            :on-remove="handleImageRemove"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPostDialog = false">取消</el-button>
          <el-button type="primary" @click="submitPost">发布</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTokenStore } from '@/stores/token.js'
import { addPostService, getAllPostsService, getMyPostsService, deletePostService } from '@/api/posts.js'

const router = useRouter()

// 添加固定头像数组
const defaultAvatars = [
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
  'https://cube.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg',
  'https://cube.elemecdn.com/0/6f/e35ff375812e6b0020b6b4e8f9583jpeg.jpeg'
]

// 获取随机头像
const getRandomAvatar = () => {
  const randomIndex = Math.floor(Math.random() * defaultAvatars.length)
  return defaultAvatars[randomIndex]
}

// 帖子类型声明
interface PostItem {
  id: number;
  imageUrl: string;
  title: string;
  authorId: string;
  avatar?: string;
  likes?: number | string;
}

const postList = ref<PostItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const searchQuery = ref('')
const activeTab = ref('recommend')
const hasMore = ref(true)
const showPostDialog = ref(false)
const tokenStore = useTokenStore()
const viewMode = ref('all')


// 新帖子表单数据
const newPost = ref({
  title: '',
  content: '',
  imageUrl:'',
})


const fetchPosts = async () => {
  try {
    let res
    if (viewMode.value === 'all') {
      res = await getAllPostsService()
    } else {
      res = await getMyPostsService()
    }
    if (res && res.data) {
      // 为每个帖子添加随机头像
      postList.value = res.data.map(post => ({
        ...post,
        avatar: getRandomAvatar()
      }))
      total.value = res.data.length
      hasMore.value = res.data.length >= pageSize.value
    }
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    ElMessage.error('获取帖子列表失败')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchPosts()
}

const handleTabClick = () => {
  currentPage.value = 1
  fetchPosts()
}

const loadMore = () => {
  currentPage.value++
  fetchPosts()
}

const goToDetail = (id: number) => {
  router.push(`/post/${id}`)
}


// 处理图片上传
const handleImageChange = (file : any) => {
  console.log(file)
  newPost.value.imageUrl = file.data
  console.log(file.data)
}

// 处理图片移除
const handleImageRemove = (file: any) => {
  newPost.value.imageUrl = ''
}


// 提交新帖子
const submitPost = async () => {
  if (!newPost.value.title || !newPost.value.content) {
    ElMessage.warning('请填写标题和内容')
    return
  }

  // 实现发布帖子API调用
  try {
      console.log(newPost.value.imageUrl,newPost.value.title,newPost.value.content)
     await addPostService(newPost.value.title,newPost.value.content,newPost.value.imageUrl)

      ElMessage.success('发布成功')
      showPostDialog.value = false
      fetchPosts()
    } catch (error) {
    ElMessage.error('发布失败')
  }

}

// 处理视图模式切换
const handleViewModeChange = (mode) => {
  currentPage.value = 1
  fetchPosts()
}

// 处理删除帖子
const handleDeletePost = (postId: number) => {
  ElMessageBox.confirm(
    '确定要删除这个帖子吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deletePostService(postId)
      ElMessage.success('删除成功')
      fetchPosts() // 重新加载帖子列表
    } catch (error) {
      console.error('删除帖子失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.discover-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.content-container {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header {
  position: sticky;
  top: 20px;
  background: #fff;
  z-index: 100;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.search-bar {
  max-width: 540px;
  margin: 0 auto 20px;
}

.search-bar :deep(.el-input__inner) {
  border-radius: 20px;
  background: #f5f5f5;
  border: none;
  height: 40px;
  font-size: 16px;
  padding-left: 20px;
}

.category-tabs {
  margin-bottom: 20px;
}

.category-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.category-tabs :deep(.el-tabs__active-bar) {
  background-color: #ff2442;
  height: 3px;
}

.category-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 24px;
  height: 40px;
  line-height: 40px;
}

.category-tabs :deep(.el-tabs__item.is-active) {
  color: #ff2442;
  font-weight: bold;
}

.post-grid {
  column-count: 4;
  column-gap: 24px;
  padding: 24px;
}

.post-card {
  break-inside: avoid;
  margin-bottom: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
}

.post-cover {
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;
  background: #f5f5f5;
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.post-info {
  padding: 12px 14px 10px 14px;
}

.post-title {
  font-size: 15px;
  color: #222;
  margin-bottom: 8px;
  font-weight: 500;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #888;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.author-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-size: 13px;
  color: #555;
  font-weight: 400;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.delete-btn {
  padding: 4px 8px;
  font-size: 12px;
}

.delete-btn:hover {
  opacity: 0.8;
}

.load-more {
  text-align: center;
  margin: 30px 0;
}

.load-more :deep(.el-button) {
  font-size: 16px;
  color: #666;
  padding: 12px 24px;
  border-radius: 24px;
  background: #fff;
  border: 1px solid #ddd;
  transition: all 0.3s ease;
}

.load-more :deep(.el-button:hover) {
  color: #ff2442;
  border-color: #ff2442;
  background: #fff;
  transform: translateY(-2px);
}

.post-button {
  position: fixed;
  right: 40px;
  bottom: 40px;
  width: 56px;
  height: 56px;
  font-size: 24px;
  background: #ff2442;
  border: none;
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.3);
  transition: all 0.3s ease;
}

.post-button:hover {
  transform: scale(1.1);
  background: #ff1a1a;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  line-height: 100px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}

.view-toggle {
  text-align: center;
  margin-bottom: 20px;
}

.view-toggle :deep(.el-radio-group) {
  display: inline-flex;
  border-radius: 20px;
  overflow: hidden;
}

.view-toggle :deep(.el-radio-button__inner) {
  padding: 8px 20px;
  font-size: 14px;
}

.view-toggle :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 20px 0 0 20px;
}

.view-toggle :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 20px 20px 0;
}

.view-toggle :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #ff2442;
  border-color: #ff2442;
  box-shadow: -1px 0 0 0 #ff2442;
}
</style> 