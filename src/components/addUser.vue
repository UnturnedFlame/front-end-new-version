<template>
  <el-dialog v-model="dialogFormVisible" title="新增用户" width="500" @close="() => {form.username = ''; form.password = ''}"
  :show-close="false" :close-on-click-modal="false" center >
    <el-form :model="form" :rules="rules" ref="formRef" style="margin-right: 70px">
      <el-form-item prop="jobNumber" label="工号" :label-width="formLabelWidth">
        <el-input v-model="form.jobNumber" autocomplete="off" />
      </el-form-item>
      <el-form-item prop="username" label="用户名" :label-width="formLabelWidth">
        <el-input v-model="form.username" autocomplete="off" />
      </el-form-item>
      <el-form-item prop="password" label="密码" :label-width="formLabelWidth">
        <el-input v-model="form.password" autocomplete="off" placeholder="密码须包含数字、大小写字母">
        </el-input>
      </el-form-item>
      <el-form-item prop="email" label="邮箱" :label-width="formLabelWidth">
        <el-input v-model="form.email" autocomplete="off" placeholder="请输入邮箱">
        </el-input>
      </el-form-item>
      <el-form-item prop="role" label="角色权限" :label-width="formLabelWidth">
        <el-radio-group v-model="form.role" style="padding-left: 10px">
          <el-radio label="user" size="large">普通用户</el-radio>
          <!-- <el-radio label="admin" size="large">管理员用户</el-radio> -->
          <el-radio label="superuser" size="large">系统用户</el-radio>
        </el-radio-group>
      </el-form-item>
      
    </el-form>

    <template #footer>
      <div class="button-container" >
        <div class="buttons-right-bottom">
          <el-button @click="handlecancel(formRef)">取消</el-button>
          <el-button type="primary" @click="handleConfirm()">确定</el-button>
        </div>
      </div>

    </template>
  </el-dialog>
</template>

<script setup>
import {reactive, ref} from "vue";
import { useRouter } from 'vue-router';
import { ElMessage } from "element-plus";
import api from '../utils/api.js';

const router = useRouter();
const formRef = ref(null)
const formLabelWidth = '140px'
const dialogFormVisible = ref(true);
const form = reactive({
  username: '',
  password: '',
  role:'user',
  jobNumber: '',
  email: ''
})


// 用户信息表单验证规则
const rules = {
  username: [
    { required: true, message: '用户姓名不能为空', trigger: 'blur' },
    { min: 3, max: 10, message: '用户姓名长度必须在3到10个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 8, message: '密码长度必须至少为8位', trigger: 'blur' },
    { pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, message: '密码必须包含数字、大小写字母', trigger: 'blur' }
  ],
  jobNumber: [
    { required: true, message: '工号不能为空', trigger: 'blur' },
    { min: 5, max: 10, message: '工号长度必须在5到10个字符之间', trigger: 'blur' },
    // 可以添加正则表达式来验证工号的格式，例如只允许数字
    { pattern: /^\d{5,10}$/, message: '工号必须为5到10位数字', trigger: 'blur' }
  ],
  email: [
    { required: false, message: '', trigger: 'blur' },
    // 使用正则表达式来验证邮箱格式
    { pattern: /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/, message: '邮箱格式不正确', trigger: 'blur' }
  ]
}


const handlecancel = (formEl) => {
  if (!formEl) return
  formEl.resetFields()
  dialogFormVisible.value = false
  router.push('/admin/userManage');
}


// 添加用户的信息验证
const handleConfirm = async () => {
  try {
    // 触发表单验证
    const isFormValid = await formRef.value.validate();
    if (!isFormValid) {
      console.error('表单验证失败');
      return;
    }
    else {
      let json_form = JSON.stringify(form);
      api.post('administration/add_user/', json_form)
      .then(response => {
        if (response.data.message === 'add user success') {
          ElMessage({
            message: '用户创建成功',
            type: 'success',
          })
          // 重置表单和关闭对话框
          formRef.value.resetFields();
          dialogFormVisible.value = false;
          // 可能需要重新获取表格数据或其他逻辑
          router.push('/admin/userManage');
        }else {
          ElMessage({
            message: '用户创建失败,' + response.data.message,
            type: 'error',
          })
        }
    })
    .catch(error => {
      console.error('请求错误：', error);
      // 显示错误消息
      ElMessage.error('服务器出错，请稍微重试');
    })
  }
  } catch (error) {
    console.error('创建用户失败', error);
    // 显示错误提示
  }
};
</script>


<style scoped>

</style>