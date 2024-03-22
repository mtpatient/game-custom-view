<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "notices",
  components: {},
  data() {
    return {
      notices: []
    }
  },
  created() {
    this.$EventBus.$emit('read')
    this.$axios.get("/message/read/0").then(res => {
      if (res.data.code === 0) {
        // this.$EventBus.$emit('read')
      }
    }).catch(err => {
      console.log(err)
    })
  }
}
</script>

<template>
  <div>
    <div class="content-item-title">
      <h2 class="title">通知</h2>
    </div>
    <div class="content">
      <ul class="list">
        <li v-for="notice in notices" :key="notice.id" class="item">

        </li>
      </ul>
      <p class="end" v-if="notices.length && loading">- 加载中 -</p>
      <p class="end" v-if="notices.length && end">- 暂无更多内容 -</p>
      <div v-if="!notices.length" class="no-content">
        <el-image style="margin-bottom: 24px;height: 168px;width: 195px"
                  :src="require('@/assets/no-content.png')"></el-image>
        <span style="font-weight: 400;
              color: #aeb6c2;font-size: 14px;
              line-height: 22px;">暂无内容</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.end {
  text-align: center;
  font-weight: 400;
  color: #8c95a3;
  font-size: 14px;
  line-height: 22px;
  padding-top: 12px;
  padding-bottom: 12px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item {
  padding: 20px 0;
}

.item:not(last-child) {
  border-bottom: 1px solid #ebebeb;
}

.content-item-title {
  border-bottom: 1px solid #EDEFF5;
  padding-bottom: 20px;
}

.content-item-title .title {
  display: inline;
  width: 100%;
  font-size: 18px;
  line-height: 26px;
  font-weight: 700;
  color: #393f4d;
  margin: 0;
}

.content {

}

.no-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  word-break: break-word;
}
</style>