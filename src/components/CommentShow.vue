<script>
import comment from "@/components/comment.vue";

export default {
  name: "CommentShow",
  components: {
    comment
  },
  data() {
    return {
      dialogVisible: false,
      commentDetail: null,
      showReply: false,
      replyId: null,
    }
  },
  props: {
    comment: {
      type: Object,
      required: true,
    },
    self: {
      type: Boolean,
      required: true,
    },
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
      console.log(this.comment)
      const page = this.$router.resolve({
        path: '/post-detail/' + this.comment.post_id,
      })
      window.open(page.href, '_blank')
    },
    GetCommentDetail() {
      this.$axios.get(`/comment/${this.comment.parent_id}`).then(res => {
        if (res.data.code === 0) {
          this.commentDetail = res.data.data.comment
          this.dialogVisible = true
        } else {
          this.$message.error('获取评论失败！')
        }
      }).catch(err => {
        console.log(err)
      })
    },
    addComment() {
      this.GetCommentDetail()
    },
    handleDelete(id) {
      this.$confirm('确认删除该评论？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(() => {
        this.$axios.del(`/comment/${id}`).then(res => {
          if (res.data.code === 0) {
            this.$message.success('删除成功！')
            this.GetCommentDetail()
          } else {
            this.$message.error('删除失败！')
          }
        }).catch(err => {
          console.log(err)
        })
      }).catch(() => {
        this.$message.info('取消删除！')
      })
    },
    handleCommentLike(obj) {
      if (!obj.isLike) {
        this.$axios.post('/comment/like', {
          id: obj.id,
          operate: 1,
          to_user_id: obj.user_id,
          post_id: obj.post_id,
        }).then(res => {
          if (res.data.code === 0) {
            obj.isLike = !obj.isLike
            obj.like_count++
            if (obj.user_id === this.user.id) {
              this.user.like_count++
            }
          }
        }).catch(err => {
          console.log(err)
        })
      } else {
        this.$axios.post('/comment/like', {
          id: obj.id,
          operate: 2,
          to_user_id: obj.user_id,
          post_id: obj.post_id,
        }).then(res => {
          if (res.data.code === 0) {
            obj.isLike = !obj.isLike
            obj.like_count--
            if (obj.user_id === this.user.id) {
              this.user.like_count--
            }
          }
        }).catch(err => {
          console.log(err)
        })
      }
    },
    handleReply(id) {
      console.log(id)
      if (this.showReply && this.replyId === id) {
        this.showReply = false
        this.replyId = null
      } else {
        this.showReply = true
        this.replyId = id
      }
    },
  }
}
</script>

