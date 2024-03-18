<script>
export default {
  name: "CommentShow",
  data() {
    return {
      comment: {
        id: 1,
        post_id: 13,
        content: "评论内容",
        user_id: 0,
        username: '伪相',
        avatar: require('../assets/defalut_avatar.png'),
        reply_id: 0,
        reply_username: '测试',
        create_time: '2018-09-13 15:46:07',
        status: 0,
        parent_id: 0,
        reply_content: '回复内容',
      },
      dialogVisible: false,
    }
  },
  methods: {
    handleToUser() {
      const page = this.$router.resolve({
        path: '/person-center/post',
        query: {
          id: this.comment.user_id,
        }
      })
      window.open(page.href, '_blank')
    },
    handleToDetail() {
      const page = this.$router.resolve({
        path: '/post-detail/' + this.comment.post_id,
      })
      window.open(page.href, '_blank')
    },
  }
}
</script>

<template>
  <div class="header">
    <div class="header-section">
      <div class="info-item" @click="handleToUser">
        <div class="info-avatar">
          <el-image :src="comment.avatar" class="info-avatar-img"></el-image>
        </div>
        <div>
          <div class="name text-overflow0ellipsis-1">{{ comment.username }}</div>
          <span class="time flex-vertical-center">{{ comment.create_time }}</span>
        </div>
      </div>
      <el-button type="text" @click="handleToDetail">查看原帖</el-button>
    </div>
    <el-dialog :visible.sync="dialogVisible"></el-dialog>
  </div>
</template>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
}

.flex-vertical-center {
  display: flex;
  align-items: center;
}

.mr-20 {
  margin-right: 20px;
}

.header-section .info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-item .info-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  margin-right: 12px;
}

.info-item .info-avatar .info-avatar-img {
  width: 100%;
  height: auto;
  background: #f3f3f3;
  background-size: 100% 100%;
  font-size: 12px;
  border-radius: 100%;
  object-fit: cover;
  cursor: pointer;
}

.info-item .name {
  font-weight: 500;
  color: #393f4d;
  font-size: 14px;
  line-height: 22px;
}

.text-overflow0ellipsis-1 {
  wihte-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-item .time {
  color: #aeb6c2;
  font-size: 12px;
  line-height: 20px;
}

.pointer {
  cursor: pointer;
}
</style>