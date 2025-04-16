<script setup lang="ts">
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { RouterLink,RouterView } from 'vue-router';
import  { nextTick, onMounted,ref }  from 'vue';
import api from '@/api/request'
import * as echarts from 'echarts'
//引入sotre 以存储管理员（包含authorization）
import {useAdminStore} from '@/store/admin';
  const  AdminStore = useAdminStore();

interface good_data {
  goods_num: number,
  sell_Money: number,
  sell_num: number,
  sell_Month_num: number,
  sell_Money_Month: number,
}

const goodData = ref<good_data>({
  goods_num: 0,
  sell_Money: 0,
  sell_num: 0,
  sell_Month_num: 0,
  sell_Money_Month: 0,
})

onMounted(()=>{
  api.get('/admin/data',{headers:{'Authorization': AdminStore.authorization}})
  .then(res=>{
    console.log(res.data.data)
    goodData.value = res.data.data
    nextTick(()=>{
      const chart1 = echarts.init(document.getElementById('pie-chart1') as HTMLElement)
      const chart2 = echarts.init(document.getElementById('pie-chart2') as HTMLElement)
      const option1 = {
        title:{
          text:'商品数量'
        },
        legend:{
          data:['商品数量']
        },
        xAxis:{
          data:['已售商品数量','在售商品数量']
        },
        yAxis:{},
        series:[{type:'bar',data:[goodData.value.sell_num,goodData.value.goods_num]}] 
      }
      const option2 = {
        title:{
          text:'商品销售金额'
        },
        legend:{
          data:['商品销售金额']
        },
        xAxis:{
          data:['已售商品金额','在售商品金额','月销售金额']
        },
        yAxis:{},
        series:[{type:'bar',data:[goodData.value.sell_Money,goodData.value.sell_Money_Month,goodData.value.sell_Money_Month]}] 
      }
      chart1.setOption(option1)
      chart2.setOption(option2)
    })
  })
  .catch(err=>{
    console.log(err)
  })
  
  
})

</script>
<template>
  <div id="pie-chart1" style="width: 600px;height:400px;"></div>
  <div id="pie-chart2" style="width: 600px;height:400px;"></div>
</template>

<style scoped>

</style>