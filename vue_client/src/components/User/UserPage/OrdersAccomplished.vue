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
    <img :src="item.photo" alt="商品图片" style="width: 100%; height: 200px; object-fit: cover;" />
      <h3 style="margin: 10px 0;">订单编号: {{ item.id }}</h3>
      <p>商品ID: {{ item.goodsId }}</p>
      <p>商品名称: {{ item.goodsName }}</p>
      <p>购买数量: {{ item.count }} 件</p>
      <p>总价格: {{ item.totalPrice }} 元</p>
      <p>到达时间: {{ item.arriveTime }}</p>
      <p>创建时间: {{ item.createTime }}</p>
      <p :style="{
        color: item.status === 7 ? '#67C23A' : 
               item.status === 4 ? '#67C23A' : 
               item.status === 5 ? '#F56C6C' : 
               '#909399',
        fontWeight: 'bold',
        fontSize: '16px',
        letterSpacing: '1px'
      }">
        {{ item.status === 7 ? '已完成' : 
           item.status === 4 ? '商家同意退款' : 
           item.status === 5 ? '商家不同意退款' : 
           '未知状态' }}
      </p>
      
      <!-- 评价按钮 -->
      <el-button type="primary" @click="startEvaluation(item)">评价</el-button>

      <!-- 评价对话框 -->
      <el-dialog 
        v-model="dialogVisible" 
        width="40%" 
        title="订单评价"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <el-form
          :model="commentForm"
          label-position="top"
        >
          <!-- 商品评价 -->
          <el-form-item label="商品评价">
            <div style="margin-bottom: 20px;">
              <p style="margin-bottom: 10px;">商品评分:</p>
              <el-rate v-model="commentForm.goodsDegree" />
            </div>
            <el-input
              type="textarea"
              v-model="commentForm.goodsDescription"
              placeholder="请输入对商品的评价（可选）"
              :maxlength="200"
              show-word-limit
              style="margin-top: 10px;"
            />
            <!-- 商品评价图片上传 -->
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="(file: File) => beforeImageUpload(file, 'goods')"
            >
              <img v-if="commentForm.goodsPhotos[0]" :src="commentForm.goodsPhotos[0]" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>

          <!-- 商家评价 -->
          <el-form-item label="商家评价">
            <div style="margin-bottom: 20px;">
              <p style="margin-bottom: 10px;">商家评分:</p>
              <el-rate v-model="commentForm.sellerDegree" />
            </div>
            <el-input
              type="textarea"
              v-model="commentForm.sellerDescription"
              placeholder="请输入对商家的评价（可选）"
              :maxlength="200"
              show-word-limit
              style="margin-top: 10px;"
            />
            <!-- 商家评价图片上传 -->
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="(file: File) => beforeImageUpload(file, 'seller')"
            >
              <img v-if="commentForm.sellerPhotos[0]" :src="commentForm.sellerPhotos[0]" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>

          <!-- 骑手评价 -->
          <el-form-item label="骑手评价" v-if="currentOrder?.deliverId">
            <div style="margin-bottom: 20px;">
              <p style="margin-bottom: 10px;">骑手评分:</p>
              <el-rate v-model="commentForm.deliverDegree" />
            </div>
            <el-input
              type="textarea"
              v-model="commentForm.deliverDescription"
              placeholder="请输入对骑手的评价（可选）"
              :maxlength="200"
              show-word-limit
              style="margin-top: 10px;"
            />
            <!-- 骑手评价图片上传 -->
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="(file: File) => beforeImageUpload(file, 'deliver')"
            >
              <img v-if="commentForm.deliverPhotos[0]" :src="commentForm.deliverPhotos[0]" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>

          <div style="text-align: right; margin-top: 20px;">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">提交评价</el-button>
          </div>
        </el-form>
      </el-dialog>
    </el-card>

    <el-loading v-if="loadingMore" text="加载中..." />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import api from '@/api/request';
