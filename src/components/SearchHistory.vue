<script>
import Search from "@/view/search.vue";

export default {
  name: "SearchHistory",
  computed: {
    Search() {
      return Search
    }
  },
  data() {
    return {
      history: []
    }
  },
  created() {
    this.getHistory()
  },
  mounted() {
    document.addEventListener("storage", this.getHistory);
  },
  methods: {
    getHistory() {
      const sh = this.$storage.get("search_history");
      if (sh !== null && sh !== undefined) {
        this.history = this.$storage.get("search_history");
      }
    },
    handleSearch(item) {
      this.$emit("search", item)
    },
    deleteHistory() {
      this.$confirm("确定要清空搜索历史吗？", "提示", {
        cancleButtonText: "取消",
        confirmButtonText: "确定",
      }).then(() => {
        this.$storage.remove("search_history")
        this.history = []
      }).catch((reason) => {
        console.log(reason)
      })
    }
  },
}
</script>

<template>
  <div class="box">
    <div class="title">
      搜索历史
      <el-button @click="deleteHistory" type="text" size="mini">清空</el-button>
    </div>
    <p v-if="!history.length" class="none">暂无搜索历史</p>
    <ul class="list">
      <li @click="handleSearch(item)" class="item" v-for="(item,index) in history" :key="index">{{ item }}</li>
    </ul>
  </div>
</template>

<style scoped>
.box {
  padding: 10px;
  height: auto;
  min-height: 200px;
}

.box .none {
  font-size: 14px;
  line-height: 20px;
  color: #8c95a3;
}

.title {
  font-weight: 700;
  color: #292b2f;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  line-height: 20px;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e9eaec;
}

.title .el-button {
  color: #8c95a3;
}

.list .item {
  display: inline-block;
  padding: 5px 12px;
  margin-bottom: 12px;
  margin-right: 8px;
  color: #8c95a3;
  font-weight: 400;
  border-radius: 4px;
  background: #f7f8fa;
  cursor: pointer;
  font-size: 14px;
  line-height: 20px;
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>