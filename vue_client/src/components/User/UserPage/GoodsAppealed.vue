<template>
    <div 
      ref="scrollContainer" 
      style="height: 80vh; overflow-y: auto; display: flex; flex-wrap: wrap; gap: 20px; margin-top: 20px;"
    >
      <el-card 
        v-for="(item, index) in orders" 
        :key="item.id" 
        shadow="hover"
        style="width: 300px;"
      >
        <h3 style="margin: 10px 0;">订单编号: {{ item.id }}</h3>
        <p>商品ID: {{ item.goodsId }}</p>
        <p>购买数量: {{ item.count }} 件</p>
        <p>总价格: {{ item.totalPrice }} 元</p>
        <p>到达时间: {{ item.arriveTime }}</p>
        <p>创建时间: {{ item.createTime }}</p>
        <el-button v-if="item.status === 3" type="primary" @click="handleAppeal(item.id, true)">同意退款</el-button>
        <el-button v-if="item.status === 3" type="danger" @click="handleAppeal(item.id, false)">拒绝退款</el-button>
        <p v-else-if="item.status === 4" style="color: green; font-weight: bold; font-size: 16px; letter-spacing: 1px;">
          同意退款
        </p>
        <p v-else-if="item.status === 5" style="color: blue; font-weight: bold; font-size: 16px; letter-spacing: 1px;">
          拒绝退款
        </p>
        <p v-else-if="item.status === 6" style="color: blue; font-weight: bold; font-size: 16px; letter-spacing: 1px;">
          用户官方申诉,管理员介入中
        </p>
        <p v-if="item.appealDescription" style="color: #808080; font-size: 14px;">
          申诉描述: {{ item.appealDescription }}
        </p>

        <img v-if="item.appealPhotos" :src="item.appealPhotos" alt="申诉图片" style="width: 100%; margin-top: 10px;" />
      </el-card>
      
      <el-loading v-if="loadingMore" text="加载中..." />
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { ElMessage } from 'element-plus';
  import api from '@/api/request'; // 导入封装好的axios实例
  import { useUserStore } from '@/store/user'; // 调用用户的store获取authorization
  
  const UserStore = useUserStore(); // 获取用户的authorization
  
  // 定义订单接口
  interface OrderItem {
    id: number;            // 订单编号
    goodsId: number;       //商品编号
    count: number;         //待送商品数目
    totalPrice: number;    //总价格
    arriveTime: string;    //订单送达时间
    createTime: string;    //订单创建时间
    purchaseId: number;    //购买者ID
    sellId: number;        //卖家ID
    status: number;        //订单状态
    deliverName: string;    //配送骑手昵称
    appealDescription: string ;//申诉描述
    appealPhotos: string  //申诉图片
  }
  
  // 定义 orders 为 OrderItem 数组类型
  const orders = ref<OrderItem[]>([]);
  const loadingMore = ref(false); // 是否正在加载更多
  
  // 定义 scrollContainer 用于绑定滚动容器
  const scrollContainer = ref<HTMLElement | null>(null);
  
  // 获取订单数据
  const fetchOrders = async () => {
    try {
      loadingMore.value = true;
      // 获取所有订单数据的API请求
      const response = await api.put('/user/sellOrders',null , {
        headers: {
          authorization: UserStore.authorization // 获取用户的token
        }
      });
  
      const data = response.data.data;
      
      // 过滤 status 为 3 ，4 ，5，6的订单 // 获取申诉中的订单
        const filteredOrders = data.filter((order: OrderItem) => {
                      return [3, 4, 5,6 ].includes(order.status);
          }); 
      console.log("被申诉中的订单" ,filteredOrders );
      if (filteredOrders.length > 0) {
        orders.value = filteredOrders; // 将过滤后的订单赋值给 orders
      } else {
        ElMessage.info('没有申诉中的订单');
      }
  
      loadingMore.value = false;
    } catch (error) {
      console.error('获取申诉订单信息失败：', error);
      ElMessage.error('获取申诉订单信息失败');
      loadingMore.value = false;
    }
  };
  
  // 处理申诉的函数
const handleAppeal = async (orderId: number, isApproved: boolean) => {
  try {
    // 根据 isApproved 来确定 status 值：同意为 4，拒绝为 5
    const status = isApproved ? 4 : 5;

    // 调用 API 处理申诉
    const response = await api.put(`/user/appealOrders/${orderId}`, {
      status: status
    }, {
      headers: {
        authorization: UserStore.authorization
      }
    });

    if (response.data.code === 200) {
      ElMessage.success(isApproved ? '已同意退款' : '已拒绝退款');
      fetchOrders(); // 重新获取订单数据以刷新列表
    } else {
      ElMessage.error('处理申诉失败');
    }
  } catch (error) {
    console.error('处理申诉失败：', error);
    ElMessage.error('处理申诉失败');
  }
};

  
  // 初始化加载订单
  onMounted(() => {
    fetchOrders(); // 第一次加载订单
  });
  </script>
  
  <style scoped>
  .el-card {
    margin-bottom: 20px;
  }
  
  .el-button {
    margin-top: 10px;
  }
  
  .el-loading {
    text-align: center;
    width: 100%;
    margin-top: 20px;
  }
  </style>
  