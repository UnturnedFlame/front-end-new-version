<template>
  <div class="panel-container">
    <div class="controls">
      <a-space>
        <a-select
          v-model:value="selectedModule"
          @change="loadModuleCode"
          style="width: 200px"
        >
          <a-select-option v-for="module in allModules" :value="module.value">{{
            module.label
          }}</a-select-option>
        </a-select>
        <a-button @click="exportCode">导出代码</a-button>
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
import { ref, onMounted, computed } from "vue";
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
    const cmOptions = {
      mode: "python",
      theme: "idea",
      lineNumbers: true,
      lineWrapping: true,
      tabSize: 4,
      hintOptions: {
        completeSingle: false,
      },
      extraKeys: {
        "Ctrl-Space": "autocomplete", // 使用 Ctrl+Space 触发自动补全
      },
    };

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

    const userAlgorithms = ref([]);

    const allModules = computed(() => {
      return [...moduleCanEditCodeForTraining, ...userAlgorithms.value];
    });

    const fetchUserAlgorithms = async () => {
      try {
        // const response = await fetch('/user/get_private_algorithm_files');
        // const data = await response.json();
        api.get("/user/get_private_algorithm_files").then((response) => {
          if (response.data.code === 401) {
            ElMessageBox.alert("登录状态已失效，请重新登陆", "提示", {
              confirmButtonText: "确定",
              callback: (action) => {
                router.push("/");
              },
            });
          } else {
            let res = response.data.result;
            console.log('res: ', res)
            userAlgorithms.value = res.map((algorithm) => ({
              label: algorithm.alias,
              value: algorithm.alias,
              source_code: algorithm.source_code,
            }));
          }
        });
      } catch (error) {
        console.error("无法获取用户算法列表:", error);
      }
    };

    const loadModuleCode = () => {
      let selected = allModules.value.find(
        (module) => module.value === selectedModule.value
      );
      // 如果在pythonFilePaths中找到对应的文件路径，则从文件中读取代码
      if (pythonFilePaths[selectedModule.value]) {
        fetch(pythonFilePaths[selectedModule.value])
          .then((response) => response.text())
          .then((data) => {
            code.value = data;
          })
          .catch((error) => {
            console.error("无法打开文件:", error);
          });
      }
      else if (selected) {
        code.value = selected.source_code || "";
        console.log("Selected module found in allModules:", selected); // 添加日志
      } else {
        console.log("Selected module not found in allModules:", selectedModule.value);
        // console.log('hahahahahaha')
        // const filePath = pythonFilePaths[selectedModule.value];
        // if (filePath) {
        //   fetch(filePath)
        //     .then((response) => response.text())
        //     .then((data) => {
        //       code.value = data;
        //     })
        //     .catch((error) => {
        //       console.error("无法打开文件:", error);
        //     });
        // }
      }
    };

    const exportCode = () => {
      const content = code.value;
      const blob = new Blob([content], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedModule.value || "modified_code"}.py`;
      a.click();
      window.URL.revokeObjectURL(url);
    };

    const onChange = (val) => {
      // console.log('Code changed:', val);
    };

    const onInput = (val) => {
      // console.log('Input:', val);
    };

    const onReady = (cm) => {
      cm.on("inputRead", () => {
        cm.showHint();
      });
      // cm.showHint(); // 显示代码提示
      // console.log('Editor ready:', cm);
    };

    onMounted(() => {
      fetchUserAlgorithms();
    });

    return {
      code,
      selectedModule,
      cmOptions,
      allModules,
      loadModuleCode,
      exportCode,
      onChange,
      onInput,
      onReady,
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
