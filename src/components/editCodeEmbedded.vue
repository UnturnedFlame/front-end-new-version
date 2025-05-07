<template>
  <div class="panel-container">
    <div class="controls">
      <a-space>
        <a-select
          v-model:value="selectedModule"
          @change="loadModuleCode"
          style="width: 200px"
          @dropdownVisibleChange="fetchUserAlgorithms"
        >
          <a-select-opt-group>
            <template #label>
              <span style="font-weight: bold; font-size: 16px">
                <!-- <user-outlined /> -->
                系统固有组件
              </span>
            </template>
            <a-select-option
              v-for="module in moduleCanEditCodeForTraining"
              :key="module.value"
              :value="module.value"
            >
              {{ module.label }}
            </a-select-option>
          </a-select-opt-group>
          <!-- <a-select-opt-group>
            <template #label>
              <span style="font-weight: bold; font-size: 16px">
                上传组件
              </span>
            </template>
            <a-select-option
              v-if="userAlgorithms.length > 0"
              v-for="module in userAlgorithms"
              :key="module.value"
              :value="module.value"
            >
              {{ module.label }}
            </a-select-option>
          </a-select-opt-group> -->
          <a-select-opt-group>
            <template #label>
              <span style="font-weight: bold; font-size: 16px">上传组件</span>
            </template>
            <a-select-option
              v-for="module in userAlgorithms"
              :key="module.value"
              :value="module.value"
            >
              {{ module.label }}
            </a-select-option>
            <!-- 空状态提示 -->
            <!-- <a-select-option v-if="userAlgorithms.length === 0" disabled>
              暂无上传组件
            </a-select-option> -->
          </a-select-opt-group>
          <!-- <a-spin v-else tip="加载用户组件中..." /> -->
        </a-select>

        <span style="margin-left: 50px">编辑代码</span>
        <a-switch v-model:checked="isEditable" style="margin-right: 20px" />
        <a-button @click="exportCode">导出代码到本地</a-button>
      </a-space>
    </div>
    <div class="editor">
      <Codemirror
        v-model:value="code"
        :options="cmOptions"
        border
        height="600px"
        width="100%"
        @change="onChange"
        @input="onInput"
        @ready="onReady"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, readonly, reactive, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Codemirror from "codemirror-editor-vue3";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/idea.css";
import "codemirror/mode/python/python.js";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/show-hint.js";
import "codemirror/addon/hint/anyword-hint.js";
import api from "../utils/api.js";