<template>
  <div class="header">
    <div class="header-section">
      <div class="info-item pointer" @click="handleToUser">
        <div class="info-avatar">
          <el-image :src="comment.avatar" class="info-avatar-img"></el-image>
        </div>
        <div>
          <div class="name text-overflow0ellipsis-1">
            {{ comment.username }}
            <span v-if="self" class="type">我评论了{{ comment.reply_name }}</span>
            <span v-if="!self" class="type">评论了我</span>
          </div>
          <span class="time flex-vertical-center">{{ comment.create_time }}</span>
        </div>
      </div>
      <el-button style="display: inline-block" type="text" @click="handleToDetail">查看原帖</el-button>
    </div>
    <div class="item-content">
      <div style="margin-bottom: 12px" v-html="comment.content"></div>
      <div class="comment-section flex">
        <div class="comment-content pointer" v-if="comment.comment_id === 0" @click="handleToDetail">
          <div>帖子：</div>
          <div>{{ comment.post_title }}</div>
        </div>
        <div class="comment-content pointer" v-if="comment.comment_id !== 0" @click="GetCommentDetail">
          <div>评论：</div>
          <div v-html="comment.reply_content"></div>
        </div>
      </div>
    </div>
    <el-dialog :visible.sync="dialogVisible"
               v-if="commentDetail !== null"
               :append-to-body=true>
      <div class="dialog-header">
        <h1>{{ commentDetail.child.length }} 条回复</h1>
      </div>
      <div class="dialog-body">
        <div class="comment-dialog-section">
          <div class="main-comment">
            <div class="item-header">
              <div class="flex-all-center">
                <el-image class="comment-item-avatar" style="border-radius: 50%" :src="commentDetail.avatar"></el-image>
                <span class="comment-item-name">{{ commentDetail.username }}</span>
              </div>
            </div>
            <div class="item-content">
              <div class="ml-56">
                <div v-html="commentDetail.content"></div>
              </div>
            </div>
            <comment
                @refreshComment="addComment"
                class="ml-56"
                :is-floor="false"
                :to-user-id="commentDetail.user_id"
                :parent-id="commentDetail.id"
                :post-id="commentDetail.post_id"
                :comment-id="commentDetail.id"
                v-if="showReply && replyId === commentDetail.id"></comment>
            <div class="comment-item-footer flex">
              <div class="comment-item-time">
                <span style="margin-right: 8px">{{ commentDetail.floor + '楼' }}</span>
                <span>{{ commentDetail.create_time }}</span>
              </div>
              <div class="comment-item-handle">
                <button class="comment-item-btn" @click="handleDelete(commentDetail.id)" v-if="commentDetail.isOwn">
                  删除
                </button>
                <button class="comment-item-btn" @click="handleReply(commentDetail.id)">回复</button>

                <button class="comment-item-btn"
                        @click="handleCommentLike(commentDetail)">
                  <svg v-if="!commentDetail.isLike" t="1710380617321" class="icon" viewBox="0 0 1024 1024"
                       version="1.1"
                       xmlns="http://www.w3.org/2000/svg" p-id="4303" width="200" height="200">
                    <path
                        d="M176.725333 539.434667l335.253334 335.253333 335.253333-335.253333a189.653333 189.653333 0 1 0-268.202667-268.202667l-67.050666 67.050667-67.050667-67.050667A189.653333 189.653333 0 1 0 176.725333 539.434667z"
                        fill="#e6e6e6" p-id="4304"></path>
                    <path
                        d="M206.890667 301.397333a146.986667 146.986667 0 0 0 0 207.872L512 814.336l305.066667-305.066667a146.986667 146.986667 0 0 0-207.850667-207.872l-67.050667 67.050667a42.666667 42.666667 0 0 1-60.330666 0l-67.050667-67.050667a146.986667 146.986667 0 0 0-207.872 0zM146.56 569.6c-90.730667-90.709333-90.730667-237.802667 0-328.533333 90.709333-90.730667 237.802667-90.730667 328.533333 0L512 277.952l36.885333-36.906667c90.709333-90.709333 237.824-90.709333 328.533334 0 90.730667 90.752 90.730667 237.845333 0 328.554667L542.144 904.853333a42.666667 42.666667 0 0 1-60.330667 0L146.56 569.6z"
                        fill="#e6e6e6" p-id="4305"></path>
                  </svg>
                  <svg v-if="commentDetail.isLike" t="1710380617321" class="icon" viewBox="0 0 1024 1024"
                       version="1.1"
                       xmlns="http://www.w3.org/2000/svg" p-id="4303" width="200" height="200">
                    <path
                        d="M176.725333 539.434667l335.253334 335.253333 335.253333-335.253333a189.653333 189.653333 0 1 0-268.202667-268.202667l-67.050666 67.050667-67.050667-67.050667A189.653333 189.653333 0 1 0 176.725333 539.434667z"
                        fill="#ff3f4c" p-id="4304"></path>
                    <path
                        d="M206.890667 301.397333a146.986667 146.986667 0 0 0 0 207.872L512 814.336l305.066667-305.066667a146.986667 146.986667 0 0 0-207.850667-207.872l-67.050667 67.050667a42.666667 42.666667 0 0 1-60.330666 0l-67.050667-67.050667a146.986667 146.986667 0 0 0-207.872 0zM146.56 569.6c-90.730667-90.709333-90.730667-237.802667 0-328.533333 90.709333-90.730667 237.802667-90.730667 328.533333 0L512 277.952l36.885333-36.906667c90.709333-90.709333 237.824-90.709333 328.533334 0 90.730667 90.752 90.730667 237.845333 0 328.554667L542.144 904.853333a42.666667 42.666667 0 0 1-60.330667 0L146.56 569.6z"
                        fill="#ff3f4c" p-id="4305"></path>
                  </svg>
                  <span>{{ commentDetail.like_count }}</span>
                </button>
              </div>
            </div>
          </div>
          <div class="reply-comment-list">
            <div v-for="(ch,index) in commentDetail.child" :key="index" class="main-comment">
              <div class="item-header">
                <div class="flex-all-center">
                  <el-image class="comment-item-avatar" style="border-radius: 50%"
                            :src="ch.avatar"></el-image>
                  <span class="comment-item-name">{{ ch.username }}</span>
                  <!--                  <span v-if="ch.user_id === user.id" class="tag">楼主</span>-->
                </div>
              </div>
              <p class="ml-56 text-14 txt">回复
                <span class="name">{{ ch.reply_name }} </span>:</p>
              <div class="item-content">
                <div class="ml-56">
                  <div v-html="ch.content"></div>
                </div>
              </div>
              <comment
                  @refreshComment="addComment"
                  class="ml-56"
                  :is-floor="false"
                  :to-user-id="ch.user_id"
                  :parent-id="commentDetail.id"
                  :post-id="commentDetail.post_id"
                  :comment-id="ch.id"
                  v-if="showReply && replyId === ch.id"></comment>
              <div class="comment-item-footer flex">
                <div class="comment-item-time">
                  <span>{{ ch.create_time }}</span>
                </div>
                <div class="comment-item-handle">
                  <button class="comment-item-btn" @click="handleDelete(ch.id)" v-if="ch.isOwn">删除</button>
                  <button class="comment-item-btn" @click="handleReply(ch.id)">回复</button>
                  <button class="comment-item-btn" @click="handleCommentLike(ch)">
                    <svg v-if="!ch.isLike" t="1710380617321" class="icon" viewBox="0 0 1024 1024"
                         version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="4303" width="200" height="200">
                      <path
                          d="M176.725333 539.434667l335.253334 335.253333 335.253333-335.253333a189.653333 189.653333 0 1 0-268.202667-268.202667l-67.050666 67.050667-67.050667-67.050667A189.653333 189.653333 0 1 0 176.725333 539.434667z"
                          fill="#e6e6e6" p-id="4304"></path>
                      <path
                          d="M206.890667 301.397333a146.986667 146.986667 0 0 0 0 207.872L512 814.336l305.066667-305.066667a146.986667 146.986667 0 0 0-207.850667-207.872l-67.050667 67.050667a42.666667 42.666667 0 0 1-60.330666 0l-67.050667-67.050667a146.986667 146.986667 0 0 0-207.872 0zM146.56 569.6c-90.730667-90.709333-90.730667-237.802667 0-328.533333 90.709333-90.730667 237.802667-90.730667 328.533333 0L512 277.952l36.885333-36.906667c90.709333-90.709333 237.824-90.709333 328.533334 0 90.730667 90.752 90.730667 237.845333 0 328.554667L542.144 904.853333a42.666667 42.666667 0 0 1-60.330667 0L146.56 569.6z"
                          fill="#e6e6e6" p-id="4305"></path>
                    </svg>
                    <svg v-if="ch.isLike" t="1710380617321" class="icon" viewBox="0 0 1024 1024"
                         version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="4303" width="200" height="200">
                      <path
                          d="M176.725333 539.434667l335.253334 335.253333 335.253333-335.253333a189.653333 189.653333 0 1 0-268.202667-268.202667l-67.050666 67.050667-67.050667-67.050667A189.653333 189.653333 0 1 0 176.725333 539.434667z"
                          fill="#ff3f4c" p-id="4304"></path>
                      <path
                          d="M206.890667 301.397333a146.986667 146.986667 0 0 0 0 207.872L512 814.336l305.066667-305.066667a146.986667 146.986667 0 0 0-207.850667-207.872l-67.050667 67.050667a42.666667 42.666667 0 0 1-60.330666 0l-67.050667-67.050667a146.986667 146.986667 0 0 0-207.872 0zM146.56 569.6c-90.730667-90.709333-90.730667-237.802667 0-328.533333 90.709333-90.730667 237.802667-90.730667 328.533333 0L512 277.952l36.885333-36.906667c90.709333-90.709333 237.824-90.709333 328.533334 0 90.730667 90.752 90.730667 237.845333 0 328.554667L542.144 904.853333a42.666667 42.666667 0 0 1-60.330667 0L146.56 569.6z"
                          fill="#ff3f4c" p-id="4305"></path>
                    </svg>
                    <span>{{ ch.like_count }}</span>
                  </button>
                </div>
              </div>
            </div>
            <p class="txt text-14"
               style="padding-bottom: 12px;padding-top: 12px; text-align: center">- 暂无更多内容 -</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.comment-content:hover {
  color: #1db5b8;
}

