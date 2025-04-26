<template>
  <div ref="chartContainer" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  data: {
    type: Array,
    required: true,
    validator: (data) => data.every((item) => item.length === 4),
  },
});

const chartContainer = ref(null);
let chartInstance = null;
const stateNames = ["正常", "轻微退化", "严重退化", "失效"];
const colors = ["#4CAF50", "#FFC107", "#FF9800", "#F44336"]; // 绿 -> 黄 -> 橙 -> 红

const initChart = () => {
  if (!chartContainer.value) return;

  chartInstance = echarts.init(chartContainer.value);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params) => {
        const total = params.reduce((sum, item) => sum + item.value, 0);
        return (
          params
            .map(
              (item) => `
        ${item.marker} ${item.seriesName}: ${item.value.toFixed(2)} (${(
                (item.value / total) *
                100
              ).toFixed(1)}%)
        `
            )
            .join("<br>") + `<br>总和: ${total.toFixed(2)}`
        );
      },
    },
    title: {
      text: "样本退化状态分析", // 您的图表名称
      left: "center", // 水平居中
      textStyle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
      },
    },
    legend: {
      data: stateNames,
      top: 40,
    },
    grid: {
      left: "10%",
      right: "10%",
      bottom: "18%", // 为缩放控件留空间
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: props.data.map((_, i) => `样本 ${i + 1}`),
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
    },
    yAxis: {
      type: "value",
      name: "状态隶属概率", // 新增Y轴名称
      nameLocation: "middle",
      nameGap: 30, // 名称与轴线的距离
      nameTextStyle: {
        fontWeight: "",
        fontSize: 14,
        padding: [0, 0, 20, 0], // 调整位置
      },
      axisLabel: {
        formatter: (value) => value * 100 + "%",
      },
      max: 1,
    },
    series: stateNames.map((name, idx) => ({
      name,
      type: "bar",
      stack: "total", // 堆叠关键配置
      emphasis: { focus: "series" },
      itemStyle: { color: colors[idx] },
      data: props.data.map((item) => item[idx]),
      label: {
        show: true,
        position: "inside",
        formatter: (params) =>
          params.value > 0.1 ? (params.value * 100).toFixed(0) + "%" : "",
      },
    })),
    dataZoom: [
      {
        type: "slider",
        show: true,
        xAxisIndex: [0],
        start: 0,
        end: 100,
        height: 20,
        bottom: 60,
        handleIcon:
          "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
        handleSize: "80%",
      },
    ],
  };

  chartInstance.setOption(option);
};

onMounted(() => {
  initChart();
  window.addEventListener("resize", () => chartInstance?.resize());
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", () => chartInstance?.resize());
  chartInstance?.dispose();
});
</script>

<style scoped>
.chart-container {
  width: 700px;
  height: 600px;
}
</style>
