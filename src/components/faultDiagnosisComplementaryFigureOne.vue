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
