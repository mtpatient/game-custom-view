<template>
  <div>
    <Head_navigate :key="barKey"></Head_navigate>
    <router-view :refreshBar="refreshBar" class="router_view"/>
    <div class="goTop">
      <el-backtop>
        <!--          target=".page-component__scroll .el-scrollbar__wrap">-->
      </el-backtop>

    </div>
  </div>

</template>

<script>

import Head_navigate from "@/components/head-navigater.vue";

export default {
  name: 'App',
  data() {
    return {
      barKey: 0
    }
  },
  components: {Head_navigate},
  methods: {
    refreshBar() {
      this.barKey += 1
    }
  }
}
</script>

<style>
.router_view {
  top: 60px;
  position: fixed;
}

.goTop {
  height: 100vh;
  overflow-x: hidden;
}
</style>
