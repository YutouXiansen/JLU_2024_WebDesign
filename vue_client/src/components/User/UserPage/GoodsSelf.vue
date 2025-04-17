<template>
  <div 
    ref="scrollContainer" 
    style="height: 80vh; overflow-y: auto; display: flex; flex-wrap: wrap; gap: 20px; margin-top: 20px;"
  >
    <el-card 
      v-for="(item, index) in goods" 
      :key="item.id" 
      shadow="hover"
      style="width: 300px;"
    >
      <img :src="item.photo" alt="商品图片" style="width: 100%; height: 200px; object-fit: cover;" />
      <h3 style="margin: 10px 0;">{{ item.name }}</h3>
      <p>{{ item.description }}</p>
      <p>价格: {{ item.price }} 元</p>
      <p>余量: {{ item.amount }} 件</p>
      <el-tag v-if="item.status === 1" type="success" style="margin-bottom: 10px;">
        通过审核
      </el-tag>

      <!-- 审核通过，显示修改按钮 -->
      <div v-if="item.status === 1">
        <el-button type="primary" @click="openDialog(item)">
          修改
        </el-button>
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
      </div>

      <!-- 其他状态的商品 -->
      <el-tag v-else-if="item.status === 0" type="info">
        正在审核
      </el-tag>

      <el-tag v-else-if="item.status === 2" type="danger">
        未通过审核
      </el-tag>
    </el-card>

    <!-- 修改弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="修改商品"
      width="40%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-position="top"
        label-width="auto"
      >
        <!-- 商品名称 -->
        <el-form-item label="商品名称">
          <el-input v-model="formData.name" disabled />
        </el-form-item>

        <!-- 上传商品图片 -->
        <el-form-item label="商品图片">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
          >
            <img v-if="formData.photo" :src="formData.photo" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
  
        <!-- 商品描述 -->
        <el-form-item label="商品描述" prop="description">
          <el-input
            type="textarea"
            v-model="formData.description"
            placeholder="请输入商品描述"
            :maxlength="200"
            show-word-limit
          />
        </el-form-item>
    
        <!-- 商品价格 -->
        <el-form-item label="商品价格" prop="price">
          <el-input-number 
            v-model="formData.price" 
            :min="0" 
            :precision="2"
            :step="0.1"
            :controls="true"
          />
        </el-form-item>
    
        <!-- 商品数量 -->
        <el-form-item label="商品数量" prop="amount">
          <el-input-number 
            v-model="formData.amount" 
            :min="0" 
            :step="1"
            :controls="true"
          />
        </el-form-item>
      </el-form>
    
      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import api from '@/api/request';
import { useUserStore } from '@/store/user';

const UserStore = useUserStore();
const scrollContainer = ref<HTMLElement | null>(null);
const formRef = ref<FormInstance>();
const submitting = ref(false);
const selectedFile = ref<File | null>(null);

interface GoodsItem {
  id: number;
  name: string;
  photo: string;
  description: string;
  price: number;
  sellId: number;
  amount: number;
  status: number;
}

interface FormData {
  id: number;
  name: string;
  photo: string;
  description: string;
  price: number;
  amount: number;
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
const goods = ref<GoodsItem[]>([]);
const comments = ref<CommentItem[]>([]); // 存储评论数据
const dialogVisible = ref(false);
const commentDialogVisible = ref(false); // 控制评论弹窗显示
const formData = ref<FormData>({
  id: 0,
  name: '',
  photo: '',
  description: '',
  price: 0,
  amount: 0
});

const rules = {
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' },
    { min: 1, max: 200, message: '描述长度在 1 到 200 个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于等于0', trigger: 'blur' }
  ],
  amount: [
    { required: true, message: '请输入商品数量', trigger: 'blur' },
    { type: 'number', min: 0, message: '数量必须大于等于0', trigger: 'blur' }
  ]
};

// 评论相关变量
const commentSearchQuery = ref('');
const commentSortBy = ref('time-desc');
const commentFilterBy = ref('all');
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

// 添加评论缓存
const commentCache = new Map<number, CommentItem[]>();

