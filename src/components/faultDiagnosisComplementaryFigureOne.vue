<template>
  <div ref="chartContainer" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as echarts from "echarts";

// 定义 props
const props = defineProps({
  data: {
    type: Object,
    required: true,
    validator: value => 'fault' in value && 'no_fault' in value
  },
  theme: {
    type: String,
    default: 'light'
  }
});

// const props = {
//   theme: {
//     type: String,
//     default: "light",
//   },
//   data: {
//     fault: {
//       均值: 4,
//       方差: 0,
//       标准差: -8,
//       峰度: 2,
//       偏度: 2,
//       四阶累积量: 4,
//       六阶累积量: 4,
//       最大值: 0,
//       最小值: 0,
//       中位数: 0,
//       峰峰值: 0,
//       整流平均值: 0,
//       均方根: 0,
//       方根幅值: 0,
//       波形因子: 0,
//       峰值因子: 0,
//       脉冲因子: 0,
//       裕度因子: 0,
//       重心频率: 0,
//       均方频率: 0,
//       均方根频率: 0,
//       频率方差: 0,
//       频率标准差: 0,
//       谱峭度的均值: 0,
//       谱峭度的峰度: 0,
//     },
//     no_fault: {
//       均值: 0,
//       方差: -6,
//       标准差: 0,
//       峰度: 0,
//       偏度: 0,
//       四阶累积量: 0,
//       六阶累积量: 0,
//       最大值: -16,
//       最小值: 2,
//       中位数: -8,
//       峰峰值: -4,
//       整流平均值: -8,
//       均方根: 10,
//       方根幅值: 14,
//       波形因子: 240,
//       峰值因子: 40,
//       脉冲因子: -14,
//       裕度因子: -20,
//       重心频率: 28,
//       均方频率: -6,
//       均方根频率: 34,
//       频率方差: 44,
//       频率标准差: 53,
//       谱峭度的均值: 2,
//       谱峭度的峰度: 2,
//     },
//   },
// };
const chartContainer = ref(null);
let chartInstance = null;

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return;

  // 销毁旧实例
  if (chartInstance) {
    chartInstance.dispose();
  }

  // 创建新实例
  chartInstance = echarts.init(chartContainer.value, props.theme);
  renderChart();
};

// 渲染图表
const renderChart = () => {
  const features = Object.keys(props.data.fault);

  const option = {
    title: {
      text: "有故障样本与无故障样本特征均值对比",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: ["有故障", "无故障"],
      top: 30,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: features,
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "有故障",
        type: "bar",
        data: features.map((feature) => props.data.fault[feature]),
        itemStyle: { color: "#c23531" },
      },
      {
        name: "无故障",
        type: "bar",
        data: features.map((feature) => props.data.no_fault[feature]),
        itemStyle: { color: "#2f4554" },
      },
    ],
    dataZoom: [
      {
        type: "slider",
        show: true,
        xAxisIndex: [0],
        start: 0,
        end: 40,
      },
    ],
  };

  chartInstance.setOption(option);
};

// 响应窗口大小变化
const handleResize = () => {
  chartInstance?.resize();
};

// 生命周期钩子
onMounted(() => {
  initChart();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  chartInstance?.dispose();
});

// 监听数据变化
watch(
  () => props.data,
  () => {
    renderChart();
  },
  { deep: true }
);

// 监听主题变化
watch(
  () => props.theme,
  () => {
    initChart();
  }
);
</script>

<style scoped>
.chart-container {
  width: 1200px;
  height: 600px;
}
</style>
