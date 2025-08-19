<template>
  <div class="post-detail">
    <div class="post-container">
      <el-card class="post-card">
        <template #header>
          <div class="post-header">
            <div class="author-info">
              <img :src="post?.authorAvatar" :alt="post?.author" class="author-avatar">
              <div class="author-meta">
                <h3 class="author-name">{{ post?.author }}</h3>
                <span class="post-time">{{ post?.createTime }}</span>
              </div>
            </div>
            <h1 class="post-title">{{ post?.title }}</h1>
          </div>
        </template>
        
        <div class="post-content">
          <div class="content-wrapper">
            <div class="content-image-wrapper" v-if="post?.imageUrl">
              <el-image
                :src="post.imageUrl"
                fit="cover"
                class="content-image"
                :preview-src-list="[post.imageUrl]"
                preview-teleported
              >
                <template #placeholder>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                    <span>加载中...</span>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="content-text">
              <p>{{ post?.content }}</p>
            </div>
          </div>
        </div>
      </el-card>

      <div class="comments-section">
        <h2>评论 ({{ commentNumber }})</h2>
        
        <div class="comment-form">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
            class="comment-input"
          />
          <el-button type="primary" @click="submitComment" class="submit-btn">发表评论</el-button>
        </div>

        <div class="comments-list">
          <el-card v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <div class="comment-author">
                <img :src="comment.authorAvatar" :alt="comment.author" class="comment-avatar">
                <div class="comment-meta">
                  <span class="author-name">{{ comment.author }}</span>
                  <span class="comment-time">{{ comment.createTime }}</span>
                </div>
              </div>
            </div>
            <div class="comment-content">
              {{ comment.content }}
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { getPostDetailService, getCommentListService, addCommentService } from '@/api/posts.js'
import {getUserInfoService} from '@/api/user.js'

const route = useRoute()
const post = ref()
const comments = ref()
const newComment = ref('')
const isLiked = ref(false)
const commentNumber = ref(0)
const userInfo = ref()

// 随机头像数组
const randomAvatars = [
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
]

// 获取随机头像
const getRandomAvatar = () => {
  const randomIndex = Math.floor(Math.random() * randomAvatars.length)
  return randomAvatars[randomIndex]
}

const fetchUserInfo = async () => {
  try {
    const res = await getUserInfoService()
    if (res && res.data) {
      userInfo.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
}

const fetchPostDetail = async () => {
  try {
    const postId = Number(route.params.id)
    const res = await getPostDetailService(postId)
    if (res && res.data) {
      post.value = res.data
      console.log('帖子图片:', post.value?.imageUrl)
      console.log('帖子详情:', post.value)
    }
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    ElMessage.error('获取帖子详情失败')
  }
}

// 获取评论列表
const fetchComments = async () => {
  try {
    const postId = Number(route.params.id)
    const res = await getCommentListService(postId)
    if (res && res.data) {
      // 为每条评论添加随机头像
      comments.value = res.data.map(comment => ({
        ...comment,
        authorAvatar: getRandomAvatar()
      }))
      commentNumber.value = res.data.length
      console.log('评论数量:', commentNumber.value)
      console.log('评论列表:', comments.value)
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
    ElMessage.error('获取评论列表失败')
  }
}

const handleLike = () => {
  if (post.value) {
    isLiked.value = !isLiked.value
    post.value.likes += isLiked.value ? 1 : -1
    ElMessage.success(isLiked.value ? '点赞成功' : '取消点赞')
  }
}


const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  try {
    const postId = Number(route.params.id)
    await addCommentService(postId, newComment.value)
    ElMessage.success('评论成功')
    newComment.value = ''
    // 重新获取评论列表
    await fetchComments()
  } catch (error) {
    console.error('发表评论失败:', error)
    ElMessage.error('发表评论失败')
  }
}

onMounted(() => {
  fetchPostDetail()
  fetchComments()
})
</script>

<style scoped>
.post-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.post-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.post-header {
  padding: 20px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.author-meta {
  flex: 1;
}

.author-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.post-time {
  font-size: 14px;
  color: #999;
}

.follow-btn {
  padding: 6px 16px;
  font-size: 14px;
  border-radius: 20px;
  background: #ff2442;
  border: none;
  color: #fff;
  transition: all 0.3s ease;
}

.follow-btn:hover {
  background: #ff1a1a;
  transform: scale(1.05);
}

.post-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 16px 0;
  line-height: 1.4;
}

.post-tags {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.post-content {
  padding: 20px;
}

.content-wrapper {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.content-image-wrapper {
  flex: 0 0 33.33%;
  position: sticky;
  top: 20px;
}

.content-image {
  width: 100%;
  height: 50vh;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.content-text {
  flex: 1;
  font-size: 16px;
  line-height: 1.8;
  color: #333;
}

.content-text p {
  margin: 0;
  white-space: pre-wrap;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8px;
  color: #909399;
}

.image-placeholder .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.post-footer {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 14px;
}

.post-actions {
  display: flex;
  gap: 12px;
}

.post-actions .el-button {
  border-radius: 20px;
  padding: 8px 20px;
}

.post-actions .el-button.is-liked {
  background: #ff2442;
  border-color: #ff2442;
  color: #fff;
}

.comments-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.comments-section h2 {
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin-bottom: 20px;
}

.comment-form {
  margin-bottom: 30px;
}

.comment-input {
  margin-bottom: 12px;
}

.submit-btn {
  float: right;
  border-radius: 20px;
  padding: 8px 24px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  border-radius: 8px;
  overflow: hidden;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-meta {
  display: flex;
  flex-direction: column;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  padding: 0 12px;
}

.comment-item .el-button.is-liked {
  color: #ff2442;
}

:deep(.el-image-viewer__wrapper) {
  z-index: 2100;
}

:deep(.el-image-viewer__close) {
  color: #fff;
}

:deep(.el-image-viewer__actions__inner) {
  gap: 12px;
}

:deep(.el-image-viewer__prev, .el-image-viewer__next) {
  width: 44px;
  height: 44px;
  font-size: 24px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  color: #fff;
}

:deep(.el-image-viewer__prev:hover, .el-image-viewer__next:hover) {
  background-color: rgba(0, 0, 0, 0.5);
}
</style> 