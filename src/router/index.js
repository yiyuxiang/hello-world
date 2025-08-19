import { createRouter, createWebHashHistory } from 'vue-router'

import Loginvue from '@/views/Login.vue'
import SearchPagevue from '@/views/SearchPage.vue'
import UserCentervue from '@/views/UserCenter.vue'
import HouseDetail from '@/views/HouseDetail.vue'
import FavoriteList from '@/views/FavoriteList.vue'
import Appointmentvue from '@/views/Appointment.vue'
import Contractvue from '@/views/Contract.vue'
import Landlordvue from '@/views/LandlordPage.vue'  
import AdminPagevue from '@/views/AdminPage.vue'
import MyPostsvue from '@/views/MyPosts.vue'
import CommunityCreatevue from '@/views/CommunityCreate.vue'
import PostList from '@/views/PostList.vue'
import PostDetail from '@/views/PostDetail.vue'

const routes = [
  {
    path: '/',
    redirect: '/search'
  },
  {
    path: '/login',
    name: 'login',
    component: Loginvue
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminPagevue
  },
  {
    path: '/usercenter',
    name: 'usercenter',
    component: UserCentervue
  },
  {
    path: '/landlord',
    name: 'landlord',
    component: Landlordvue
  },
  {
    path: '/contract',
    name: 'contract',
    component: Contractvue
  },

  {
    path: '/appointment',
    name: 'appointment',
    component: Appointmentvue
  },
  {
    path: '/search',
    name: 'search',
    component: SearchPagevue
  },
  {
    path: '/house/:id',
    name: 'houseDetail',
    component: HouseDetail
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: FavoriteList
  },
  { 
    path: '/myPosts',
    name: 'myPosts',
    component: MyPostsvue
  },
  
  {
    path: '/community/create',
    name: 'communityCreate',
    component: CommunityCreatevue
  },
  {
    path: '/posts',
    name: 'posts',
    component: PostList
  },
  {
    path: '/post/:id',
    name: 'postDetail',
    component: PostDetail
  },
  {
    path: '/recommend',
    name: 'Recommend',
    component: () => import('@/views/RecommendPage.vue'),
    meta: {
      title: '为您推荐',
      requiresAuth: true
    }
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes:routes
})


export default router
