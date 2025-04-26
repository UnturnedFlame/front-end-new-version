import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import Vue3DraggableResizable from '@v3e/vue3-draggable-resizable'
import '@v3e/vue3-draggable-resizable/dist/Vue3DraggableResizable.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import router from "./router/index.js";
import AntiDesignVue from 'ant-design-vue';
import {createPinia} from "pinia";
import '@fortawesome/fontawesome-free/css/all.css';

import Antd from 'ant-design-vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';  // 引入中文语言包
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';  // 引入 dayjs 的中文语言包

VMdPreview.use(vuepressTheme);

const pinia =createPinia()
const app = createApp(App)
// 注册所有图标为全局组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

app.use(Antd, {
  locale: zhCN,  // 配置 Ant Design Vue 的语言为中文
});

dayjs.locale('zh-cn');  // 配置 dayjs 的语言为中文


app.use(ElementPlus)
app.use(pinia)
app.use(Vue3DraggableResizable)
app.use(VMdPreview);
app.use(router);
app.use(AntiDesignVue);
app.mount('#app')
