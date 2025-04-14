<script setup lang="ts">
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 轮播图数据
const imgList = ref([
  {id:0, idView:new URL('../assets/Home/safe.jpg',import.meta.url).href, name:'安全'},
  {id:1, idView:new URL('../assets/Home/convenience.jpg',import.meta.url).href, name:'便捷'},
  {id:2, idView:new URL('../assets/Home/timely.jpg',import.meta.url).href, name:'及时'},
  {id:3, idView:new URL('../assets/Home/reliable.jpg',import.meta.url).href, name:'可靠'}            
]);

// 获取路由实例
const router = useRouter();
const route = useRoute();

// 导航函数
const navigateTo = (route: string) => {
  router.push(route);
}

// 返回主页
const backToHome = () => {
  router.push('/');
}

// 计算当前页面标题
const currentTitle = computed(() => {
  if (route.path === '/login' || route.path === '/login') {
    return '用户登录';
  } else if (route.path === '/adminlogin') {
    return '管理员登录';
  } else if (route.path === '/register') {
    return '用户注册';
  } else {
    return '欢迎使用校园帮';
  }
});

// 计算是否显示返回按钮
const showBackButton = computed(() => {
  return route.path !== '/';
});
</script>

<template>
    <div class="common-layout">
    <el-container class="base-layout">
      <el-header class="header-layout">
        <el-row >
          <el-col :span="6" class="col-center-left">
            <img src="../assets/logo.jpg" alt="logo" id="logo" type="logo" height="60px" width="60px" />
            <el-text font-size="50px" font-weight="bold">校 园 帮</el-text>
          </el-col>
          <el-col :span="12" class="col-center-center">
          </el-col>
          <el-col :span="2" class="col-center-center">
            <el-button type="primary" plain @click="navigateTo('/login')">用户登录</el-button>
          </el-col>
          <el-col :span="2" class="col-center-center">
            <el-button type="primary" plain @click="navigateTo('/adminlogin')">管理员登录</el-button>
          </el-col>
          <el-col :span="2" class="col-center-center">
            <el-button type="primary" plain @click="navigateTo('/register')">用户注册</el-button>
          </el-col>
        </el-row>
      </el-header>
      <el-body class="body-layout">
        <el-container class="body-container">
          <el-main class="body-main">
            <el-carousel class="carousel-text-center" indicator-position="outside" arrow="hover">
              <el-carousel-item v-for="item in imgList" :key="item.id">
                <img :src="item.idView" height="90%" width="30%">
                <br>
                <el-text size="large" tag="b">{{item.name}}</el-text>
              </el-carousel-item>
            </el-carousel>
          </el-main>

          <el-aside class="body-aside">

            <div class="component-container">
              <div class="component-header">
                <h2>{{ currentTitle }}</h2>
                <el-button v-if="showBackButton" type="primary" size="small" @click="backToHome">返回</el-button>
              </div>
              
              <div class="component-content">
                <!-- 默认内容，仅在主页路由时显示 -->
                <div v-if="route.path === '/'" class="default-content">
                  <img src="../assets/PRTS.jpg" height="90%" width="100%">
                  <p class="welcome-text">欢迎使用校园帮平台</p>
                </div>
                
                <!-- 子路由内容将显示在这里 -->
                <router-view v-else />
              </div>
            </div>
          </el-aside>
          
        </el-container>
      </el-body>
      <el-footer class="footer-layout">
        <el-row style="height: 100%;">
          <el-col :span="12" class="col-center-center">
            <el-text font-size="20px" font-weight="bold">关于我们</el-text>
          </el-col>
          <el-col :span="12" class="col-center-center">
            <el-text font-size="20px" font-weight="bold">联系我们</el-text>
          </el-col>
        </el-row>
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped>
.common-layout{
  height: 100%;
  width: 100%;
  margin: 0px;
  padding: 0px;
}

.base-layout{
  height: 100%;
  width: 100%;
  margin: 0px;
  padding: 0px;
  background-color: skyblue;
}

.header-layout{
  height: 60px;
  width:100%;
  margin: 0px;
  padding: 0px;
}

.body-layout{
  height: 100%;
  width: 100%;
  flex-grow: 1;
  margin: 0px;
  padding: 0px;
  align-items: center;
  justify-content: center;
}

.body-container {
  height: 100%;
  width: 100%;
  background-image: url('../assets/Home/JLUbackground.jpg');
  background-size: cover;
}

.footer-layout{
  width:100%;
  margin: 0px;
  padding: 0px;
  background-color: black;
}

.col-center-left{
  display: flex;
  align-items: center;
  background-color: #d9ecff;
}

.col-center-center{
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #d9ecff;
}

.carousel-text-center {
  text-align: center;
  align-items: center;
}

.body-main {
  height: 100%;
  width: 70%;
  align-content: center;
}

.body-aside {
  height: 100%;
  width: 30%;
  align-content: center;
  padding: 25px 10px;
  display: flex;
  justify-content: center;
}

.component-container {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  width: 100%;
  height: 90%;
  margin: auto 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #ebeef5;
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #ebeef5;
}

.component-header h2 {
  font-size: 16px;
  margin: 0;
}

.component-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  overflow: auto;
}

.default-content {
  text-align: center;
  width: 100%;
}

.welcome-text {
  margin-top: 20px;
  font-size: 18px;
  color: #409EFF;
}
</style>
