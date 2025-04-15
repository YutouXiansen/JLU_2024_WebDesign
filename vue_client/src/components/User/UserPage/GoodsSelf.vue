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
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入商品名称" />
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
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
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

const goods = ref<GoodsItem[]>([]);
const dialogVisible = ref(false);
const formData = ref<FormData>({
  id: 0,
  name: '',
  photo: '',
  description: '',
  price: 0,
  amount: 0
});

const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
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
      name: formData.value.name,
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
