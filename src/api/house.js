import request from '@/utils/request.js'

// 获取所有房屋列表
export const getHouseListService = () => {
  return request.get('/house/all')
}

// 添加房源
export const addHouseService = (data) => {
  return request.post('/house/add', data)
}


// 获取房东的房源列表
export const getLandlordHousesService = () => {
  return request.get('/house/landlordList')
}


// 更新房源信息
export const updateHouseService = (data) => {
  return request.put('/house/update', data)
}

// 删除房源
export const deleteHouseService = (id) => {
  return request.delete(`/house/delete?id=${id}`)
}



// 获取房源详情
export const getHouseDetailService = (id) => {
  return request.get(`/house/info?id=${id}`)
}


// 获取待审核房源列表
export const getReviewHousesService = () => {
  return request.get('/house/review')
}

// 审核通过房源
export const approveHouseService = (id) => {
  return request.put(`/house/approve?id=${id}`)
}

// 获取已审核房源列表
export const getApprovedHousesService = () => {
  return request.get('/house/approved')
}

// 新增房源图片
export const addHouseImageService = (data) => {
  return request.post('/houseImage/upload', data)
}

// 获取房源所有图片
export const getHouseImagesService = (id) => {
  return request.get(`/houseImage/getList?houseId=${id}`)
}


// 筛选房源
export const getSearchListService = (data) => {
  return request.get('/house/search',{params: data})
}

// 关键词搜索房源
export const getTopSearchListService = (keyword) => {
  return request.get(`/house/searchByKeyword?keyword=${keyword}`)
}

// 收藏房源
export const addFavoriteService = (id) => {
  return request.post(`/house/collect?houseId=${id}`)
}


// 取消收藏房源
export const deleteFavoriteService = (id) => {
  return request.delete(`/house/cancelCollect?houseId=${id}`)
}

// 获取收藏房源列表
export const getFavoriteListService = () => {
  return request.get('/house/favoriteList')
}


// 检查是否收藏房源
export const checkCollectService = (id) => {
  return request.get(`/house/checkCollect?houseId=${id}`)
}

// 获取推荐房源列表
export const getRecommendationsService = (id,size) => {
  return request.get(`/recommend/user-cf?userId=${id}&size=${size}`)
}
