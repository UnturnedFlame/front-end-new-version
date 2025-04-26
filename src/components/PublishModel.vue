/** * 组件名称: PublishModel * 功能描述:
该组件用于发布模型，允许用户上传模型文件、填写模型相关信息，并提交发布请求。 * 主要功能: *
- 提供文件上传功能，支持特定格式的模型文件。 * -
包含表单用于填写模型的详细信息，如名称、描述等。 * -
提交按钮用于将模型信息和文件发送到服务器进行发布。 */

<template>
  <div>
    <div>
      <a-button class="private-algorithm-button" ghost @click="openPublishModelPanel">
        <i class="fa-solid fa-screwdriver-wrench" style="margin-right: 3px"></i>
        <span style="font-family: 'Microsoft YaHei'">模型管理</span>
      </a-button>

      <!-- <a-button v-if="props.userRole === 'superuser'" @click="openPublishModelPanel" >
          <span style="font-family: 'Microsoft YaHei';">模型管理</span>
        </a-button> -->
      <!-- <a-button v-if="props.userRole === 'superuser'" @click="fetchModels" >
          <span style="font-family: 'JetBrains Mono', monospace;width:100%">打开模型库</span>
      </a-button> -->

      <!-- <div
        class="highlight"
        :style="{ bottom: '15px', color: getColor(modelLoaded) }"
        :title="modelLoaded"
      >
        <p>已加载模型</p>
        {{ modelLoaded }}
      </div> -->
      <!-- <div v-if="props.userRole === 'superuser'" @click="openPublishModelPanel"
        >模型管理</div> -->
      <!-- <div
        class="highlight"
        :style="{ bottom: '15px', color: getColor(modelLoaded) }"
        :title="modelLoaded"
      >
        <p>已加载模型</p>
        {{ modelLoaded }}
      </div> -->
    </div>

    <!-- 开发者用户发布已保存的模型 -->
    <el-dialog
      v-model="publishModelPanelVisible"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :width="1100"
    >

      <div
        style="padding: 5px; display: flex; justify-content: left; align-items: center"
      >
        <p style="font-size: 26px; font-weight: bold">模型管理</p>
      </div>
      <div style="height: 1px; background-color: #d3d3d3; margin: 10px 0"></div>
      <div style="display:flex; flex-direction: column; align-items: left;">
       
        <el-input v-model="modelNameSearch" style="width: 240px; margin-bottom: 10px" placeholder="输入模型名称" @input="handleSearch">
          <template #prepend>
            搜索
          </template>
        </el-input>
  
        <el-table
          :data="fetchedModelsInfo"
          height="500"
          stripe
          border
          style="width: 100%"
          empty-text="暂无模型"
        >
          <el-table-column :width="100" property="author" label="模型作者" />
          <el-table-column
            :width="200"
            property="model_name"
            label="模型名称"
            show-overflow-tooltip
          />
          <el-table-column property="description" label="模型描述" show-overflow-tooltip />
          <el-table-column property="isPublish" label="是否发布" show-overflow-tooltip />

          <el-table-column :width="420" label="操作">
            <template #default="scope">
              <div class="button-container">
                <!-- 删除已保存的模型 -->
                <el-popconfirm
                  title="确定要删除该模型吗？"
                  @confirm="deleteModelConfirm(scope.$index, scope.row)"
                >
                  <template #reference>
                    <el-button size="small" type="danger" style="width: 90px"
                      >删除</el-button
                    >
                  </template>

                  <template #actions="{ confirm, cancel }">
                    <el-row>
                      <el-col :span="12"
                        ><el-button size="small" @click="cancel">取消</el-button></el-col
                      >
                      <el-col :span="12">
                        <el-button type="primary" size="small" @click="confirm">
                          确定
                        </el-button>
                      </el-col>
                    </el-row>
                  </template>
                </el-popconfirm>

                <!-- 查看模型信息 -->
                <el-popover placement="bottom" :width="500" trigger="focus">
                  <el-descriptions :title="modelName" :column="3" direction="vertical">
                    <el-descriptions-item label="使用模块" :span="3">
                      <el-tag size="small" v-for="algorithm in modelAlgorithms">{{
                        algorithm
                      }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="算法参数" :span="3">
                      <div v-for="item in modelParams">
                        {{ item.模块名 }}: {{ item.算法 }}
                      </div>
                    </el-descriptions-item>
                  </el-descriptions>
                  <template #reference>
                    <el-button
                      size="small"
                      type="info"
                      style="width: 90px"
                      @click="showModelInfo(scope.row)"
                    >
                      查看模型
                    </el-button>
                  </template>
                </el-popover>
                <!-- 测试报告按钮 -->
                <el-button
                  size="small"
                  type="warning"
                  style="width: 90px"
                  @click="openReportDialog(scope.row)"
                >
                  测试报告
                </el-button>
                
                <!-- 发布模型 -->
                <el-popconfirm
                  :title="
                    scope.row.isPublish == '已发布'
                      ? '是否取消发布该模型？'
                      : '是否发布该模型？'
                  "
                  @confirm="publishModelConfirm(scope.$index, scope.row)"
                >
                  <template #reference>
                    <el-button
                      size="small"
                      :type="scope.row.isPublish == '未发布' ? 'success' : 'warning'"
                      v-if="scope.row.isPublish === '未发布'"
                      style="width: 90px"
                      >{{
                        scope.row.isPublish == "未发布" ? "申请发布" : "取消发布"
                      }}</el-button
                    >
                  </template>

                  <template #actions="{ confirm, cancel }">
                    <el-row>
                      <el-col :span="12"
                        ><el-button size="small" @click="cancel">取消</el-button></el-col
                      >
                      <el-col :span="12">
                        <el-button type="primary" size="small" @click="confirm">
                          确定
                        </el-button>
                      </el-col>
                    </el-row>
                  </template>
                </el-popconfirm> 
                <el-button type="text" @click="exportModel(scope.row.id)">导出模型</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- <el-dialog v-model="reportDialogVisible" title="上传测试报告" width="30%">
      <el-upload
        ref="upload"
        :auto-upload="false"
        :on-exceed="handleExceed"
        :limit="1"
        :on-change="handleChange"
        v-model:fileList="fileList"
        accept=".pdf"
      >
        <el-button slot="trigger" type="primary">选取文件</el-button>
        <el-button type="success" @click="submitUpload">保存</el-button>
      </el-upload>
    </el-dialog> -->
     <!-- 测试报告对话框 -->
     <el-dialog v-model="reportDialogVisible" title="测试报告" width="30%">
        <div v-if="currentModel && currentModel.report_path" style="font-size: 20px;">
          已上传
          <i class="fa-solid fa-file-pdf" style="color: #ff0000; margin-right: 5px;"></i>
          <el-button
            size="large"
            type="text"
            @click="downloadReport(currentModel.id)"
          >
            下载测试报告
          </el-button>
        </div>
        <div v-else style="font-size: 20px; margin-bottom: 10px;">
          <span style="color: #ff0000;">未上传测试报告</span>
        </div>
        <!-- <el-upload
          ref="upload"
          :auto-upload="false"
          :on-exceed="handleExceed"
          :limit="1"
          :on-change="handleChange"
          v-model:fileList="fileList"
          accept=".pdf"
        >
          
          <el-button slot="trigger" type="primary">选择文件</el-button>
          <el-button type="success" @click="submitUpload">保存</el-button>
        </el-upload> -->
      </el-dialog>

    <!-- 以抽屉的形式打开开发者用户已发布的模型 -->
    <el-drawer v-model="modelsDrawer" direction="ltr" size="35%">
      <div style="display: flex; flex-direction: column">
        <el-col>
          <h2 style="margin-bottom: 25px; color: #253b45">系统模型库</h2>
          <span style="font-size: 15px; color: #a1a2b1"
            >*当前用户权限为{{
              userRole === "user"
                ? "普通用户，可以使用系统中的模型"
                : "系统用户，可以添加模型和删除本用户添加的模型"
            }}</span
          >
          <el-table :data="fetchedModelsInfo" height="500" stripe style="width: 100%">
            <el-table-column :width="100" property="author" label="模型作者" />
            <el-table-column
              property="model_name"
              label="模型名称"
              show-overflow-tooltip
            />
            <el-table-column
              property="description"
              label="模型描述"
              show-overflow-tooltip
            />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button
                  size="small"
                  type="primary"
                  style="width: 50px"
                  @click="loadModel(scope.row)"
                >
                  使用
                </el-button>
                <el-popover placement="bottom" :width="500" trigger="click">
                  <el-descriptions :title="modelName" :column="3" direction="vertical">
                    <el-descriptions-item label="使用模块" :span="3">
                      <el-tag size="small" v-for="algorithm in modelAlgorithms">{{
                        algorithm
                      }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="算法参数" :span="3">
                      <div v-for="item in modelParams">
                        {{ item.模块名 }}: {{ item.算法 }}
                      </div>
                    </el-descriptions-item>
                  </el-descriptions>
                  <template #reference>
                    <el-button
                      size="small"
                      type="info"
                      style="width: 80px"
                      @click="showModelInfo(scope.row)"
                    >
                      查看模型
                    </el-button>
                  </template>
                </el-popover>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, ref } from "vue";
import api from "../utils/api.js";
import { useRouter } from "vue-router";
import { labelsForAlgorithms } from "./constant.js";
import { genFileId } from "element-plus";
import type {
  UploadInstance,
  UploadProps,
  UploadRawFile,
  UploadUserFile,
} from "element-plus";
import { pa } from "element-plus/es/locale/index.mjs";

const publishModelPanelVisible = ref(false);
// 从后端获取到的历史模型的信息
const fetchedModelsInfo = ref<modelInfo[]>([]);
const openPublishModelPanel = () => {
  publishModelPanelVisible.value = true;
  fetchModelInfoFromDatabase();
};

// 从父组件userPLatform.vue传来的用户权限信息
const props = defineProps({
  userRole: String,
});

// 删除模型确认
const deleteModelConfirmVisible = ref(false);
const router = useRouter();
// let index = 0
// let row = 0
// 删除模型操作
// const deleteModel = (indexIn, rowIn) => {
//   index = indexIn
//   row = rowIn
//   deleteModelConfirmVisible.value = true
// }
const emit = defineEmits(["resetModel", "loadModel"]);
interface modelInfo {
  id: number;
  model_name: string;
  description: string;
  author: string;
  model_info: any;
  isPublish: string;
  report_path: string;
}

// 查看模型的具体信息，按如下方式构造信息卡片
const modelName = ref("");
const modelAlgorithms = ref([]);
const modelParams = ref([]); // {'模块名': xx, '算法': xx, '参数': xx}

const showModelInfo = (row) => {
  let objects = JSON.parse(row.model_info);
  console.log("showModelInfo objects: ", objects);
  let node_list = objects.nodeList.nodes; // 模型节点信息
  console.log("------", node_list);
  let connection = objects.modelConfig.modules; // 模型连接顺序

  modelName.value = row.model_name;
  modelAlgorithms.value = connection;
  modelParams.value.length = 0;
  node_list.forEach((node) => {
    let item = { 模块名: "", 算法: "" };
    item.模块名 = node.nodeInfo.label;
    item.算法 = labelsForAlgorithms[node.nodeInfo.use_algorithm];
    modelParams.value.push(item);
  });
};
// 用户删除模型操作确认
const deleteModelConfirm = (index: number, row: modelInfo) => {
  // 发送删除请求到后端，row 是要删除的数据行
  api
    .get("/user/delete_model/?row_id=" + row.id)
    .then((response: any) => {
      if (response.data.code == 401) {
        ElMessageBox.alert("登录状态失效，请重新登陆", "提示", {
          confirmButtonText: "确定",
          callback: () => {
            router.push("/");
          },
        });
      }
      if (response.data.code == 200) {
        // 如果被删除的模型已经被加载，则需要取消加载
        emit("resetModel", row.model_name);

        if (index !== -1) {
          // 删除前端表中数据
          fetchedModelsInfo.value.splice(index, 1);
          deleteModelConfirmVisible.value = false;
          ElMessage({
            message: "删除模型成功",
            type: "success",
          });
        }
      } else {
        if (response.data.code == 404) {
          ElMessage({
            message: "没有权限删除该模型",
            type: "error",
          });
        } else {
          ElMessage({
            message: "删除模型失败，请稍后重试",
            type: "error",
          });
        }
      }
    })
    .catch((error: any) => {
      // 处理错误
      console.error(error);
      ElMessage({
        message: "删除模型失败," + error,
        type: "error",
      });
    });
};

const modelLoaded = ref("无");

// 点击子组件的加载模型，加载模型并到父组件userPlatForm.vue显示出来
const loadModel = (row: modelInfo) => {
  modelLoaded.value = row.model_name;
  emit("loadModel", row);
};

onMounted(() => {
  fetchModelInfoFromDatabase();
});

// 从数据库获取模型信息
const fetchModelInfoFromDatabase = () => {
  //   dataDrawer.value = false; // 打开历史模型抽屉

  // 向后端发送请求获取用户的历史模型
  api
    .get("user/fetch_models/", {
      params: {
        modelName: modelNameSearch.value,
      },
    })
    .then((response: any) => {
      if (response.data.code === 200) {
        // modelsDrawer.value = true;
        let modelsInfo = response.data.models;
        fetchedModelsInfo.value = [];
        for (let item of modelsInfo) {
          fetchedModelsInfo.value.push(item);
        }
      }
      if (response.data.code == 401) {
        ElMessageBox.alert("登录状态已失效，请重新登陆", "提示", {
          confirmButtonText: "确定",
          callback: () => {
            router.push("/");
          },
        });
      }
    })
    .catch((error: any) => {
      ElMessage({
        message: "获取历史模型失败," + error,
        type: "error",
      });
    });
};

// 打开抽屉，同时从后端获取历史模型
const modelsDrawer = ref(false);

// 申请发布模型
const publishModelConfirm = (index: number, row: modelInfo) => {
  let modelId = row.id;
  let formData = new FormData();
  formData.append("modelId", String(modelId));
  api
    .post("user/publish_model/", formData)
    .then((response: any) => {
      if (response.data.code === 200) {
        ElMessage({
          message: response.data.message,
          type: "success",
        });
        // 刷新发布模型数据列表
        fetchModelInfoFromDatabase();
      } else {
        ElMessage({
          message: "发布失败，" + response.data.message,
        });
      }
    })
    .catch(() => {
      ElMessage({
        message: "模型发布失败，请重试",
        type: "error",
      });
    });
};

const reportDialogVisible = ref(false);
// const fileList = ref<File[]>([]);
const currentModel = ref<modelInfo | null>(null);
const currentModelId = ref<number | null>(null);

const openReportDialog = (row: modelInfo) => {
  reportDialogVisible.value = true;
  currentModelId.value = row.id;
  currentModel.value = row;
};

const beforeUpload = (file: File) => {
  // console.log("beforeUpload"+ file)
  const allowedTypes = [".pdf"];
  const fileType = file.name.split(".").pop().toLowerCase();
  if (!allowedTypes.includes("." + fileType)) {
    ElMessage.error("只能上传PDF文件!");
    return false;
  }

  return true;
  // const isPDF = file.type === 'application/pdf';
  // if (!isPDF) {
  //   ElMessage.error('只能上传PDF文件!');
  // }
  // return isPDF;
};

const upload = ref<UploadInstance>();

const fileList = ref<UploadUserFile[]>([
  // {
  //   name: 'food.jpeg',
  //   url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100',
  // },
  // {
  //   name: 'food2.jpeg',
  //   url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100',
  // },
]);
// 限制文件数量，覆盖前一个文件
const handleExceed: UploadProps["onExceed"] = (files) => {
  // console.log("handleExceed"+ files)
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};

const handleChange = (file: File) => {
  // fileList.value=[]
  // 判断上传文件类型是否是PDF
  const allowedTypes = ["pdf"];
  if (!allowedTypes.includes(file.name.split(".").pop()?.toLowerCase() || "")) {
    ElMessage.error("只能上传PDF文件!");
    // 清空文件列表
    fileList.value = [];
    // if (fileList.value.length > 0) {
    //   fileList.value.pop();
    // }
    return;
  }
  fileList.value = [file];
  console.log("handleChange" + fileList.value[0].name);
};

const submitUpload = () => {
  if (!currentModelId.value || fileList.value.length === 0) {
    ElMessage.error("请选择一个PDF文件");
    return;
  }

  const formData = new FormData();

  formData.append("modelId", currentModelId.value.toString());
  formData.append("reportFile", fileList.value[0].raw);

  api
    .post("user/upload_model_report/", formData)
    .then((response: any) => {
      if (response.data.code === 200) {
        ElMessage({
          message: response.data.message,
          type: "success",
        });
        reportDialogVisible.value = false; // 关闭对话框
        fileList.value = []; // 清空文件列表
        upload.value!.clearFiles(); // 手动重置 el-upload 组件的状态
        fetchModelInfoFromDatabase(); // 刷新发布模型数据列表
      } else {
        ElMessage({
          message: "上传失败，" + response.data.message,
          type: "error",
        });
      }
    })
    .catch(() => {
      ElMessage({
        message: "上传失败，请重试",
        type: "error",
      });
    });
};


// 下载报告
const downloadReport = (modelId: number) => {
  api
    .get(`fetch_model_report/?modelId=${modelId}`, {
      responseType: "blob", // 设置响应类型为 blob
    })
    .then((response: any) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${modelId}.pdf`);
      document.body.appendChild(link);
      link.click();
    })
    .catch((error: any) => {
      ElMessage({
        message: "下载报告失败，请重试",
        type: "error",
      });
      console.error(error);
    });
};

const exportModel = (modelId: number) => {
  api.get('export_model/', {
    params: {
      modelId: modelId,
    },
    responseType: 'blob', // 设置响应类型为blob，以便处理文件下载
  })
  .then((response: any) => {
    if (response.status === 200) {
      // 创建一个URL对象
      const url = window.URL.createObjectURL(new Blob([response.data]));
      // 创建一个<a>元素
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `model_${modelId}_modules.zip`); // 设置下载的文件名
      document.body.appendChild(link);
      link.click();
      // 清除URL对象
      window.URL.revokeObjectURL(url);
      ElMessage({
        message: '导出成功',
        type: 'success'
      });
    } else {
      ElMessage({
        message: '导出失败，' + response.data.message,
        type: 'error'
      });
    }
  })
  .catch((error: any) => {
    ElMessage({
      message: '导出失败',
      type: 'error'
    });
    console.error('导出模型时出错:', error);
  });
};


const modelNameSearch = ref("");
const handleSearch = () => {
  fetchModelInfoFromDatabase();
};

// 已加载模型和已加载数据字体颜色更改
// const getColor = (value: string) => {
//   if (value == "无") {
//     return "red";
//   } else {
//     return "green";
//   }
// };
</script>

<style scoped>
.private-algorithm-button {
  background-color: #ffffff;
  color: #333333;
  font-size: 16px;
  width: 100%;
  height: 100%;
  margin: 0;
  border-radius: 0;
}

.private-algorithm-button {
  background-color: #ffffff;
  color: #333333;
  font-size: 16px;
  width: 100%;
  height: 100%;
  margin: 0;
  border-radius: 0;
}

.button-container {
  display: flex;
  gap: 5px; /* 按钮之间的间距 */
}

.button-container .el-button {
  width: 90px; /* 调整按钮宽度 */
}
</style>