import { useUserStore } from '@/store/user';
import { Plus } from '@element-plus/icons-vue';

const UserStore = useUserStore();

// 定义订单接口
interface OrderItem {
  id: number;
  goodsId: number;
  count: number;
  totalPrice: number;
  arriveTime: string;
  createTime: string;
  purchaseId: number;
  sellId: number;
  status: number;
  deliverName: string;
  photo: string;
  goodsName: string;
  deliverId: number;
}

// 定义评论表单接口
interface CommentForm {
  goodsDegree: number;
  goodsDescription: string;
  goodsPhotos: string[];
  sellerDegree: number;
  sellerDescription: string;
  sellerPhotos: string[];
  deliverDegree: number;
  deliverDescription: string;
  deliverPhotos: string[];
}

const orders = ref<OrderItem[]>([]);
const loadingMore = ref(false);
const dialogVisible = ref(false);
const currentOrder = ref<OrderItem | null>(null);

// 评论表单数据
const commentForm = ref<CommentForm>({
  goodsDegree: 0,
  goodsDescription: '',
  goodsPhotos: [],
  sellerDegree: 0,
  sellerDescription: '',
  sellerPhotos: [],
  deliverDegree: 0,
  deliverDescription: '',
  deliverPhotos: []
});

// 存储选择的图片文件
const selectedFiles = ref<{
  goods: File | null;
  seller: File | null;
  deliver: File | null;
}>({
  goods: null,
  seller: null,
  deliver: null
});

// 获取订单数据
const fetchOrders = async () => {
  try {
    loadingMore.value = true;
    const response = await api.get('/user/orders', {
      headers: {
        authorization: UserStore.authorization
      }
    });

    const data = response.data.data;
    const filteredOrders = data.filter((order: OrderItem) => 
      order.status === 7 || // 已完成
      order.status === 4 || // 商家同意退款
      order.status === 5    // 商家不同意退款
    );
    if (filteredOrders.length > 0) {
      orders.value = filteredOrders;
    } else {
      ElMessage.info('没有符合条件的订单');
    }

    loadingMore.value = false;
  } catch (error) {
    ElMessage.error('获取订单信息失败');
    loadingMore.value = false;
  }
};

// 上传前阻止默认上传并保存文件
const beforeImageUpload = (file: File, type: 'goods' | 'seller' | 'deliver') => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 1;

  if (!isJPG) {
    ElMessage.error('上传图片格式必须是 JPG 或 PNG 格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 1MB!');
    return false;
  }

  // 取消默认上传，保存文件
  selectedFiles.value[type] = file;
  commentForm.value[`${type}Photos`] = [URL.createObjectURL(file)];
  return false; // 阻止自动上传
};

// 初始化评价
const startEvaluation = (item: OrderItem) => {
  currentOrder.value = item;
  commentForm.value = {
    goodsDegree: 0,
    goodsDescription: '',
    goodsPhotos: [],
    sellerDegree: 0,
    sellerDescription: '',
    sellerPhotos: [],
    deliverDegree: 0,
    deliverDescription: '',
    deliverPhotos: []
  };
  selectedFiles.value = {
    goods: null,
    seller: null,
    deliver: null
  };
  dialogVisible.value = true;
};

// 处理表单提交
const handleSubmit = async () => {
  // 检查评分是否已填写
  if (commentForm.value.goodsDegree === 0) {
    ElMessage.error('请对商品进行评分');
    return;
  }
  if (commentForm.value.sellerDegree === 0) {
    ElMessage.error('请对商家进行评分');
    return;
  }
  if (currentOrder.value?.deliverId && commentForm.value.deliverDegree === 0) {
    ElMessage.error('请对骑手进行评分');
    return;
  }

  try {
    await submitEvaluation();
  } catch (error) {
    console.error('评价提交失败:', error);
    ElMessage.error('评价提交失败，请重试');
  }
};

