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
        <el-dialog 
          v-model="commentDialogVisible" 
          title="评论列表" 
          width="70%"
          :destroy-on-close="false"
          :close-on-click-modal="false"
          :close-on-press-escape="false"
          :append-to-body="true"
        >
          <!-- 评论统计信息 -->
          <div style="margin-bottom: 20px;">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-statistic title="总评论数" :value="comments.length" />
              </el-col>
              <el-col :span="8">
                <el-statistic title="好评数" :value="comments.filter(c => c.degree >= 4).length" />
              </el-col>
              <el-col :span="8">
                <el-statistic title="差评数" :value="comments.filter(c => c.degree < 4).length" />
              </el-col>
            </el-row>
          </div>

          <!-- 搜索和筛选 -->
          <div style="margin-bottom: 20px; display: flex; gap: 20px;">
            <el-input
              v-model="commentSearchQuery"
              placeholder="搜索评论内容"
              clearable
              style="width: 200px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-select v-model="commentFilterBy" placeholder="评论类型" clearable>
              <el-option label="全部" value="all" />
              <el-option label="好评" value="good" />
              <el-option label="差评" value="bad" />
            </el-select>

            <el-select v-model="commentSortBy" placeholder="排序方式">
              <el-option label="最新评论" value="time-desc" />
              <el-option label="最早评论" value="time-asc" />
              <el-option label="评分从高到低" value="degree-desc" />
              <el-option label="评分从低到高" value="degree-asc" />
            </el-select>
          </div>

          <!-- 评论表格 -->
          <el-skeleton v-if="loading" :rows="5" animated />
          <template v-else>
            <el-table 
              :data="sortedAndFilteredComments.slice((currentPage-1)*pageSize, currentPage*pageSize)" 
              style="width: 100%"
              :row-key="(row: CommentItem) => row.id"
              :lazy="true"
              :max-height="400"
            >
              <el-table-column prop="degree" label="评分" width="200">
                <template #default="scope">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <el-rate v-model="scope.row.degree" disabled show-score />
                    <el-tag :type="scope.row.degree >= 4 ? 'success' : 'danger'">
                      {{ scope.row.degree >= 4 ? '好评' : '差评' }}
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="评论描述" show-overflow-tooltip min-width="200"/>
              <el-table-column prop="avatarUrl" label="评论图片" width="100">
                <template #default="scope">
                  <el-image 
                    v-if="scope.row.avatarUrl"
                    :src="scope.row.avatarUrl"
                    :preview-src-list="[scope.row.avatarUrl]"
                    style="width: 50px; height: 50px; cursor: pointer;"
                    fit="cover"
                    loading="lazy"
                  />
                  <span v-else>无图片</span>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="评论时间" width="150">
                <template #default="scope">
                  {{ formatDate(scope.row.createTime) }}
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="sortedAndFilteredComments.length"
              :page-sizes="[5, 10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              style="margin-top: 20px;"
            />
          </template>
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
const filterBy = ref('all');
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

// 评论相关变量
const commentSearchQuery = ref(''); // 评论搜索
const commentSortBy = ref('time-desc'); // 评论排序
const commentFilterBy = ref('all'); // 评论筛选

// 添加评论缓存
const commentCache = new Map<number, CommentItem[]>();

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
    loading.value = true;
    console.log('打开评论弹窗，商品信息:', {
      id: item.id,
      name: item.name,
      price: item.price
    });
    
    // 检查缓存
    if (commentCache.has(item.id)) {
      console.log('从缓存获取评论数据，商品ID:', item.id);
      comments.value = commentCache.get(item.id)!;
    } else {
      console.log('开始请求评论数据:', {
        url: '/user/goods/comment/' + item.id,
        method: 'GET',
        headers: {
          authorization: UserStore.authorization
        }
      });
      
      const response = await api.get('/user/goods/comment/'+item.id, {
        headers: {
          authorization: UserStore.authorization
        }
      });
      
      console.log('评论数据请求响应:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      comments.value = response.data.data;
      console.log('获取到的评论数据:', {
        total: comments.value.length,
        goodComments: comments.value.filter(c => c.degree >= 4).length,
        badComments: comments.value.filter(c => c.degree < 4).length,
        comments: comments.value
      });
      // 存入缓存
      commentCache.set(item.id, comments.value);
    }
    
    // 重置搜索和排序
    commentSearchQuery.value = '';
    commentSortBy.value = 'time-desc';
    commentFilterBy.value = 'all';
    currentPage.value = 1;
    
    commentDialogVisible.value = true;
  }
  catch (error) {
    console.error('获取商品评论信息失败：', error);
    ElMessage.error('获取商品评论信息失败');
  } finally {
    loading.value = false;
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

// 添加时间格式化函数
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 修改评论计算属性，添加日志
const sortedAndFilteredComments = computed(() => {
  let result = [...comments.value];
  console.log('开始处理评论数据，原始评论数:', result.length);
  
  // 搜索过滤
  if (commentSearchQuery.value) {
    result = result.filter(c => 
      c.description.toLowerCase().includes(commentSearchQuery.value.toLowerCase())
    );
    console.log('搜索过滤后评论数:', result.length);
  }
  
  // 好评/差评过滤
  if (commentFilterBy.value === 'good') {
    result = result.filter(c => c.degree >= 4);
    console.log('好评过滤后评论数:', result.length);
  } else if (commentFilterBy.value === 'bad') {
    result = result.filter(c => c.degree < 4);
    console.log('差评过滤后评论数:', result.length);
  }
  
  // 排序
  if (commentSortBy.value === 'time-desc') {
    result.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
    console.log('按时间降序排序完成');
  } else if (commentSortBy.value === 'time-asc') {
    result.sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime());
    console.log('按时间升序排序完成');
  } else if (commentSortBy.value === 'degree-desc') {
    result.sort((a, b) => b.degree - a.degree);
    console.log('按评分降序排序完成');
  } else if (commentSortBy.value === 'degree-asc') {
    result.sort((a, b) => a.degree - b.degree);
    console.log('按评分升序排序完成');
  }
  
  console.log('最终处理后的评论数据:', {
    total: result.length,
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    showing: result.slice((currentPage.value-1)*pageSize.value, currentPage.value*pageSize.value)
  });
  
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

.el-image {
  border-radius: 4px;
  transition: transform 0.3s;
}

.el-image:hover {
  transform: scale(1.1);
}
</style>
  