.comment-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

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
  font-weight: 700;
  color: #292b2f;
  font-size: 14px;
  line-height: 22px;
}

.text-overflow0ellipsis-1 {
  wihte-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time {
  color: #aeb6c2;
  font-size: 14px;
  line-height: 20px;
}

.pointer {
  cursor: pointer;
}

.item-content {
  font-weight: 500;
  color: #292b2f;
  font-size: 15px;
  line-height: 24px;
}

.comment-section {
  height: 100%;
  max-height: 100px;
  color: #8c95a3;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 16px;
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
}

.name .type {
  font-weight: 350;
  color: #8c95a3;
}

.header-section >>> .el-button {
  display: inline-block;
}

.dialog-header {
  border-bottom: 1px solid #edeff5;
  width: 100%;
  height: 70px;
}

.dialog-header h1 {
  font-weight: 700;
  font-size: 18px;
  line-height: 22px;
  color: #292b2f;
  padding-left: 32px;
  padding-right: 32px;
  padding-bottom: 24px;
  margin-top: 0;
  margin-bottom: 0;
}

.dialog-body {
  min-height: min(685px, 60vh);
}

.comment-dialog-section {
  background-color: #fff;
  overflow-y: auto;
  height: min(685px, 60vh);
  padding: 32px 0;
}

.comment-dialog-section .main-comment {
  margin: 0 24px;
}

.comment-dialog-section .reply-comment-list {
  margin-top: 20px;
  padding-top: 24px;
  border-top: 8px solid #f3f6f8;
  //padding: 24px 24px 0;
}

.comment-dialog-section .main-comment .item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.reply-comment-list .main-comment {
  border-bottom: 1px solid #edeff5;
  margin-bottom: 20px;
}

.reply-comment-list .item-content {
  margin-bottom: 10px;
}

.reply-comment-list .comment-item-footer {
  margin-bottom: 10px;
}

.reply-comment-list .name {
  font-weight: 500;
  color: #1db5b8;
}

.flex-all-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.ml-56 {
  margin-left: 56px;
}

.flex {
  display: flex;
}

.comment-item-time {
  font-weight: 400;
  color: #aeb6c2;
  font-size: 13px;
  line-height: 21px;
}

.comment-item-handle {
  display: flex;
  align-items: center;
  flex-direction: row;
}

.comment-item-btn {
  font-weight: 400;
  font-size: 13px;
  line-height: 21px;
  color: #aeb6c2;
  background: initial;
  padding: 0;
  width: auto;
  height: auto;
  display: flex;
  align-items: center;
  margin-left: 32px;
  cursor: pointer;
  outline: none;
  border: none;
}

.comment-item-btn:hover {
  color: #1db5b8;
}

.comment-item-btn svg {
  width: 20px;
  height: 20px;
}

.tag {
  font-size: 10px;
  line-height: 12px;
  font-weight: 500;
  color: #1e7dfa;
  background: rgba(148, 195, 255, .1);
  padding: 2px 5px;
  border: 1px solid #94c3ff;
  border-radius: 4px;
  margin-left: 4px;
}

.txt {
  font-weight: 400;
  color: #586370;
}

.text-14 {
  font-size: 14px;
  line-height: 22px;
}

.comment-item-avatar {
  width: 40px;
  height: 40px;
  min-width: 40px;
  position: relative;
  margin-right: 16px;
}

</style>