export default {
  components: { Codemirror },
  setup() {
    const code = ref("");
    const selectedModule = ref("");
    const cmOptions = reactive({
      mode: "python",
      theme: "idea",
      lineNumbers: true,
      lineWrapping: true,
      tabSize: 4,
      hintOptions: {
        completeSingle: false,
      },
      readOnly: true,
      extraKeys: {
        "Ctrl-Space": "autocomplete", // 使用 Ctrl+Space 触发自动补全
      },
    });

    const moduleCanEditCodeForTraining = [
      { label: "随机森林-故障诊断", value: "faultDiagnosis-RandomForest" },
      { label: "支持向量机-故障诊断", value: "faultDiagnosis-SVM" },
      { label: "LSTM-故障诊断", value: "faultDiagnosis-LSTM" },
      { label: "GRU-故障诊断", value: "faultDiagnosis-GRU" },
      { label: "ulcnn-故障诊断", value: "faultDiagnosis-ULCNN" },
      { label: "simmodel-故障诊断", value: "faultDiagnosis-SIMmodel" },
      { label: "fdmssw-故障诊断", value: "faultDiagnosis-fdmssw" },
    ];

    const pythonFilePaths = {
      "faultDiagnosis-RandomForest": "src/assets/exampleCode/randomForestTrain.py",
      "faultDiagnosis-SVM": "src/assets/exampleCode/svcTrain.py",
      "faultDiagnosis-LSTM": "src/assets/exampleCode/train_lstm.py",
      "faultDiagnosis-GRU": "src/assets/exampleCode/train_gru.py",
      "faultDiagnosis-ULCNN": "src/assets/exampleCode/train_ulcnn.py",
      "faultDiagnosis-SIMmodel": "src/assets/exampleCode/train_simmodel.py",
      "faultDiagnosis-fdmssw": "src/assets/exampleCode/train_fdmssw.py",
    };

    // const userAlgorithms = ref([]);
    // const fetchUserAlgorithms = async () => {
    //   try {
    //     api.get("/user/get_private_algorithm_files").then((response) => {
    //       if (response.data.code === 401) {
    //         ElMessageBox.alert("登录状态已失效，请重新登陆", "提示", {
    //           confirmButtonText: "确定",
    //           callback: (action) => {
    //             router.push("/");
    //           },
    //         });
    //       } else {
    //         let res = response.data.result;
    //         // console.log('res: ', res)
    //         userAlgorithms.value = res.map((algorithm) => ({
    //           label: algorithm.alias,
    //           value: algorithm.alias,
    //           source_code: algorithm.source_code,
    //         }));
    //       }
    //     });
    //   } catch (error) {
    //     console.error("无法获取用户算法列表:", error);
    //   }
    // };
   


    // let userAlgorithms = [];
    const userAlgorithms = reactive([]);
    const loadingUserAlgorithms = ref(false);

    const fetchUserAlgorithms = async () => {
      loadingUserAlgorithms.value = true;
      try {
        const response = await api.get("/user/get_private_algorithm_files");
        if (response.data.code === 401) {
          handleUnauthorized();
        } else {
          // userAlgorithms = response.data.result.map((algorithm) => ({
          //   label: algorithm.alias,
          //   value: algorithm.alias,
          //   source_code: algorithm.source_code,
          // }));
          userAlgorithms.splice(0, userAlgorithms.length, ...response.data.result.map((algorithm) => ({
            label: algorithm.alias,
            value: algorithm.alias,
            source_code: algorithm.source_code,
          })));
          // userAlgorithms = response.data.result

          console.log("fetchUserAlgorithms userAlgorithms: ", userAlgorithms);
        }
      } catch (error) {
        console.error("请求失败:", error);
        ElMessage.error("加载用户组件失败");
      } finally {
        loadingUserAlgorithms.value = false;
      }
    };

    const fetchedUserAlgorithms = computed(() => {
      // return userAlgorithms;
      return userAlgorithms.map((algorithm) => ({
        label: algorithm.label,
        value: algorithm.value,
        source_code: algorithm.source_code,
      }));
    });

    // 统一处理未授权
    const handleUnauthorized = () => {
      ElMessageBox.alert("登录状态已失效，请重新登录", "提示", {
        confirmButtonText: "确定",
        callback: () => router.push("/"),
      });
    };

    // const loadModuleCode = () => {
    //   let selected = allModules.value.find(
    //     (module) => module.value === selectedModule.value
    //   );
    //   if (pythonFilePaths[selectedModule.value]) {
    //     fetch(pythonFilePaths[selectedModule.value])
    //       .then((response) => response.text())
    //       .then((data) => {
    //         code.value = data;
    //       })
    //       .catch((error) => {
    //         console.error("无法打开文件:", error);
    //       });
    //   } else if (selected) {
    //     code.value = selected.source_code || "";
    //     console.log("Selected module found in allModules:", selected);
    //   } else {
    //     console.log("Selected module not found in allModules:", selectedModule.value);
    //   }
    // };
    const loadModuleCode = () => {
      let selected =
        moduleCanEditCodeForTraining.find(
          (module) => module.value === selectedModule.value
        ) || userAlgorithms.value.find((module) => module.value === selectedModule.value);
      if (pythonFilePaths[selectedModule.value]) {
        fetch(pythonFilePaths[selectedModule.value])
          .then((response) => response.text())
          .then((data) => {
            code.value = data;
          })
          .catch((error) => {
            console.error("无法打开文件:", error);
          });
      } else if (selected) {
        code.value = selected.source_code || "";
        console.log("Selected module found:", selected);
      } else {
        console.log("Selected module not found:", selectedModule.value);
      }
    };

    const exportCode = async () => {
      const content = code.value;
      if (!content) {
        ElMessage.error("没有代码可以导出");
        return;
      }

      if (window.showSaveFilePicker) {
        try {
          const options = {
            suggestedName: `${selectedModule.value || "modified_code"}.py`,
            types: [
              {
                description: "Python Files",
                accept: {
                  "text/plain": [".py"],
                },
              },
            ],
          };
          const fileHandle = await window.showSaveFilePicker(options);
          const writable = await fileHandle.createWritable();
          await writable.write(content);
          await writable.close();
          ElMessage.success("代码已成功导出");
        } catch (error) {
          console.error("导出代码失败:", error);
          ElMessage.error("导出代码失败，请重试");
        }
      } else {
        // Fallback for browsers that do not support showSaveFilePicker
        const blob = new Blob([content], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedModule.value || "modified_code"}.py`;
        a.click();
        window.URL.revokeObjectURL(url);
        ElMessage.success("代码已成功导出");
      }
    };

    const onChange = (val) => {};

    const onInput = (val) => {};

    const onReady = (cm) => {
      cm.on("inputRead", () => {
        cm.showHint();
      });
    };
    const toggleEdit = () => {
      isEditable.value = !isEditable.value;
      cmOptions.readOnly = isEditable.value;
      if (isEditable.value) {
        ElMessage.success("代码编辑已启用");
      } else {
        ElMessage.info("代码编辑已禁用");
      }
    };

    const isEditable = ref(false);

    watch(
      isEditable,
      (newValue) => {
        console.log("isEditable changed:", newValue);
        if (newValue) {
          ElMessage.success("代码编辑已启用");
        } else {
          ElMessage.info("代码编辑已禁用");
        }
        cmOptions.readOnly = !newValue;
      },
      { immediate: true }
    );

    onMounted(() => {
      console.log("onMounted");
      fetchUserAlgorithms();
    });

    return {
      code,
      selectedModule,
      cmOptions,
      moduleCanEditCodeForTraining,
      userAlgorithms,
      loadModuleCode,
      fetchUserAlgorithms,
      exportCode,
      onChange,
      onInput,
      onReady,
      isEditable,
      // toggleEdit
    };
  },
};
</script>

<style scoped>
.panel-container {
  width: 100%;
  max-height: 75vh;
}

.controls {
  margin-bottom: 20px;
}

.editor {
  width: 100%;
  height: 600px;
}
</style>
