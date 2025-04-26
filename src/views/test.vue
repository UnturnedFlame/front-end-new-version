<template>
  <healthEvaluationSummary :data="sampleData" />
</template>

<script setup>
import { ref } from 'vue';
import healthEvaluationSummary from '../components/healthEvaluationSummary.vue';


const sampleData = ref([
  [0.55, 0.03, 0.05, 0.08],
  [0.53, 0.03, 0.06, 0.07],
  [0.01, 0.4, 0.23, 0.0],
  [0.02, 0.0, 0.03, 0.58],
  [0.52, 0.01, 0.03, 0.07],
  [0.04, 0.0, 0.05, 0.54],
  [0.52, 0.0, 0.04, 0.07],
  [0.04, 0.0, 0.05, 0.54],
  [0.04, 0.0, 0.05, 0.54],
  [0.04, 0.0, 0.05, 0.54],
  [0.04, 0.0, 0.05, 0.54],
  [0.04, 0.0, 0.05, 0.54],
  [0.04, 0.0, 0.05, 0.54],
]);

// 生成模拟大数据
const bigData = Array.from({ length: 20 }, () => [
  Math.random().toFixed(2),
  Math.random().toFixed(2),
  Math.random().toFixed(2),
  Math.random().toFixed(2)
].map(Number));
</script>