// 提交评价的处理逻辑
const submitEvaluation = async () => {
  if (!currentOrder.value) return;
  
  try {
    console.log('开始提交评价，订单信息:', {
      orderId: currentOrder.value.id,
      goodsId: currentOrder.value.goodsId,
      goodsName: currentOrder.value.goodsName
    });
    
    // 创建 FormData 对象
    const formData = new FormData();
    
    // 提交商品评价
    const goodsCommentData = {
      goodsId: String(currentOrder.value.goodsId),
      deliverId: null,
      usersId: null,
      description: commentForm.value.goodsDescription || null,
      degree: String(commentForm.value.goodsDegree)
    };
    
    console.log('准备提交商品评价:', {
      data: goodsCommentData,
      hasImage: !!selectedFiles.value.goods
    });
    
    formData.append('data', JSON.stringify(goodsCommentData));
    if (selectedFiles.value.goods) {
      formData.append('file', selectedFiles.value.goods);
    }
    
    // 打印商品评价的 FormData
    console.log('商品评价 FormData 内容:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    
    const goodsResponse = await api.post('/user/comment', formData, {
      headers: {
        authorization: UserStore.authorization,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('商品评价提交响应:', {
      status: goodsResponse.status,
      data: goodsResponse.data
    });

    // 提交商家评价
    formData.delete('data');
    formData.delete('file');
    const sellerCommentData = {
      usersId: String(currentOrder.value.sellId),
      deliverId: null,
      goodsId: null,
      description: commentForm.value.sellerDescription || null,
      degree: String(commentForm.value.sellerDegree)
    };
    
    console.log('准备提交商家评价:', {
      data: sellerCommentData,
      hasImage: !!selectedFiles.value.seller
    });
    
    formData.append('data', JSON.stringify(sellerCommentData));
    if (selectedFiles.value.seller) {
      formData.append('file', selectedFiles.value.seller);
    }
    
    // 打印商家评价的 FormData
    console.log('商家评价 FormData 内容:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    
    const sellerResponse = await api.post('/user/comment', formData, {
      headers: {
        authorization: UserStore.authorization,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('商家评价提交响应:', {
      status: sellerResponse.status,
      data: sellerResponse.data
    });

    // 如果有骑手ID，提交骑手评价
    if (currentOrder.value.deliverId) {
      formData.delete('data');
      formData.delete('file');
      const deliverCommentData = {
        deliverId: String(currentOrder.value.deliverId),
        goodsId: null,
        usersId: null,
        description: commentForm.value.deliverDescription || null,
        degree: String(commentForm.value.deliverDegree)
      };
      
      console.log('准备提交骑手评价:', {
        data: deliverCommentData,
        hasImage: !!selectedFiles.value.deliver
      });
      
      formData.append('data', JSON.stringify(deliverCommentData));
      if (selectedFiles.value.deliver) {
        formData.append('file', selectedFiles.value.deliver);
      }
      
      // 打印骑手评价的 FormData
      console.log('骑手评价 FormData 内容:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      const deliverResponse = await api.post('/user/comment', formData, {
        headers: {
          authorization: UserStore.authorization,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('骑手评价提交响应:', {
        status: deliverResponse.status,
        data: deliverResponse.data
      });
    }

    ElMessage.success('评价提交成功！');
    dialogVisible.value = false;
    await fetchOrders(); // 重新获取订单列表
  } catch (error) {
    console.error('评价提交失败:', error);
    ElMessage.error('评价提交失败，请重试');
  }
};

// 初始化加载订单
onMounted(() => {
  fetchOrders();
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

.dialog-footer {
  text-align: right;
}

.avatar-uploader .avatar {
  width: 200px;
  height: 200px;
  display: block;
  object-fit: cover;
  border: 3px solid #000;
  border-radius: 0px;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 150px;
  height: 150px;
  text-align: center;
}
</style>
