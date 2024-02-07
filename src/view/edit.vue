<script>
export default {
  name: "edit",
  data() {
    return {}
  },
  methods: {
    edit() {
      this.$axios.get('/user/logout').then((res) => {
        console.log(res)
      })
    }
  }
}
</script>

<template>
  <div>
    <el-button @click="edit">跳转登录</el-button>
  </div>
</template>

<style scoped>

</style>