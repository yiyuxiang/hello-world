<script setup>
import { User, Lock } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {UserRegisterService, UserLoginService} from '@/api/user.js'
import {useRouter} from  'vue-router'
import {useTokenStore} from '@/stores/token.js'
import { useUserStore } from '@/stores/user'
import { getUserInfoService } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
//控制注册与登录表单的显示， 默认显示注册
const isRegister = ref(false)
const registerData = ref({
    username: '',
    password: '',
    repassword: '',
    role: 'tenant' // 默认选择租户身份
})

const checkrepassword = (rule, value, callback)=>{
    if(value == null || value === '') 
        return callback(new Error("请再次输入密码"))
    if(value!== registerData.value.password) 
        return callback(new Error("两次输入密码不一致"))
    callback()
}

const rules = ref({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 5, max: 16, message: '用户名长度在 5 到 16 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }, 
        { min: 5, max: 16, message: '密码长度在 5 到 16 个字符', trigger: 'blur' }
    ],
    repassword: [
        { validator: checkrepassword, trigger: 'blur' }
    ],
    role: [
        { required: true, message: '请选择身份', trigger: 'change' }
    ]
})

const register = async() => {
    let result = await  UserRegisterService(registerData.value)
    
    ElMessage.success('注册成功!');
    isRegister.value = false;
}

const tokenStore = useTokenStore()

const login = async() => {
    // 登录逻辑
    console.log(registerData.value)
    let result = await UserLoginService(registerData.value);
    
    tokenStore.setToken(result.data);
    // 设置用户信息
    let userInfo = await getUserInfoService()
    userStore.setUserInfo(userInfo.data.role, userInfo.data.username)
    console.log(userStore.userRole)
    ElMessage.success(result.message? result.message: '登录成功!');
    router.push('/search')
}
const clearForm = () => {    
    registerData.value = {
        username: '',
        password: '',
        repassword: '',
        role: 'tenant'
    }
}


</script>

<template>
    <div class="login-page">
        <div class="login-container">
            <div class="login-header">
                <img src="@/assets/logo2.png" alt="Logo" class="logo">
                <h1>租房平台</h1>
            </div>
            
            <!-- 注册表单 -->
            <el-form ref="form" size="large" autocomplete="off" v-if="isRegister" :rules="rules" :model="registerData" class="login-form">
                <el-form-item>
                    <h2>注册账号</h2>
                </el-form-item>
                <el-form-item prop="username">
                    <el-input v-model="registerData.username" :prefix-icon="User" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="registerData.password" :prefix-icon="Lock" type="password" placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item prop="repassword">
                    <el-input v-model="registerData.repassword" :prefix-icon="Lock" type="password" placeholder="请再次输入密码"></el-input>
                </el-form-item>
                <el-form-item prop="role">
                    <el-radio-group v-model="registerData.role" class="role-group">
                        <el-radio value="tenant">租户</el-radio>
                        <el-radio value="landlord">房东</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item>
                    <el-button @click="register" class="submit-button" type="primary" auto-insert-space>
                        注册
                    </el-button>
                </el-form-item>
                <el-form-item class="form-footer">
                    <el-link type="info" :underline="false" @click="isRegister = false;clearForm()">
                        ← 返回登录
                    </el-link>
                </el-form-item>
            </el-form>

            <!-- 登录表单 -->
            <el-form ref="form" size="large" autocomplete="off" v-else :rules="rules" :model="registerData" class="login-form">
                <el-form-item>
                    <h2>欢迎登录</h2>
                </el-form-item>
                <el-form-item prop="username">
                    <el-input v-model="registerData.username" :prefix-icon="User" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="registerData.password" name="password" :prefix-icon="Lock" type="password" placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item class="form-options">
                    
                </el-form-item>
                <el-form-item>
                    <el-button class="submit-button" type="primary" auto-insert-space @click="login">
                        登录
                    </el-button>
                </el-form-item>
                <el-form-item class="form-footer">
                    <el-link type="info" :underline="false" @click="isRegister = true;clearForm()">
                        注册账号 →
                    </el-link>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f2f5;
    background-image: 
        radial-gradient(circle at 25px 25px, #e1e4e8 2%, transparent 0%),
        radial-gradient(circle at 75px 75px, #e1e4e8 2%, transparent 0%);
    background-size: 100px 100px;
    padding: 20px;
    position: relative;
    overflow: hidden;
}

.login-page::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(240,242,245,0.95) 0%, rgba(224,227,232,0.85) 100%);
    z-index: 0;
}

.login-container {
    width: 100%;
    max-width: 400px;
    background: #ffffff;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    position: relative;
    z-index: 1;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.login-header {
    text-align: center;
    margin-bottom: 30px;
    
    .logo {
        width: 60px;
        height: 60px;
        margin-bottom: 15px;
    }
    
    h1 {
        font-size: 24px;
        color: #333;
        margin: 0;
    }
}

.login-form {
    h2 {
        text-align: center;
        color: #333;
        margin-bottom: 30px;
        font-size: 20px;
    }
}

.submit-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
    margin-top: 10px;
}

.form-options {
    margin-bottom: 20px;
}

.form-footer {
    margin-top: 20px;
    text-align: center;
}

.flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

:deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #dcdfe6;
    transition: all 0.3s;
    
    &:hover {
        box-shadow: 0 0 0 1px #409EFF;
    }
    
    &.is-focus {
        box-shadow: 0 0 0 1px #409EFF;
    }
}

:deep(.el-button--primary) {
    background: #409EFF;
    border: none;
    transition: all 0.3s;
    
    &:hover {
        background: #66b1ff;
        transform: translateY(-2px);
    }
}

.role-group {
    width: 100%;
    display: flex;
    justify-content: space-around;
    margin: 10px 0;
    
    :deep(.el-radio) {
        margin-right: 0;
        padding: 10px 20px;
        border-radius: 4px;
        transition: all 0.3s;
        
        &:hover {
            background-color: #f5f7fa;
        }
        
        &.is-checked {
            background-color: #ecf5ff;
        }
    }
}
</style>