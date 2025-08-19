import request from '@/utils/request.js'

// 获取帖子列表
export const getPostsList = (params) => {
  return request.get('/posts', { params })
}


// 新增帖子
export const addPostService = (title,content,imageUrl) => {
  console.log(title, content, imageUrl)
  return request.post('/posts/add?title='+title+'&content='+content+'&imageUrl='+imageUrl)
}

// 获取所有帖子
export const getAllPostsService = () => {
  return request.get('/posts/getPostList')
}

// 获取帖子详情
export const getPostDetailService = (id) => {
  return request.get('/posts/getPostInfo?postId='+id)
}

// 新增评论
export const addCommentService = (postId,content) => {
  return request.post('/posts/addComment?postId='+postId+'&content='+content)
}

// 获取评论列表
export const getCommentListService = (postId) => {
  return request.get('/posts/getCommentList?postId='+postId)
}

// 我的帖子列表
export const getMyPostsService = () => {
  return request.get('/posts/getMyPostList')
}

export const deletePostService = (id) => {
  return request.delete('/posts/delete?postId='+ id)
}