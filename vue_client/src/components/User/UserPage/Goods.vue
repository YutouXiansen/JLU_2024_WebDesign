<template>
  <div class="goods-container">
    <!-- 搜索和排序区域 -->
    <div class="search-sort-container">
      <el-input
        v-model="searchQuery"
        placeholder="搜索商品名称或描述"
        class="search-input"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="sortBy" placeholder="排序方式" @change="handleSort">
        <el-option label="价格从低到高" value="price-asc" />
        <el-option label="价格从高到低" value="price-desc" />
        <el-option label="最新发布" value="time-desc" />
      </el-select>
    </div>

    <div 
      ref="scrollContainer" 
      style="height: 80vh; overflow-y: auto; display: flex; flex-wrap: wrap; gap: 20px; margin-top: 20px;"
    >
      <el-card 
        v-for="(item, index) in filteredGoods" 
        :key="item.id" 
        shadow="hover"
        style="width: 300px;"
      >
        <img :src="item.photo" alt="商品图片" style="width: 100%; height: 200px; object-fit: cover;" />
        <h3 style="margin: 10px 0;">{{ item.name }}</h3>
        <p>{{ item.description }}</p>
        <p>价格: {{ item.price }} 元</p>
        <p>余量: {{ item.amount }} 件</p>
        <el-button @click="commentDialog(item)">
          查看评论
        </el-button>
        <el-dialog v-model="commentDialogVisible" title="评论列表">
          <el-table :data="comments" style="width: 100%">
            <el-table-column prop="degree" label="评分" />
            <el-table-column prop="description" label="评论描述" show-overflow-tooltip/>
            <el-table-column prop="avatarUrl" label="评论图片" show-overflow-tooltip>
              <template #default="scope">
                <img :src="scope.row.avatarUrl" style="width: 50px; height: 50px;" alt="没有图片"/>
              </template>
            </el-table-column>
          </el-table>
        </el-dialog>
        <el-button v-if="item.amount > 0" type="primary" @click="openDialog(item)">
          购买
        </el-button>
        <el-button v-else type="danger" disabled>
          售罄
        </el-button>
      </el-card>

      <!-- 购买弹窗 -->
      <el-dialog 
        v-model="dialogVisible" 
        title="确认购买"
        width="30%">
        <p>购买商品: {{ selectedGoods?.name }}</p>
        <el-input-number 
          v-model="purchaseCount" 
          :min="1" 
          label="数量"
          style="margin: 20px 0;" 
        />
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmPurchase">确认购买</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import api from '@/api/request'; // 导入封装好的axios实例
import { useUserStore } from '@/store/user'; // user store库

console.log("查看商品界面");
const UserStore = useUserStore(); // 调用以获取该用户的authorization

// 定义 scrollContainer 用于绑定滚动容器
const scrollContainer = ref<HTMLElement | null>(null);

// 定义商品接口
interface GoodsItem {
  id: number;
  name: string;
  photo: string;
  description: string;
  price: number;
  sellId: number;
  amount: number;
  createTime: string;
}

interface CommentItem {
  id: number,
	commentId: number,
	degree: number,
	deliverId: number,
	goodsId: number,
	usersId: number,
	avatarUrl: string,
	description: string,
	createTime: string,
	updateTime: string,
	isDelete: number,
	status: number
}
// 定义goods为GoodsItem数组类型
const goods = ref<GoodsItem[]>([]);
const dialogVisible = ref(false); // 控制弹窗显示
const commentDialogVisible = ref(false); // 控制评论弹窗显示
const selectedGoods = ref<GoodsItem | null>(null); // 存储选中的商品
const purchaseCount = ref(1); // 购买数量
const comments = ref<CommentItem[]>([]); // 存储评论数据
// 搜索和排序相关
const searchQuery = ref('');
const sortBy = ref('time-desc');

// 获取商品列表
const fetchGoods = async () => {
  try {
    // 获取用户数据的API请求
    const response = await api.get('/user/goods', {
      headers: {
        authorization: UserStore.authorization // pinia里面存储的用户的authorization
      }
    });

    const data = response.data.data;
    goods.value = data; // 将获取到的数据赋值给goods
    console.log("全部商品信息", data);
  } catch (error) {
    console.error('获取商品信息失败：', error);
    ElMessage.error('获取商品信息失败');
  }
};

// 打开购买弹窗
const openDialog = (item: GoodsItem) => {
  console.log("检查item" , item);
  selectedGoods.value = item;
  console.log("检查selectedGoods" ,selectedGoods.value.sellId);
  purchaseCount.value = 1; // 重置购买数量
  dialogVisible.value = true;
};

const commentDialog = async (item: GoodsItem) => {
  try {
    const response = await api.get('/user/goods/comment/'+item.id, {
      headers: {
        authorization: UserStore.authorization
      }
    });
    comments.value = response.data.data; // 将获取到的数据赋值给comments
    console.log("商品评论信息", comments.value);
    commentDialogVisible.value = true; // 显示评论弹窗
  }
  catch (error) {
    console.error('获取商品评论信息失败：', error);
    ElMessage.error('获取商品评论信息失败');
  }
}
// 确认购买操作
const confirmPurchase = async () => {
  if (selectedGoods.value){ 
    try {
      const response = await api.post('/user/purchase', {
        goodsId: selectedGoods.value.id,
        sellId: selectedGoods.value.sellId,
        count: purchaseCount.value
      }, {
        headers: {
          authorization: UserStore.authorization
        }
      });
      console.log(response);
      const { code, msg, data } = response.data;

      if (code == 200) {
        ElMessage.success(`购买 ${selectedGoods.value.name} 成功`);
        dialogVisible.value = false;
      } else {
        ElMessage.error(`购买失败: ${msg}`);
      }
    } catch (error) {
      console.error('购买失败：', error);
      ElMessage.error('购买失败，请稍后重试');
    }
  }
};

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已经在计算属性中实现
};

// 处理排序
const handleSort = () => {
  // 排序逻辑已经在计算属性中实现
};

// 过滤和排序后的商品列表
const filteredGoods = computed(() => {
  let result = [...goods.value];

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query)
    );
  }

  // 排序
  switch (sortBy.value) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'time-desc':
      result.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
      break;
  }

  return result;
});

// 组件挂载时获取数据
onMounted(() => {
  fetchGoods();
});
</script>

<style scoped>
.goods-container {
  padding: 20px;
}

.search-sort-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.search-input {
  width: 300px;
}
</style>
  