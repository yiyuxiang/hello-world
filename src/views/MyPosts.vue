<template>
  <div class="my-posts">
    <el-card>
      <template #header>
        <div class="header"> 
          <h2>我的帖子</h2>
          <el-button type="primary" @click="createPost">发布新帖子</el-button>
        </div>
      </template>

      <div class="post-list">
        <el-card v-for="post in posts" :key="post.id" class="post-card">
          <div class="post-header">
            <h3>{{ post.title }}</h3>
            <div class="post-meta">
              <span class="time">{{ formatDate(post.createTime) }}</span>
              <span class="stats">
                <i class="el-icon-view"></i> {{ post.views }}
                <i class="el-icon-star-off"></i> {{ post.likes }}
                <i class="el-icon-chat-dot-round"></i> {{ post.comments }}
              </span>
            </div>
          </div>
          
          <div class="post-content">
            <p>{{ post.content }}</p>
            <div class="post-images" v-if="post.images && post.images.length">
              <el-image
                v-for="(image, index) in post.images"
                :key="index"
                :src="image"
                :preview-src-list="post.images"
              />
            </div>
          </div>

          <div class="post-actions">
            <el-button type="primary" link @click="editPost(post)">编辑</el-button>
            <el-button type="danger" link @click="deletePost(post)">删除</el-button>
            <el-button type="primary" link @click="viewDetail(post)">查看详情</el-button>
          </div>
        </el-card>
      </div>

      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

interface User {
  id: string
  name: string
  avatar: string
}

interface Post {
  id: string
  title: string
  content: string
  images: string[]
  author: User
  createTime: string
  updateTime: string
  likes: number
  comments: number
  views: number
}

// 模拟数据
const mockUsers: User[] = [
  {
    id: '1',
    name: '张三',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    id: '2',
    name: '李四',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    id: '3',
    name: '王五',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  }
]

const mockPosts: Post[] = [
  {
    id: '1',
    title: '分享一个有趣的项目',
    content: '这是一个非常有趣的项目，使用了最新的技术栈，包括Vue3、TypeScript等。项目地址：https://github.com/example/project',
    images: [
      'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      'https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg'
    ],
    author: mockUsers[0],
    createTime: '2024-03-15T10:00:00Z',
    updateTime: '2024-03-15T10:00:00Z',
    likes: 42,
    comments: 15,
    views: 256
  },
  {
    id: '2',
    title: 'Vue3 新特性分享',
    content: 'Vue3带来了很多激动人心的新特性，比如Composition API、Teleport、Suspense等。这些特性让我们的开发更加高效和灵活。',
    images: [
      'https://fuss10.elemecdn.com/0/6f/e35ff375812e6b0020b6b4e8f9583jpeg.jpeg'
    ],
    author: mockUsers[1],
    createTime: '2024-03-14T15:30:00Z',
    updateTime: '2024-03-14T15:30:00Z',
    likes: 28,
    comments: 8,
    views: 189
  },
  {
    id: '3',
    title: 'TypeScript 最佳实践',
    content: 'TypeScript 的类型系统非常强大，合理使用可以大大提高代码质量和开发效率。这里分享一些我在实际项目中的最佳实践。',
    images: [],
    author: mockUsers[2],
    createTime: '2024-03-13T09:15:00Z',
    updateTime: '2024-03-13T09:15:00Z',
    likes: 35,
    comments: 12,
    views: 312
  }
]

const router = useRouter()
const posts = ref<Post[]>([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const createPost = () => {
  router.push('/community/create')
}

const editPost = (post: Post) => {
  router.push(`/community/edit/${post.id}`)
}

const deletePost = async (post: Post) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇帖子吗？', '提示', {
      type: 'warning'
    })
    
    ElMessage.success('删除成功')
    fetchPosts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const viewDetail = (post: Post) => {
  router.push(`/community/detail/${post.id}`)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchPosts()
}

const fetchPosts = async () => {
  try {
    // 假设当前用户ID为1
    const myPosts = mockPosts.filter(post => post.author.id === '1')
    
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    posts.value = myPosts.slice(start, end)
    total.value = myPosts.length
  } catch (error) {
    ElMessage.error('获取帖子列表失败')
  }
}

onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.my-posts {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  margin: 0;
}

.post-card {
  margin-bottom: 20px;
}

.post-header {
  margin-bottom: 15px;
}

.post-header h3 {
  margin: 0;
  font-size: 18px;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
  color: #666;
  font-size: 14px;
}

.stats {
  display: flex;
  gap: 15px;
}

.stats i {
  margin-right: 5px;
}

.post-content {
  margin-bottom: 15px;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.post-images .el-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.post-actions {
  display: flex;
  gap: 15px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style> 