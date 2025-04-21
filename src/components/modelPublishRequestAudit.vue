<template>
  <div class="shadow-border title-container">模型审核</div>
  <div class="table-container">
    <el-table
      :data="tableData"
      style="width: 100%"
      height="500px"
      :stripe="true"
      :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266' }"
      border
      empty-text="暂无数据"
    >
      <!-- <el-table-column prop="id" label="ID" /> -->
      <!-- <el-table-column prop="id" label="序号" width="100px" /> -->
      <el-table-column prop="create_time" label="申请时间" />
      <el-table-column prop="applicant" label="申请人" />
      <el-table-column prop="modelName" label="申请发布模型" />
      <el-table-column prop="status" label="申请状态" />
      <el-table-column prop="auditor" label="审批人" />
      <el-table-column prop="audition_time" label="审批时间" />

      <!-- <el-table-column prop="password" label="密码" /> -->
      <el-table-column label="操作" width="460px">
        <template #default="scope">
          <div class="button-container">
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
                <el-button type="info" @click="showModelInfo(scope.row)">
                  查看模型
                </el-button>
              </template>
            </el-popover>

            <!-- 删除模型发布申请 -->
            <el-popconfirm
              title="你确定要删除该条申请吗?"
              @confirm="handleDeleteApplication(scope.$index, scope.row)"
            >
              <template #reference>
                <el-button type="danger" style="max-width: 100px">删除</el-button>
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

            <!-- 审核发布模型申请 -->
            <el-button
              type="success"
              v-if="scope.row.status === '未处理'"
              @click="publishModelConfirm(scope.$index, scope.row)"
              >通过</el-button
            >
            <el-button
              type="warning"
              v-if="scope.row.status === '未处理'"
              @click="publishModelDenny(scope.$index, scope.row)"
              >不通过</el-button
            >

            <el-button size="large" type="text" @click="downloadReport(scope.row.model_id)">
              下载测试报告
            </el-button>
            
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { onMounted } from "vue";
import { ElMessage } from "element-plus";
import api from "../utils/api.js";
// import { labelsForAlgorithms } from "./constant.ts";
import { ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { labelsForAlgorithms } from "./constant.js";

interface publishModelApplication {
  id: number;
  applicant: string;
  modelName: string;
  status: string;
  create_time: string;
  model_id: number;
  // processed: boolean;
}
const tableData = reactive<publishModelApplication[]>([]);

const router = useRouter(); // 获取路由实例

// 查看模型的具体信息，按如下方式构造信息卡片
const modelName = ref("");
const modelAlgorithms = ref([]);
const modelParams = ref([]);

// {'模块名': xx, '算法': xx, '参数': xx}
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

// 获取用户提交的模型发布申请
const fetchPublishRequests = () => {
  api
    .get("administration/fetch_publish_model_applications/")
    .then((response: any) => {
      if (response.data.code == 401) {
        ElMessageBox.alert("登录状态已失效，请重新登陆", "提示", {
          confirmButtonText: "确定",
          callback: () => {
            router.push("/");
          },
        });
      } else if (response.data.code == 200) {
        let applications = response.data.data;
        tableData.length = 0;
        for (let application of applications) {
          tableData.push({
            ...application,
            // processed: application.status === "已处理", // 根据实际情况设置初始状态
          });
        }
      } else {
        ElMessage.error("获取发布模型申请失败，" + response.data.message);
      }
    })
    .catch(() => {
      ElMessage.error("获取发布模型申请失败，请稍后重试");
    });
};

onMounted(() => {
  fetchPublishRequests();
});

// 删除某条模型发布申请
const handleDeleteApplication = (index: number, row: any) => {
  api
    .get("administration/delete_publish_model_applications/?applicationId=" + row.id)
    .then((response: any) => {
      if (response.data.code == 401) {
        ElMessageBox.alert("登录状态已失效，请重新登陆", "提示", {
          confirmButtonText: "确定",
          callback: () => {
            router.push("/");
          },
        });
      } else if (response.data.code == 200) {
        if (index !== -1) {
          // 刷新表格数据
          tableData.splice(index, 1);
        }
      } else {
        ElMessage.error("删除发布模型申请失败，" + response.data.message);
      }
    })
    .catch(() => {
      ElMessage.error("删除发布模型申请失败，请稍后重试");
    });
};

// 处理单选框变化
// const handleProcessedChange = (row: publishModelApplication) => {
//   const newStatus = row.processed ? "已处理" : "待处理";
//   let formData = new FormData();
//   formData.append("feedbackId", String(row.id));
//   formData.append("newStatus", newStatus);
//   api
//     .post("administration/update_feedback_status/", formData)
//     .then((response: any) => {
//       if (response.data.code == 401) {
//         ElMessageBox.alert("登录状态已失效，请重新登陆", "提示", {
//           confirmButtonText: "确定",
//           callback: () => {
//             router.push("/");
//           },
//         });
//       } else if (response.data.code == 200) {
//         row.status = newStatus; // 更新本地状态
//         ElMessage.success("反馈状态更新成功");
//       }
//     })
//     .catch(() => {
//       ElMessage.error("更新反馈状态失败，请稍后重试");
//       row.processed = !row.processed; // 恢复原状态
//     });
// };

const publishModelConfirm = (index: number, row: publishModelApplication) => {
  api
    .get(
      "administration/handle_publish_model_request/?applicationId=" +
        row.id +
        "&status=审核通过"
    )
    .then((response: any) => {
      if (response.data.code == 200) {
        ElMessage.success("发布模型申请审核通过");
        fetchPublishRequests();
      } else {
        if (response.data.code == 401) {
          ElMessageBox.alert("登录状态已失效，请重新登陆", "提示", {
            confirmButtonText: "确定",
            callback: () => {
              router.push("/");
            },
          });
        } else {
          ElMessage.error("发布模型申请审核失败，" + response.data.message);
        }
      }
    })
    .catch(() => {
      ElMessage.error("发布模型申请审核失败，请稍后重试");
    });
};

const publishModelDenny = (index: number, row: publishModelApplication) => {
  api
    .get(
      "administration/handle_publish_model_request/?applicationId=" +
        row.id +
        "&status=审核不通过"
    )
    .then((response: any) => {
      if (response.data.code == 200) {
        ElMessage.success("发布模型申请审核不通过");
        fetchPublishRequests();
      } else {
        if (response.data.code == 401) {
          ElMessageBox.alert("登录状态已失效，请重新登陆", "提示", {
            confirmButtonText: "确定",
            callback: () => {
              router.push("/");
            },
          });
        } else {
          ElMessage.error("发布模型申请审核失败，" + response.data.message);
        }
      }
    })
    .catch(() => {
      ElMessage.error("发布模型申请审核失败，请稍后重试");
    });
};

// 下载报告
const downloadReport = (modelId: number) => {
  api
    .get(`fetch_model_report/?modelId=${modelId}`, {
      responseType: "blob", // 设置响应类型为 blob
    })
    .then((response: any) => {
      if (response.status === 200) {
        // 下载成功
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `report_${modelId}.pdf`);
        document.body.appendChild(link);
        link.click();
      } else if (response.status === 401) {
        ElMessageBox.alert("登录状态已失效，请重新登陆", "提示", {
          confirmButtonText: "确定",
          callback: () => {
            router.push("/");
          },
        });
      } else if (response.status === 404) {
        ElMessage.error("报告文件不存在");
      } else {
        ElMessage.error("下载报告失败，请重试");
      }
    })
    .catch((error: any) => {
      ElMessage({
        message: "下载报告失败，请重试",
        type: "error",
      });
      console.error(error);
    });
};
</script>

<style>
.shadow-border {
  width: 200px;
  height: 200px;
  /* border: 1px solid #888; */
  box-shadow: 4px 4px 8px 0 rgba(136, 136, 136, 0.5); /* 水平偏移, 垂直偏移, 模糊距离, 扩展距离, 颜色 */
}

.title-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: white;
  width: 89%;
  height: 100px;
  font-weight: 8px;
  font-size: 30px;
  margin-bottom: 10px;
  margin-left: 10px;
  margin-top: 20px;
  padding-left: 20px;
  border-radius: 5px;
  font-family: "微软雅黑", sans-serif;
}

.table-container {
  width: 86%;
  height: 510px;
  padding: 20px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  margin-left: 30px;
}

.detail-container {
  width: 86%;
  padding: 20px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  margin-left: 30px;
  margin-top: 20px;
}

/* 按钮悬停效果 */
.el-button--danger.is-plain:hover {
  background-color: #fde2e2;
  color: #f56c6c;
}

.el-button--primary.is-plain:hover {
  background-color: #e0f3ff;
  color: #409eff;
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
  gap: 10px; /* 按钮之间的间距 */
}

.button-container .el-button {
  width: 80px; /* 调整按钮宽度 */
}
</style>
