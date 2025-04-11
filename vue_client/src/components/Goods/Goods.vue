<script setup lang="ts">
    import ElementPlus from 'element-plus'
    import 'element-plus/dist/index.css'
    import { RouterLink,RouterView } from 'vue-router';
    import { ref,onMounted } from 'vue'
    import api from '@/api/request'
    //引入sotre 以存储管理员（包含authorization）
  import {useAdminStore} from '@/store/admin';
  import { url } from 'inspector';
  const  AdminStore = useAdminStore();

interface good {
  id: number,
  name: string,
  photo: string,
  description: string,
  prePrice: number,
  price: number,
  amount: number,
  sellId: number,
  createTime: Date,
  updateTime: Date,
  status: number,
  isDelete: number,
}
    
const origin_goods = ref<good[]>([])
const goods = ref<good[]>([])
const good = ref<good>()
const selected_good = ref<good>()
  onMounted(()=>{
  api.get('/admin/goods',{headers:{'Authorization': AdminStore.authorization}})
  .then(res=>{
    console.log(res.data.data)
    origin_goods.value = res.data.data
    goods.value = origin_goods.value
  })
  .catch(err=>{
    console.log(err)
  })
})

function Agreement(index : any){
  origin_goods.value[index].status = 1
  goods.value[index].status = 1
  api.put('/admin/goods/'+goods.value[index].id,{"status":1},{headers:{'Authorization': AdminStore.authorization}})
  .then(res=>{
    console.log(res)
  })
  .catch(err=>{
    console.log(err)
  })
}

function Objection(index : any){
  origin_goods.value[index].status = 2
  goods.value[index].status = 2
  api.put('/admin/goods/'+goods.value[index].id,{"status":2},{headers:{'Authorization': AdminStore.authorization}})
  .then(res=>{
    console.log(res)
  })
  .catch(err=>{
    console.log(err)
  })
}
const querySearch = (queryString : any, cb : any)=>{
      const results = <good[]>[]
      if(!queryString) //无内容
    {
      for(let i = 0; i < origin_goods.value.length; i++){
        results.push(origin_goods.value[i])
      }
    }
    else{
      for(let i = 0; i < origin_goods.value.length; i++){
        if(origin_goods.value[i].name.toLowerCase().indexOf(queryString.toLowerCase()) != -1){
          results.push(origin_goods.value[i])
        }
      }
    }
      cb(results)
    }
    const handleSelect = (queryString : any) => {
      selected_good.value = queryString
    }

    const perform = ()=>{
      goods.value = []
      if(selected_good.value)
      {
        for(let i = 0; i < origin_goods.value.length; i++){
        if(origin_goods.value[i].name.toLowerCase().indexOf(selected_good.value.name.toLowerCase()) != -1){
          goods.value.push(origin_goods.value[i])
        }
      }
    }
    }

    const reset = ()=>{
      goods.value = origin_goods.value
    }
    
    function getpagenumber(){
      return Math.ceil(goods.value.length/12)
    }

    const currentpage = ref(1)

    const handleCurrentChange = (val : number) => {
      currentpage.value = val
    }
</script>

