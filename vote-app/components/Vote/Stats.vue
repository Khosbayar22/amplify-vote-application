<template>
  <n-card :title="title">
    <template #header-extra>
      <n-space justify="center" align="center">
        <n-h3 class="m-0 text-emerald-400">{{ totalVotes }}</n-h3>
        <span class="m-0">/</span>
        <n-h3 class="m-0">{{ totalVoteMember.length }}</n-h3>
      </n-space>
    </template>
    <n-space vertical :size="20">
      <n-space
        v-for="(value, key, index) in formatStats"
        :wrap-item="false"
        align="center"
      >
        <n-image width="32" :src="findImage(index)" />
        <n-progress
          style="width: 80%"
          :key="key"
          type="line"
          :indicator-placement="'inside'"
          :percentage="calculatePercent(value)"
          :height="20"
          processing
        >
          {{ findKey(key) }}
        </n-progress>
        <n-h6 class="text-center">
          {{ value }}
        </n-h6>
      </n-space>
    </n-space>
  </n-card>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
    },
    totalVoteMember: {
      type: Array,
      default: [],
    },
    stats: {
      type: Object,
    },
    postId: {
      type: String,
    },
  },
  data() {
    return {
      votes1: [
        {
          value: "",
          label: "",
          description: "",
        },
      ],
      votes2: [
        {
          value: "",
          label: "",
        },
      ],
    };
  },
  computed: {
    formatStats() {
      const obj = this.stats;

      const sortedValues = Object.values(obj).sort((a, b) => b - a);

      const sortedObj = {};
      Object.keys(obj).forEach((key, index) => {
        sortedObj[key] = sortedValues[index];
      });
      return sortedObj;
    },
    totalVotes() {
      let sum = 0;

      for (let key in this.stats) {
        if (this.stats.hasOwnProperty(key)) {
          sum += this.stats[key];
        }
      }
      return sum;
    },
  },
  methods: {
    findImage(index) {
      if (index === 0) {
        return "/img/gold.png";
      }
      if (index === 1) {
        return "/img/silver.png";
      }
      if (index === 2) {
        return "/img/bronze.png";
      }
      return "";
    },
    calculatePercent(value) {
      const total = this.totalVoteMember?.length || 1;
      const res = (value * 100) / total;
      return res;
    },
    findKey(key) {
      let votes = [];
      // if (this.postId === "talent") {
      //   votes = this.votes1;
      // }
      // if (this.postId === "video") {
      //   votes = this.votes2;
      // }
      const res = votes.find((vote) => {
        return vote.value === key;
      });
      return res?.label;
    },
  },
};
</script>