// 格式化日期的函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 评论过滤和排序的计算属性
const sortedAndFilteredComments = computed(() => {
  let result = [...comments.value];

  // 搜索过滤
  if (commentSearchQuery.value) {
    const query = commentSearchQuery.value.toLowerCase();
    result = result.filter(comment => 
      comment.description?.toLowerCase().includes(query)
    );
  }

  // 评论类型过滤
  if (commentFilterBy.value !== 'all') {
    result = result.filter(comment => 
      commentFilterBy.value === 'good' ? comment.degree >= 4 : comment.degree < 4
    );
  }

  // 排序
  result.sort((a, b) => {
    switch (commentSortBy.value) {
      case 'time-desc':
        return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
      case 'time-asc':
        return new Date(a.createTime).getTime() - new Date(b.createTime).getTime();
      case 'degree-desc':
        return b.degree - a.degree;
      case 'degree-asc':
        return a.degree - b.degree;
      default:
        return 0;
    }
  });

  return result;
});

onMounted(async () => {
  await fetchGoods();
});

const fetchGoods = async () => {
  try {
    const response = await api.get('/user/selfGoods', {
      headers: {
        authorization: UserStore.authorization
      }
    });

    if (response.data.code === 200) {
      goods.value = response.data.data;
    } else {
      ElMessage.error('获取商品列表失败');
    }
  } catch (error) {
    ElMessage.error('获取商品列表失败，请稍后重试');
  }
};

const openDialog = (item: GoodsItem) => {
  formData.value = {
    id: item.id,
    name: item.name,
    photo: item.photo,
    description: item.description,
    price: item.price,
    amount: item.amount
  };
  selectedFile.value = null;
  dialogVisible.value = true;
};

const commentDialog = async (item: GoodsItem) => {
  loading.value = true;
  try {
    // 检查缓存
    if (commentCache.has(item.id)) {
      comments.value = commentCache.get(item.id) || [];
      loading.value = false;
      commentDialogVisible.value = true;
      return;
    }

    const response = await api.get('/user/goods/comment/'+item.id, {
      headers: {
        authorization: UserStore.authorization
      }
    });
    
    if (response.data.code === 200) {
      comments.value = response.data.data;
      // 更新缓存
      commentCache.set(item.id, comments.value);
      console.log("商品评论信息", comments.value);
    } else {
      ElMessage.warning('暂无评论数据');
      comments.value = [];
    }
  } catch (error) {
    console.error('获取商品评论信息失败：', error);
    ElMessage.error('获取商品评论信息失败');
    comments.value = [];
  } finally {
    loading.value = false;
    commentDialogVisible.value = true;
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
  formRef.value?.resetFields();
  selectedFile.value = null;
};

// 上传前阻止默认上传并保存文件
const beforeImageUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 1;

  if (!isJPG) {
    ElMessage.error('上传图片格式必须是 JPG 或 PNG 格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!');
    return false;
  }

  // 取消默认上传，保存文件
  selectedFile.value = file;
  formData.value.photo = URL.createObjectURL(file); // 预览图片
  return false; // 阻止自动上传
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
  } catch (error) {
    return;
  }

  submitting.value = true;
  try {
    const formDataObj = new FormData();
    formDataObj.append('data', JSON.stringify({
      description: formData.value.description,
      price: formData.value.price,
      amount: formData.value.amount,
    }));

    // 如果有新图片，添加图片
    if (selectedFile.value) {
      formDataObj.append('file', selectedFile.value);
    }

    const response = await api.put(`/user/${formData.value.id}`, formDataObj, {
      headers: {
        'Content-Type': 'multipart/form-data',
        authorization: UserStore.authorization
      }
    });

    if (response.data.code === 200) {
      ElMessage.success('修改成功');
      await fetchGoods();
      dialogVisible.value = false;
    } else {
      ElMessage.error(response.data.msg || '修改失败');
    }
  } catch (error) {
    ElMessage.error('修改失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.el-card {
  margin-bottom: 20px;
}

.el-button {
  margin-top: 10px;
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