<template>
  <el-autocomplete v-model="good" value-key="name" class="searchzone" :fetch-suggestions="querySearch" clearable placeholder="输入商品名" style="width: 200px" @select="handleSelect" @change="reset"></el-autocomplete>
  <el-button type="primary" @click="perform">确定</el-button>
  <div class="common-layout">
    <el-row :gutter="20">
    <el-col :span="6">
      <div class="grid-content" >
        <el-card shadow="hover" style="height: 400px;width: 100%;" v-if="goods[(currentpage - 1) * 12 + 0]">
          <template #header>
            <span style="font-size: 20px;max-height: 20px;">{{ goods[(currentpage - 1) * 12 + 0].name }}</span>
            <br>
            <span style="font-size: 15px;max-height: 30px;">{{ goods[(currentpage - 1) * 12 + 0].description }}</span>
          </template>
            <img :src = "goods[(currentpage - 1) * 12 + 0].photo" style="width: 200px; height: 200px;" alt="没有图片">
          <template #footer>
            <el-space spacer="|" size="large">
            <span v-if="goods[(currentpage - 1) * 12 + 0].status==0 && !(goods[(currentpage - 1) * 12 + 0].amount<=0)">未上架</span>
            <span v-if="goods[(currentpage - 1) * 12 + 0].status==1 && !(goods[(currentpage - 1) * 12 + 0].amount<=0)">已上架</span>
            <span v-if="goods[(currentpage - 1) * 12 + 0].status==2 && !(goods[(currentpage - 1) * 12 + 0].amount<=0)">违规下架</span>
            <span v-if="goods[(currentpage - 1) * 12 + 0].amount<=0">已售罄</span>
            <el-button type="primary" size="mini" @click="Agreement((currentpage - 1) * 12 + 0)" v-else-if="goods[(currentpage - 1) * 12 + 0].status==0 || goods[(currentpage - 1) * 12 + 0].status==2">通过审核</el-button>
            <el-button type="danger" size="mini" @click="Objection((currentpage - 1) * 12 + 0)" v-if="(goods[(currentpage - 1) * 12 + 0].status==0 || goods[(currentpage - 1) * 12 + 0].status==1) && goods[(currentpage - 1) * 12 + 0].amount>0">驳回</el-button>
            </el-space>
          </template>
        </el-card>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="grid-content" >
        <el-card shadow="hover" style="height: 400px;width: 100%;" v-if="goods[(currentpage - 1) * 12 + 1]">
          <template #header>
            <span style="font-size: 20px;max-height: 20px;">{{ goods[(currentpage - 1) * 12 + 1].name }}</span>
            <br>
            <span style="font-size: 15px;max-height: 30px;">{{ goods[(currentpage - 1) * 12 + 1].description }}</span>
          </template>
          <img :src="goods[(currentpage - 1) * 12 + 1].photo" style="width: 200px; height: 200px;" alt="没有图片"/>
          <template #footer>
            <el-space spacer="|" size="large">
              <span v-if="goods[(currentpage - 1) * 12 + 1].status==0 && !(goods[(currentpage - 1) * 12 + 1].amount<=0)">未上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 1].status==1 && !(goods[(currentpage - 1) * 12 + 1].amount<=0)">已上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 1].status==2 && !(goods[(currentpage - 1) * 12 + 1].amount<=0)">违规下架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 1].amount<=0">已售罄</span>
              <el-button type="primary" size="mini" @click="Agreement((currentpage - 1) * 12 + 1)" v-else-if="goods[(currentpage - 1) * 12 + 1].status==0 || goods[(currentpage - 1) * 12 + 1].status==2">通过审核</el-button>
              <el-button type="danger" size="mini" @click="Objection((currentpage - 1) * 12 + 1)" v-if="(goods[(currentpage - 1) * 12 + 1].status==0 || goods[(currentpage - 1) * 12 + 1].status==1) && goods[(currentpage - 1) * 12 + 1].amount>0">驳回</el-button>
            </el-space>
          </template>
        </el-card>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="grid-content" >
        <el-card shadow="hover" style="height: 100%;width: 100%;" v-if="goods[(currentpage - 1) * 12 + 2]">
          <template #header>
            <span style="font-size: 20px;max-height: 20px;">{{ goods[(currentpage - 1) * 12 + 2].name }}</span>
            <br>
            <span style="font-size: 15px;max-height: 30px;">{{ goods[(currentpage - 1) * 12 + 2].description }}</span>
          </template>
          <img :src="goods[(currentpage - 1) * 12 + 2].photo" style="width: 200px; height: 200px;" alt="没有图片"/>
          <template #footer>
            <el-space spacer="|" size="large">
              <span v-if="goods[(currentpage - 1) * 12 + 2].status==0 && !(goods[(currentpage - 1) * 12 + 2].amount<=0)">未上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 2].status==1 && !(goods[(currentpage - 1) * 12 + 2].amount<=0)">已上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 2].status==2 && !(goods[(currentpage - 1) * 12 + 2].amount<=0)">违规下架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 2].amount<=0">已售罄</span>
              <el-button type="primary" size="mini" @click="Agreement((currentpage - 1) * 12 + 2)" v-else-if="goods[(currentpage - 1) * 12 + 2].status==0 || goods[(currentpage - 1) * 12 + 2].status==2">通过审核</el-button>
              <el-button type="danger" size="mini" @click="Objection((currentpage - 1) * 12 + 2)" v-if="(goods[(currentpage - 1) * 12 + 2].status==0 || goods[(currentpage - 1) * 12 + 2].status==1) && goods[(currentpage - 1) * 12 + 2].amount>0">驳回</el-button>
            </el-space>
          </template>
        </el-card>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="grid-content" >
        <el-card shadow="hover" style="height: 100%;width: 100%;" v-if="goods[(currentpage - 1) * 12 + 3]">
          <template #header>
            <span style="font-size: 20px;max-height: 20px;">{{ goods[(currentpage - 1) * 12 + 3].name }}</span>
            <br>
            <span style="font-size: 15px;max-height: 30px;">{{ goods[(currentpage - 1) * 12 + 3].description }}</span>
          </template>
          <img :src="goods[(currentpage - 1) * 12 + 3].photo" style="width: 200px; height: 200px;" alt="没有图片"/>
          <template #footer>
            <el-space spacer="|" size="large">
              <span v-if="goods[(currentpage - 1) * 12 + 3].status==0 && !(goods[(currentpage - 1) * 12 + 3].amount<=0)">未上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 3].status==1 && !(goods[(currentpage - 1) * 12 + 3].amount<=0)">已上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 3].status==2 && !(goods[(currentpage - 1) * 12 + 3].amount<=0)">违规下架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 3].amount<=0">已售罄</span>
              <el-button type="primary" size="mini" @click="Agreement((currentpage - 1) * 12 + 3)" v-else-if="goods[(currentpage - 1) * 12 + 3].status==0 || goods[(currentpage - 1) * 12 + 3].status==2">通过审核</el-button>
              <el-button type="danger" size="mini" @click="Objection((currentpage - 1) * 12 + 3)" v-if="(goods[(currentpage - 1) * 12 + 3].status==0 || goods[(currentpage - 1) * 12 + 3].status==1) && goods[(currentpage - 1) * 12 + 3].amount>0">驳回</el-button>
            </el-space>
          </template>
        </el-card>
      </div>
    </el-col>
  </el-row>

  <el-row class="interval"/>
  
  <el-row :gutter="20">
    <el-col :span="6">
      <div class="grid-content" >
        <el-card shadow="hover" style="height: 100%;width: 100%;" v-if="goods[(currentpage - 1) * 12 + 4]">
          <template #header>
            <span style="font-size: 20px;max-height: 20px;">{{ goods[(currentpage - 1) * 12 + 4].name }}</span>
            <br>
            <span style="font-size: 15px;max-height: 30px;">{{ goods[(currentpage - 1) * 12 + 4].description }}</span>
          </template>
          <img :src="goods[(currentpage - 1) * 12 + 4].photo" style="width: 200px; height: 200px;" alt="没有图片"/>
          <template #footer>
            <el-space spacer="|" size="large">
              <span v-if="goods[(currentpage - 1) * 12 + 4].status==0 && !(goods[(currentpage - 1) * 12 + 4].amount<=0)">未上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 4].status==1 && !(goods[(currentpage - 1) * 12 + 4].amount<=0)">已上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 4].status==2 && !(goods[(currentpage - 1) * 12 + 4].amount<=0)">违规下架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 4].amount<=0">已售罄</span>
              <el-button type="primary" size="mini" @click="Agreement((currentpage - 1) * 12 + 4)" v-else-if="goods[(currentpage - 1) * 12 + 4].status==0 || goods[(currentpage - 1) * 12 + 4].status==2">通过审核</el-button>
              <el-button type="danger" size="mini" @click="Objection((currentpage - 1) * 12 + 4)" v-if="(goods[(currentpage - 1) * 12 + 4].status==0 || goods[(currentpage - 1) * 12 + 4].status==1) && goods[(currentpage - 1) * 12 + 4].amount>0">驳回</el-button>
            </el-space>
          </template>
        </el-card>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="grid-content" >
        <el-card shadow="hover" style="height: 100%;width: 100%;" v-if="goods[(currentpage - 1) * 12 + 5]">
          <template #header>
            <span style="font-size: 20px;max-height: 20px;">{{ goods[(currentpage - 1) * 12 + 5].name }}</span>
            <br>
            <span style="font-size: 15px;max-height: 30px;">{{ goods[(currentpage - 1) * 12 + 5].description }}</span>
          </template>
          <img :src="goods[(currentpage - 1) * 12 + 5].photo" style="width: 200px; height: 200px;" alt="没有图片"/>
          <template #footer>
            <el-space spacer="|" size="large">
              <span v-if="goods[(currentpage - 1) * 12 + 5].status==0 && !(goods[(currentpage - 1) * 12 + 5].amount<=0)">未上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 5].status==1 && !(goods[(currentpage - 1) * 12 + 5].amount<=0)">已上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 5].status==2 && !(goods[(currentpage - 1) * 12 + 5].amount<=0)">违规下架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 5].amount<=0">已售罄</span>
              <el-button type="primary" size="mini" @click="Agreement((currentpage - 1) * 12 + 5)" v-else-if="goods[(currentpage - 1) * 12 + 5].status==0 || goods[(currentpage - 1) * 12 + 5].status==2">通过审核</el-button>
              <el-button type="danger" size="mini" @click="Objection((currentpage - 1) * 12 + 5)" v-if="(goods[(currentpage - 1) * 12 + 5].status==0 || goods[(currentpage - 1) * 12 + 5].status==1) && goods[(currentpage - 1) * 12 + 5].amount>0">驳回</el-button>
            </el-space>
          </template>
        </el-card>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="grid-content" >
        <el-card shadow="hover" style="height: 100%;width: 100%;" v-if="goods[(currentpage - 1) * 12 + 6]">
          <template #header>
            <span style="font-size: 20px;max-height: 20px;">{{ goods[(currentpage - 1) * 12 + 6].name }}</span>
            <br>
            <span style="font-size: 15px;max-height: 30px;">{{ goods[(currentpage - 1) * 12 + 6].description }}</span>
          </template>
          <img :src="goods[(currentpage - 1) * 12 + 6].photo" style="width: 200px; height: 200px;" alt="没有图片"/>
          <template #footer>
            <el-space spacer="|" size="large">
              <span v-if="goods[(currentpage - 1) * 12 + 6].status==0 && !(goods[(currentpage - 1) * 12 + 6].amount<=0)">未上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 6].status==1 && !(goods[(currentpage - 1) * 12 + 6].amount<=0)">已上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 6].status==2 && !(goods[(currentpage - 1) * 12 + 6].amount<=0)">违规下架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 6].amount<=0">已售罄</span>
              <el-button type="primary" size="mini" @click="Agreement((currentpage - 1) * 12 + 6)" v-else-if="goods[(currentpage - 1) * 12 + 6].status==0 || goods[(currentpage - 1) * 12 + 6].status==2">通过审核</el-button>
              <el-button type="danger" size="mini" @click="Objection((currentpage - 1) * 12 + 6)" v-if="(goods[(currentpage - 1) * 12 + 6].status==0 || goods[(currentpage - 1) * 12 + 6].status==1) && goods[(currentpage - 1) * 12 + 6].amount>0">驳回</el-button>
            </el-space>
          </template>
        </el-card>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="grid-content" >
        <el-card shadow="hover" style="height: 100%;width: 100%;" v-if="goods[(currentpage - 1) * 12 + 7]">
          <template #header>
            <span style="font-size: 20px;max-height: 20px;">{{ goods[(currentpage - 1) * 12 + 7].name }}</span>
            <br>
            <span style="font-size: 15px;max-height: 30px;">{{ goods[(currentpage - 1) * 12 + 7].description }}</span>
          </template>
          <img :src="goods[(currentpage - 1) * 12 + 7].photo" style="width: 200px; height: 200px;" alt="没有图片"/>
          <template #footer>
            <el-space spacer="|" size="large">
              <span v-if="goods[(currentpage - 1) * 12 + 7].status==0 && !(goods[(currentpage - 1) * 12 + 7].amount<=0)">未上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 7].status==1 && !(goods[(currentpage - 1) * 12 + 7].amount<=0)">已上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 7].status==2 && !(goods[(currentpage - 1) * 12 + 7].amount<=0)">违规下架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 7].amount<=0">已售罄</span>
              <el-button type="primary" size="mini" @click="Agreement((currentpage - 1) * 12 + 7)" v-else-if="goods[(currentpage - 1) * 12 + 7].status==0 || goods[(currentpage - 1) * 12 + 7].status==2">通过审核</el-button>
              <el-button type="danger" size="mini" @click="Objection((currentpage - 1) * 12 + 7)" v-if="(goods[(currentpage - 1) * 12 + 7].status==0 || goods[(currentpage - 1) * 12 + 7].status==1) && goods[(currentpage - 1) * 12 + 7].amount>0">驳回</el-button>
            </el-space>
          </template>
        </el-card>
      </div>
    </el-col>
  </el-row>
  
  <el-row class="interval"/>
  
  <el-row :gutter="20">
    <el-col :span="6">
      <div class="grid-content" >
        <el-card shadow="hover" style="height: 100%;width: 100%;" v-if="goods[(currentpage - 1) * 12 + 8]">
          <template #header>
            <span style="font-size: 20px;max-height: 20px;">{{ goods[(currentpage - 1) * 12 + 8].name }}</span>
            <br>
            <span style="font-size: 15px;max-height: 30px;">{{ goods[(currentpage - 1) * 12 + 8].description }}</span>
          </template>
          <img :src="goods[(currentpage - 1) * 12 + 8].photo" style="width: 200px; height: 200px;" alt="没有图片"/>
          <template #footer>
            <el-space spacer="|" size="large">
              <span v-if="goods[(currentpage - 1) * 12 + 8].status==0 && !(goods[(currentpage - 1) * 12 + 8].amount<=0)">未上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 8].status==1 && !(goods[(currentpage - 1) * 12 + 8].amount<=0)">已上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 8].status==2 && !(goods[(currentpage - 1) * 12 + 8].amount<=0)">违规下架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 8].amount<=0">已售罄</span>
              <el-button type="primary" size="mini" @click="Agreement((currentpage - 1) * 12 + 8)" v-else-if="goods[(currentpage - 1) * 12 + 8].status==0 || goods[(currentpage - 1) * 12 + 8].status==2">通过审核</el-button>
              <el-button type="danger" size="mini" @click="Objection((currentpage - 1) * 12 + 8)" v-if="(goods[(currentpage - 1) * 12 + 8].status==0 || goods[(currentpage - 1) * 12 + 8].status==1) && goods[(currentpage - 1) * 12 + 8].amount>0">驳回</el-button>
            </el-space>
          </template>
        </el-card>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="grid-content" >
        <el-card shadow="hover" style="height: 100%;width: 100%;" v-if="goods[(currentpage - 1) * 12 + 9]">
          <template #header>
            <span style="font-size: 20px;max-height: 20px;">{{ goods[(currentpage - 1) * 12 + 9].name }}</span>
            <br>
            <span style="font-size: 15px;max-height: 30px;">{{ goods[(currentpage - 1) * 12 + 9].description }}</span>
          </template>
          <img :src="goods[(currentpage - 1) * 12 + 9].photo" style="width: 200px; height: 200px;" alt="没有图片"/>
          <template #footer>
            <el-space spacer="|" size="large">
              <span v-if="goods[(currentpage - 1) * 12 + 9].status==0 && !(goods[(currentpage - 1) * 12 + 9].amount<=0)">未上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 9].status==1 && !(goods[(currentpage - 1) * 12 + 9].amount<=0)">已上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 9].status==2 && !(goods[(currentpage - 1) * 12 + 9].amount<=0)">违规下架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 9].amount<=0">已售罄</span>
              <el-button type="primary" size="mini" @click="Agreement((currentpage - 1) * 12 + 9)" v-else-if="goods[(currentpage - 1) * 12 + 9].status==0 || goods[(currentpage - 1) * 12 + 9].status==2">通过审核</el-button>
              <el-button type="danger" size="mini" @click="Objection((currentpage - 1) * 12 + 9)" v-if="(goods[(currentpage - 1) * 12 + 9].status==0 || goods[(currentpage - 1) * 12 + 9].status==1) && goods[(currentpage - 1) * 12 + 9].amount>0">驳回</el-button>
            </el-space>
          </template>
        </el-card>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="grid-content" >
        <el-card shadow="hover" style="height: 100%;width: 100%;" v-if="goods[(currentpage - 1) * 12 + 10]">
          <template #header>
            <span style="font-size: 20px;max-height: 20px;">{{ goods[(currentpage - 1) * 12 + 10].name }}</span>
            <br>
            <span style="font-size: 15px;max-height: 30px;">{{ goods[(currentpage - 1) * 12 + 10].description }}</span>
          </template>
          <img :src="goods[(currentpage - 1) * 12 + 10].photo" style="width: 200px; height: 200px;" alt="没有图片"/>
          <template #footer>
            <el-space spacer="|" size="large">
              <span v-if="goods[(currentpage - 1) * 12 + 10].status==0 && !(goods[(currentpage - 1) * 12 + 10].amount<=0)">未上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 10].status==1 && !(goods[(currentpage - 1) * 12 + 10].amount<=0)">已上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 10].status==2 && !(goods[(currentpage - 1) * 12 + 10].amount<=0)">违规下架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 10].amount<=0">已售罄</span>
              <el-button type="primary" size="mini" @click="Agreement((currentpage - 1) * 12 + 10)" v-else-if="goods[(currentpage - 1) * 12 + 10].status==0 || goods[(currentpage - 1) * 12 + 10].status==2">通过审核</el-button>
              <el-button type="danger" size="mini" @click="Objection((currentpage - 1) * 12 + 10)" v-if="(goods[(currentpage - 1) * 12 + 10].status==0 || goods[(currentpage - 1) * 12 + 10].status==1) && goods[(currentpage - 1) * 12 + 10].amount>0">驳回</el-button>
            </el-space>
          </template>
        </el-card>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="grid-content" >
        <el-card shadow="hover" style="height: 100%;width: 100%;" v-if="goods[(currentpage - 1) * 12 + 11]">
          <template #header>
            <span style="font-size: 20px;max-height: 20px;">{{ goods[(currentpage - 1) * 12 + 11].name }}</span>
            <br>
            <span style="font-size: 15px;max-height: 30px;">{{ goods[(currentpage - 1) * 12 + 11].description }}</span>
          </template>
          <img :src="goods[(currentpage - 1) * 12 + 11].photo" style="width: 200px; height: 200px;" alt="没有图片"/>
          <template #footer>
            <el-space spacer="|" size="large">
              <span v-if="goods[(currentpage - 1) * 12 + 11].status==0 && !(goods[(currentpage - 1) * 12 + 11].amount<=0)">未上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 11].status==1 && !(goods[(currentpage - 1) * 12 + 11].amount<=0)">已上架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 11].status==2 && !(goods[(currentpage - 1) * 12 + 11].amount<=0)">违规下架</span>
              <span v-if="goods[(currentpage - 1) * 12 + 11].amount<=0">已售罄</span>
              <el-button type="primary" size="mini" @click="Agreement((currentpage - 1) * 12 + 11)" v-else-if="goods[(currentpage - 1) * 12 + 11].status==0 || goods[(currentpage - 1) * 12 + 11].status==2">通过审核</el-button>
              <el-button type="danger" size="mini" @click="Objection((currentpage - 1) * 12 + 11)" v-if="(goods[(currentpage - 1) * 12 + 11].status==0 || goods[(currentpage - 1) * 12 + 11].status==1) && goods[(currentpage - 1) * 12 + 11].amount>0">驳回</el-button>
            </el-space>
          </template>
        </el-card>
      </div>
    </el-col>
  </el-row>
  <el-pagination
    background
    layout="prev, pager, next"
    :page-count=getpagenumber()
    :current-page=currentpage
    @current-change="handleCurrentChange"
    style="position: fixed; bottom: 60px;"
  />
  
  </div>
</template>


<style scoped>
.common-layout{
  height: 100%;
  width: 100%;
  margin: 0px;
  padding: 0px;
  background-color: aliceblue;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
  background-color: aliceblue;
}
.searchzone{
  margin-left: 20px;
  background-color: aliceblue;
}
.interval{
  height: 20px;
}
</style>