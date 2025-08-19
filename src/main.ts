// 引入createApp用于创建应用实例
import './assets/main.scss'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from '@/router'
// 引入App根组件
import App from './App.vue'
import locale from 'element-plus/es/locale/lang/zh-cn.mjs'
import {createPinia} from 'pinia'
//导入持久化插件
import {createPersistedState} from'pinia-persistedstate-plugin'
    


// 创建应用实例
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
//pinia使用持久化插件
const persist = createPersistedState()
pinia.use(persist)
//使用路由器和element-plus插件
app.use(ElementPlus, { locale })
app.use(router)
//挂载整个应用
app.mount('#app')


