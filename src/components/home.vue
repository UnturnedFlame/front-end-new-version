// 登录界面
<template>
  <el-container>
    <el-main style="height: 93vh;">
      <div class="login-body">
        <!-- <div class="system-name">欢迎使用<span>车轮状态分析与健康评估软件<br>(Beta测试版)</span></div> -->
        <div class="system-name">欢迎使用<span>轨道车辆智能运维通用算法和工具软件<br>(Beta测试版)</span></div>

        <div class="login-panel">
          <div class="login-title">用户登录</div>
          <!-- <div>用户登录</div> -->

          <a-form :model="formState" :rules="rules" ref="formRef" style="width: 70%; height: 80%">
            <div style="text-align: left; font-size: 18px; color: #808080">账号</div>
            <a-form-item  name="username">
              <a-input
                placeholder="请输入账号"
                v-model:value="formState.username"
                size="large"
                type="text"
              >
                <template #prefix>
                  <user-outlined />
                </template>
              </a-input>
            </a-form-item>
            <div style="text-align: left; font-size: 18px;color: #808080">密码</div>
            <a-form-item  name="password">
              <a-input
                placeholder="请输入密码"
                v-model:value="formState.password"
                size="large"
                type="password"
                @keyup.enter.native="login()"
              >
                <template #prefix>
                  <lock-outlined />
                </template>
              </a-input>
            </a-form-item>
            <!-- <a-form-item label="角色" name="role">
              <a-select
                v-model:value="formState.role"
                size="large"
                placeholder="请选择角色"
              >
                <a-select-option value="user">普通用户</a-select-option> 
                <a-select-option value="admin">系统管理员</a-select-option>
                <a-select-option value="superuser">开发者用户</a-select-option>
              </a-select>
            </a-form-item> -->
            <a-form-item label="">
              <a-button
                type="primary"
                html-type="submit"
                style="width: 100%; margin-top: 20px; height: 40px; background-color: #8C8C8C; font-size: 18px"
                @click="login()"
                size="large"
                >登录</a-button
              >
            </a-form-item>
          </a-form>
          <div style="position: absolute; right: 5px; bottom: 0px">
            <el-button @click="goToResetPassword" class="button" style=""> 忘记密码? </el-button>
          </div>
        </div>
      </div>
    </el-main>
    <el-footer style="height: 7vh; background-color: white; display: flex; justify-content: center; align-items: center;">
      <div style="color: black; width: 400px; height: 100%; line-height: 20px;"
      >
        © 2024 国家高速列车青岛技术创新中心 <br/>
        联系我们：nichst@163.com  | 电话：123456 <br/>
        西南交通大学研制
        
      </div>
    </el-footer>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import type { Rule } from "ant-design-vue/es/form";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import api from "../utils/api.js";

const formRef = ref();
// const formState = reactive({
//   username: "",
//   password: "",
//   role: "",
// });

const formState = reactive({
  username: "",
  password: "",
});

const goToResetPassword = () => {
  router.push("/resetPassword");
};

const rules: Record<string, Rule[]> = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 15, message: "用户名长度需在3~15个字符之间", trigger: "blur" },
  ],
  password: [
    { required: true, message: "密码不能为空", trigger: "blur" },
    { min: 8, message: "密码长度必须至少为8位", trigger: "blur" },
    {
      pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
      message: "密码必须包含数字、大小写字母",
      trigger: "blur",
    },
  ],
  role: [
    {
      required: true,
      message: "请选择用户级别",
      trigger: "change",
    },
  ],
};
const router = useRouter();

const login = () => {
  var form_obj = JSON.stringify(formState);
  formRef.value.validate().then(() => {
    api
      .post("/login/", form_obj)
      .then((response) => {
        // 处理响应
        if (response.statusText == "OK") {
          // 假设服务器在成功时返回了数据
          // 登录成功，显示成功消息
          if (response.data.code != 200) {
            // 如果服务器返回的数据不表示成功，则显示错误消息
            ElMessage.error(response.data.message);
            return;
          } else {
            ElMessage({
              message: "登录成功",
              type: "success",
            });

            let role = response.data.role;
            let tokenGot = response.data.token;

            // 保存 token 和登录时间到 localStorage
            window.sessionStorage.setItem("jwt", tokenGot);

            // 保存用户名到 localStorage
            window.sessionStorage.setItem("username", formState.username);

            // 保存用户角色到 localStorage
            window.sessionStorage.setItem("role", role);

            // 根据用户登录时所选择的角色跳转到用户界面或者管理员界面
            if (role == "user" || role == "superuser") {
              router.push("/UserPlatform");
            } else {
              router.push("/admin");
            }
          }
        }
      })
      .catch((error: any) => {
        // 处理错误
        console.error("请求错误：", error);
        // 显示错误消息
        ElMessage.error("服务器出错，请稍微重试");
      });
  });
};
</script>

