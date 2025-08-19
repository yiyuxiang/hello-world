//定制请求的实例
//导入axios  npm install axios
import axios from 'axios';
//定义一个变量,记录公共的前缀  ,  baseURL
const baseURL = '/api';
const instance = axios.create({
    baseURL,
    headers: {
        // 'Content-Type': 'application/json'
    }
})

import { useTokenStore } from '../stores/token';
import { ElMessage } from 'element-plus';
import router from '../router';
//添加请求拦截器
instance.interceptors.request.use(
    (config) => { 
        // 请求前的回调
        // 添加token
        const tokenStore = useTokenStore();
        if(tokenStore.token){
            config.headers.Authorization = tokenStore.token;
        }
        return config;
    },
    error => { // 请求错误处理
        // 对请求错误做些什么
        return Promise.reject(error);
    }
)


//添加响应拦截器
instance.interceptors.response.use(
    result => {
        if(result.data.code === 0)
            return result.data;
        // 操作失败
        alert(result.data.message?result.data.message:'操作失败');  
        return Promise.reject(result.data);
    },
    err=>{
        if(err.response.status === 401){
            //未登录 或者token过期
            ElMessage.error('请先登录');
            router.push('/login');
        }
        else{
            ElMessage.error('服务异常');
        }
        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

export default instance;