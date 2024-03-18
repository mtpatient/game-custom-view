<script>
import CommentShow from "@/components/CommentShow.vue";

export default {
  name: "commentList",
  components: {
    Comment: CommentShow
  },
  data() {
    return {
      comments: []
    }
  }
}
</script>

<template>
  <div>
    <div class="content-item-title">
      <h2 class="title">评论</h2>
    </div>
    <div class="content">
      <Comment></Comment>
      <div v-if="!comments.length" class="no-content">
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