<style lang="scss" scoped>
.login-body {
  background: url("../assets/login-background-2.jpg") no-repeat center center;
  height: 100%;
  width: 100%;
  background-size: cover;
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  left: 0;
  top: 0;
  font-family: 'Microsoft YaHei';

  .login-panel {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;

    padding: 25px;
    width: 20%;
    min-width: 260px;
    height: 30%;
    min-height: 300px;
    background: rgba(255, 255, 255, 0.75);
    border-radius: 5%;
    box-shadow: 2px 2px 10px #ddd;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .login-title {
      display: inline-block;
      font-size: 25px;
      // height: 30%;
      
      text-align: center;
      margin-bottom: 22px;
    }

    .button {
      border: none;
      background-color: transparent;
      padding: 0;
      margin: 0;
      float: right;
    }
  }

  .user-role-selector {
    text-align: center;
    padding: 8px 15px;
    /* 内边距，使文本周围有些空间 */
    border: 1px solid #ccc;
    /* 边框，颜色可以根据需要调整 */
    border-radius: 4px;
    /* 边框圆角 */
    font-size: 16px;
    /* 字体大小 */
    appearance: none;
    /* 移除默认的样式，使其看起来更统一 */
    background-color: white;
    /* 背景颜色 */
    color: #333;
    /* 文字颜色 */
    width: 60%;
    /* 宽度，根据需要调整 */
    cursor: pointer;
    /* 鼠标悬停时显示手形图标 */
  }

  /* 为下拉箭头添加样式，这里使用了一个伪元素 */
  .user-role-selector::after {
    content: "▼";
    /* 下拉箭头的字符 */
    position: absolute;
    right: 10px;
    /* 距离右侧的距离 */
    top: 50%;
    transform: translateY(-50%);
    /* 垂直居中对齐 */
    pointer-events: none;
    /* 防止点击箭头时触发其他事件 */
  }

  /* 为下拉菜单的选项添加样式 */
  .user-role-selector option {
    padding: 5px;
    /* 选项的内边距 */
    background-color: #fff;
    /* 选项的背景颜色 */
    color: #000;
    /* 选项的文字颜色 */
  }

  .admin-login {
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
  }

  .el-select-dropdown__item {
    text-align: center;
    /* 使文本居中 */
  }
}

.system-name {
  position: absolute;
  top: 100px;
  
  text-align: center;
  color: #ffffff;
  font-family: "Arial", sans-serif;
  font-size: 3rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.system-name span {
  color: #ffd700;
}

/* // 设置下拉框的背景颜色及边框属性； */
.custom-select {
  .el-select-dropdown {
    /* // 若不将下拉框的背景颜色设置为：transparent，那么做不出来半透明的效果；
  // 因为其最终的显示为：下拉框有一个背景颜色且下拉框的字体有一个背景颜色，重叠后的效果展示； */
    border: 1px solid #326aff;
    background: #04308d !important;
  }
}

/* // 设置下拉框的字体属性及背景颜色； */
.custom-select {
  :deep(.el-select-dropdown__item) {
    width: 100%;
    font-size: 7px;
    color: #fff;
    font-weight: 200;
    background-color: #04308d;
  }
}

/* // 设置下拉框列表的 padding 值为：0；(即：样式调整) */
.custom-select {
  :deep(.el-select-dropdown__list) {
    /* padding-top: 10px; */
    padding: 0;
    background-color: red;
  }
}

/* // 设置输入框与下拉框的距离为：0; (即：样式调整) */
.custom-select {
  .el-popper[x-placement^="bottom"] {
    margin-top: 5px;
  }
}

/* // 将下拉框上的小箭头取消；(看着像一个箭头，其实是两个重叠在一起的箭头) */
// .custom-select :deep .el-popper .popper__arrow,
// .custom-select :deep .el-popper .popper__arrow::after {
//   display: none;
// }

/* // 设置鼠标悬停在下拉框列表的悬停色； */
.custom-select {
  :deep(.el-select-dropdown__item:hover) {
    color: rgb(213, 215, 230);
    background-color: #326aff;
  }
}

a-button {
  width: 100%;
  margin-top: 20px;
  height: 40px;
  background-color: #8C8C8C;
  font-size: 18px;
  transition: background-color 0.3s ease; /* 添加过渡效果 */
}

a-button:hover {
  background-color: #D3D3D3; /* 淡灰色 */
}
</style>
