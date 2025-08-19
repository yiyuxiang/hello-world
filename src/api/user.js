// 导入 request.js 文件
import request from '@/utils/request.js'

// 用户注册
export const UserRegisterService = (data) => {
  // 发送 post 请求
  const params = new URLSearchParams();
  for (let key in data) {
    params.append(key, data[key]);
  }
  return request.post('/user/register', params);
}
 
// 用户登录
export const UserLoginService = (data) => {
  const params = new URLSearchParams();
  for (let key in data) {
    params.append(key, data[key]);
  }
  return request.post('/user/login', params);
}

// 获取用户信息
export const getUserInfoService = () => {
  return request.get('/user/userInfo');
}

// 修改用户信息
export const updateUserInfoService = (data) => {
  return request.put('/user/update', data);
}


// 修改密码
export const updatePasswordService = (data) => {
  return request.patch('/user/updatePwd', data);
}


// 更新用户头像
export const updateUserAvatarService = (url) => {
  return request.post(`/user/uploadAvatar?avatarUrl=${url}`);
}

// 实名认证
export const verifyService = (realname,idCard) => {
  return request.post('/user/verify?realName='+realname+'&idCardUrl='+idCard);
}

// 新增用户行为
export const addUserBehaviorService = (houseId,behaviorType) => {
  return request.post(`/behavior/add?houseId=${houseId}&behaviorType=${behaviorType}`);
}

// 获取实名认证列表
export const getVerifyListService = () => {
  return request.get('/user/verifyList');
}

export const VerifyApproveService = (id) => {
  return request.post(`/user/verifyPass?userId=${id}`);
}

export const VerifyRejectService = (id) => {
  return request.post(`/user/verifyRefuse?userId=${id}`);
}
