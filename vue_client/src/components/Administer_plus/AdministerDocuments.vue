<script setup lang="ts">
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { RouterLink,RouterView } from 'vue-router';
import { ref,onMounted } from 'vue'
import api from '@/api/request'
//引入sotre 以存储管理员（包含authorization）
  import {useAdminStore} from '@/store/admin';
  const  AdminStore = useAdminStore();

interface document{
  id: number,
  purchaseId: number,
  purchaseName: string,
  goodsId: number,
  goodsName: string,
  deliverId: number,
  deliverName: string,
  count: number,
  totalPrice: number,
  appealDescription: string,
  appealPhotos: string,
  status: number,
  createTime: string,
  updateTime: string,
  arriveTime: string
}

const origin_documents = ref<document[]>([])
const documents = ref<document[]>([])
const document = ref<document>()
const selected_document = ref<document>()

console.log(AdminStore.authorization);
onMounted(()=>{
  api.get('/admin/orders'  , {headers :{ authorization : AdminStore.authorization }})
  .then(res=>{
    console.log(res.data.data)
    origin_documents.value = res.data.data
    documents.value = origin_documents.value
  })
  .catch(err=>{
    console.log(err)
  })
})

const querySearch = (queryString : any, cb : any)=>{
      const results = <document[]>[]
      if(!queryString) //无内容
    {
      for(let i = 0; i < origin_documents.value.length; i++){
        results.push(origin_documents.value[i])
      }
    }
    else{
      for(let i = 0; i < origin_documents.value.length; i++){
        if(origin_documents.value[i].appealDescription.toLowerCase().indexOf(queryString.toLowerCase()) != -1){
          results.push(origin_documents.value[i])
        }
      }
    }
      cb(results)
    }
    const handleSelect = (queryString : any) => {
      selected_document.value = queryString
    }

    const perform = ()=>{
      documents.value = []
      if(selected_document.value)
      {
        for(let i = 0; i < origin_documents.value.length; i++){
        if(origin_documents.value[i].appealDescription.toLowerCase().indexOf(selected_document.value.appealDescription.toLowerCase()) != -1){
          documents.value.push(origin_documents.value[i])
        }
      }
    }
    }

    const reset = ()=>{
      documents.value = origin_documents.value
    }

    function Agreement(index : any){
      origin_documents.value[index].status = 4
      documents.value[index].status = 4
      api.put('/admin/orders/'+documents.value[index].id,{"status":4},{headers :{ authorization : AdminStore.authorization }})
      .then(res=>{
        console.log(res.data)
        alert("已同意退款")
      })
      .catch(err=>{
        console.log(err)
      })
    }

    function Objection(index : any){
      origin_documents.value[index].status = 5
      documents.value[index].status = 5
      api.put('/admin/orders/'+documents.value[index].id,{"status":5},{headers :{ authorization : AdminStore.authorization }})
      .then(res=>{
        console.log(res.data)
        alert("已拒绝退款")
      })
      .catch(err=>{
        console.log(err)
      })
    }
</script>
<template>
  <div class="common-layout">
    <el-autocomplete v-model="document" value-key="appealDescription" class="inline-input w-50" :fetch-suggestions="querySearch" clearable placeholder="输入账单描述" style="width: 200px" @select="handleSelect" @change="reset"></el-autocomplete>
    <el-button type="primary" @click="perform">确定</el-button>
    <el-table :data="documents" style="width: 100%" stripe border="true" height="600px">
      <el-table-column prop="id" label="订单号" width="180" />
      <el-table-column prop="purchaseId" label="购买者ID" width="180" />
      <el-table-column prop="purchaseName" label="购买者姓名" width="180" />
      <el-table-column prop="goodsId" label="商品ID" width="180" />
      <el-table-column prop="goodsName" label="商品名称" width="180" />
      <el-table-column prop="deliverId" label="配送员ID" width="180" />
      <el-table-column prop="deliverName" label="配送员姓名" width="180" />
      <el-table-column prop="count" label="数量" width="180" />
      <el-table-column prop="totalPrice" label="总价" width="180" />
      <el-table-column prop="appealDescription" label="申诉描述" width="180" />
      <el-table-column prop="appealPhotos" label="申诉图片" width="180" >
        <template #default="scope">
          <div style="width: 110px;height: 110px;display: flex;align-items: center;">
          <img :src="scope.row.appealPhotos" width="50px" height="50px" alt="没有图片">
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="180" sortable>
        <template #default="scope">
        <span v-if="scope.row.status == 0">未配送</span>
        <span v-else-if="scope.row.status == 1">已配送</span>
        <span v-else-if="scope.row.status == 2">已到达</span>
        <span v-else-if="scope.row.status == 3">用户已申诉</span>
        <span v-else-if="scope.row.status == 4">已同意退款</span>
        <span v-else-if="scope.row.status == 5">已拒绝退款</span>
        <span v-else-if="scope.row.status == 6">待管理员审核</span>
        <span v-else-if="scope.row.status == 7">订单已完成</span>
        <span v-else-if="scope.row.status == 8">订单已评论</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="updateTime" label="更新时间" width="180" />
      <el-table-column prop="arriveTime" label="到达时间" width="180" />
      <el-table-column label="操作" width="200px" fixed="right">
        <template #default="scope">
          <div class="button_center">
            <el-button type="primary" v-if="scope.row.status == 6" @click="Agreement(scope.$index)" >同意退款</el-button>
            <el-button type="danger" v-if="scope.row.status == 6" @click="Objection(scope.$index)" >拒绝退款</el-button>
            <span type="primary" v-if="!(scope.row.status == 6)" >禁止操作</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
    .common-layout{
  height: 100%;
  width: 100%;
  margin: 0px;
  padding: 0px;
  background-color: greenyellow;
}
.button_center{
  display: flex;
  justify-content: center;
}
</style>