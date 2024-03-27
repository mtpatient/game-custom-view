<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "post",
  data() {
    return {}
  },
  props: {
    isUser: {
      type: Boolean,
      required: true,
    },
    post: {
      type: Object,
      required: true,
    },
    onPost: {
      type: Boolean,
      required: true,
    }
  },
  created() {
    console.log(this.isUser, this.onPost)
  },
  computed: {
    p() {
      const match = this.post.content.match(/<p>(.*?)<\/p>/)
      if (match) {
        let doc = new DOMParser().parseFromString(match[1], 'text/html')
        return doc.body.textContent
      } else {
        return ''
      }
    },
    OnSelf() {
      if (!this.isUser) {
        return false
      }
      const user = this.$storage.get('user')
      if (user !== null && user !== undefined) {
        return user.id === this.post.user_id
      } else {
        return false
      }
    },
  },
  methods: {
    handleLike() {
      // eslint-disable-next-line vue/no-mutating-props
      if (!this.post.isLike) {
        this.$axios.post('/post/like', {
          post_id: this.post.id,
          user_id: this.post.user_id,
          operate: 1,
          status: this.post.status
        }).then(res => {
          if (res.data.code === 0) {
            this.$message.success('点赞成功！')
            // eslint-disable-next-line vue/no-mutating-props
            this.post.like_count++
            // eslint-disable-next-line vue/no-mutating-props
            this.post.isLike = !this.post.isLike
            if (this.isUser) {
              this.$emit('like', 1)
            }
          } else {
            this.$message.error('点赞失败！')
            this.isLike = !this.isLike
          }
        })

      } else {
        this.$axios.post('/post/like', {
          post_id: this.post.id,
          user_id: this.post.user_id,
          operate: 2,
          status: this.post.status
        }).then(res => {
          if (res.data.code === 0) {
            this.$message.success('取消点赞！')
            // eslint-disable-next-line vue/no-mutating-props
            this.post.like_count--
            // eslint-disable-next-line vue/no-mutating-props
            this.post.isLike = !this.post.isLike
            if (this.isUser) {
              this.$emit('like', -1)
            }
          } else {
            this.$message.error('取消点赞失败！')
            this.isLike = !this.isLike
          }
        })
      }
    },
    CountNums(v) {
      if (v < 1000) {
        return v
      }
      if (v > 1000 && v < 10000) {
        return (v / 1000).toFixed(2) + 'k'
      }

      return (v / 10000).toFixed(2) + 'w'
    },
    handleDelete() {
      this.$confirm('确定要删除该帖子吗？', '提示').then(() => {
        this.$axios.del('/post/' + this.post.id).then(res => {
          if (res.data.code === 0) {
            this.$message.success('删除成功！')
            this.$emit('change')
          } else {
            this.$message.error(res.data.msg)
          }
        }).catch(err => {
          console.log(err)
        })
      }).catch(err => {
        console.log(err)
      })
    },
    handleTop() {
      if (this.post.top_self) {
        this.$axios.post('/post/top', {
          id: this.post.id,
          operate: 2,
        }).then(res => {
          if (res.data.code === 0) {
            this.$message.success('取消置顶成功！')
            this.$emit('change')
          } else {
            this.$message.error(res.data.msg)
          }
        }).catch(err => {
          console.log(err)
        })
      } else if (!this.post.top_self) {
        this.$axios.post('/post/top', {
          id: this.post.id,
          operate: 1,
        }).then(res => {
          if (res.data.code === 0) {
            this.$message.success('置顶成功！')
            this.$emit('change')
          } else {
            this.$message.error(res.data.msg)
          }
        }).catch(err => {
          console.log(err)
        })
      }
    },
    handleToDetail() {
      const page = this.$router.resolve({
        path: '/post-detail/' + this.post.id,
      })
      window.open(page.href, '_blank')
    },
    handleToUser() {
      const page = this.$router.resolve({
        path: '/person-center/post',
        query: {
          id: this.post.user_id
        }
      })
      window.open(page.href, '_blank')
    },
    toComment() {
      const page = this.$router.resolve({
        path: '/post-detail/' + this.post.id,
        query: {
          comment: true
        }
      })

      window.open(page.href, '_blank')
    },
    handleToEdit() {
      const page = this.$router.resolve({
        path: '/edit',
        query: {
          id: this.post.id
        }
      })

      window.open(page.href, '_blank')
    }
  }
}
</script>

<template>
  <div>
    <div class="post-header">
      <div v-if="this.onPost && (post.top_self || post.status === 2)"
           class="post-tag flex-vertical-center">
        <div v-if="post.top_self" class="item top-section">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
               xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px">
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M4 0C1.79086 0 0 1.79086 0 4V12C0 14.2091 1.79086 16 4 16H12C14.2091 16 16 14.2091 16 12V4C16 1.79086 14.2091 0 12 0H4ZM7.61597 3.46093C7.81587 3.22105 8.1843 3.22105 8.3842 3.46093L12.3167 8.1799C12.5881 8.50557 12.3565 9 11.9326 9H10V12C10 12.5523 9.55233 13 9.00005 13H7.00005C6.44776 13 6.00005 12.5523 6.00005 12V9H4.06761C3.64369 9 3.41211 8.50557 3.6835 8.1799L7.61597 3.46093Z"
                  fill="#1DB5B8"></path>
          </svg>
          置顶
        </div>
        <div v-if="post.status === 2" class="item self-section">
          <svg style="margin-right: 8px" width="16" height="16" viewBox="0 0 16 16" fill="none"
               xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.7">
              <rect opacity="0.5" width="16" height="16" rx="4" fill="#999999"></rect>
              <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M9.5 6H11C11 4.34315 9.65685 3 8 3C6.34315 3 5 4.34315 5 6H6.5C6.5 5.17157 7.17157 4.5 8 4.5C8.82843 4.5 9.5 5.17157 9.5 6Z"
                    fill="white"></path>
              <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M4 6C3.44772 6 3 6.44772 3 7V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V7C13 6.44772 12.5523 6 12 6H4ZM8 8C7.72386 8 7.5 8.22386 7.5 8.5V10.5C7.5 10.7761 7.72386 11 8 11C8.27614 11 8.5 10.7761 8.5 10.5V8.5C8.5 8.22386 8.27614 8 8 8Z"
                    fill="white"></path>
            </g>
          </svg>
          仅自己可见
        </div>
      </div>
      <div class="header-section">
        <div class="info-item" @click="handleToUser">
          <div class="info-avatar">
            <el-image :src="post.avatar" class="info-avatar-img"></el-image>
          </div>
          <div>
            <div class="name text-overflow0ellipsis-1">{{ post.username }}</div>
            <span class="time flex-vertical-center">{{ post.create_time }}</span>
          </div>
        </div>
        <el-dropdown v-if="OnSelf && this.onPost">
          <span>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
            <rect opacity="0.01" width="22" height="22" fill="white"></rect>
            <circle cx="3" cy="11" r="2" fill="#999999"></circle>
            <circle cx="11" cy="11" r="2" fill="#999999"></circle>
            <circle cx="19" cy="11" r="2" fill="#999999"></circle>
            </svg>
          </span>
          <el-dropdown-menu>
            <el-dropdown-item @click.native="handleToEdit">
              编辑帖子
            </el-dropdown-item>
            <el-dropdown-item @click.native="handleDelete">
              删除帖子
            </el-dropdown-item>
            <el-dropdown-item @click.native="handleTop" v-if="!post.top_self">
              置顶帖子
            </el-dropdown-item>
            <el-dropdown-item @click.native="handleTop" v-else>
              取消置顶
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="post-content pointer">
      <div class="post-main-content" @click="handleToDetail">
        <div class="post-title">{{ post.title }}</div>
        <p class="post-p">{{ p }}</p>
      </div>
      <div class="post-img">
        <div v-if="post.imgList !== null"
             class="post-image-container">
          <el-image class="item-img"
                    lazy :preview-src-list="post.imgList"
                    fit="cover"
                    :key="index"
                    v-for="(img, index) in post.imgList" :src="img"></el-image>
        </div>
      </div>
    </div>
    <div class="post-footer">
      <div class="active-box flex">
        <span class="flex-vertical-center pd-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
               xmlns="http://www.w3.org/2000/svg" class="mr-2"><path
              d="M3.2456 10.6349C4.07753 8.13913 6.12689 6.24136 8.67913 5.6033L8.93496 5.53934C10.9474 5.03624 13.0526 5.03624 15.065 5.53934L15.3209 5.6033C17.8731 6.24136 19.9225 8.13913 20.7544 10.6349C21.0498 11.521 21.0498 12.479 20.7544 13.3651C19.9225 15.8609 17.8731 17.7586 15.3209 18.3967L15.065 18.4607C13.0526 18.9638 10.9474 18.9638 8.93496 18.4607L8.67912 18.3967C6.12688 17.7586 4.07753 15.8609 3.2456 13.3651C2.95023 12.479 2.95023 11.521 3.2456 10.6349Z"
              stroke="#AEB6C2" stroke-width="1.5"></path><circle cx="12" cy="12" r="2.25" stroke="#AEB6C2"
                                                                 stroke-width="1.5"></circle></svg>
          &nbsp;{{ CountNums(post.view_count) }}
        </span>
        <span class="flex-vertical-center pd-6 mr-20 pointer" @click="toComment">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
               xmlns="http://www.w3.org/2000/svg" class="mr-2"><mask id="path-1-inside-1_0_468" fill="white"><path
              fill-rule="evenodd" clip-rule="evenodd"
              d="M7 4C4.79086 4 3 5.79086 3 8V14C3 16.2091 4.79086 18 7 18H9.75736L11.2929 19.5355C11.6834 19.9261 12.3166 19.9261 12.7071 19.5355L14.2426 18H17C19.2091 18 21 16.2091 21 14V8C21 5.79086 19.2091 4 17 4H7Z"></path></mask><path
              d="M9.75736 18L10.818 16.9393L10.3787 16.5H9.75736V18ZM11.2929 19.5355L10.2322 20.5962L10.2322 20.5962L11.2929 19.5355ZM14.2426 18V16.5H13.6213L13.182 16.9393L14.2426 18ZM4.5 8C4.5 6.61929 5.61929 5.5 7 5.5V2.5C3.96243 2.5 1.5 4.96243 1.5 8H4.5ZM4.5 14V8H1.5V14H4.5ZM7 16.5C5.61929 16.5 4.5 15.3807 4.5 14H1.5C1.5 17.0376 3.96243 19.5 7 19.5V16.5ZM9.75736 16.5H7V19.5H9.75736V16.5ZM12.3536 18.4749L10.818 16.9393L8.6967 19.0607L10.2322 20.5962L12.3536 18.4749ZM11.6464 18.4749C11.8417 18.2796 12.1583 18.2796 12.3536 18.4749L10.2322 20.5962C11.2085 21.5725 12.7915 21.5725 13.7678 20.5962L11.6464 18.4749ZM13.182 16.9393L11.6464 18.4749L13.7678 20.5962L15.3033 19.0607L13.182 16.9393ZM17 16.5H14.2426V19.5H17V16.5ZM19.5 14C19.5 15.3807 18.3807 16.5 17 16.5V19.5C20.0376 19.5 22.5 17.0376 22.5 14H19.5ZM19.5 8V14H22.5V8H19.5ZM17 5.5C18.3807 5.5 19.5 6.61929 19.5 8H22.5C22.5 4.96243 20.0376 2.5 17 2.5V5.5ZM7 5.5H17V2.5H7V5.5Z"
              fill="#AEB6C2" mask="url(#path-1-inside-1_0_468)"></path><rect x="7" y="10" width="4" height="1.5"
                                                                             rx="0.75" fill="#AEB6C2"></rect><rect
              x="13" y="10" width="4" height="1.5" rx="0.75" fill="#AEB6C2"></rect></svg>
          &nbsp;{{ CountNums(post.comment_count) }}
        </span>
        <span class="flex-vertical-center pd-6 pointer" @click="handleLike">
          <svg v-if="!post.isLike" t="1710380617321" class="icon" viewBox="0 0 1024 1024"
               version="1.1"
               xmlns="http://www.w3.org/2000/svg" p-id="4303" width="200" height="200">
            <path
                d="M176.725333 539.434667l335.253334 335.253333 335.253333-335.253333a189.653333 189.653333 0 1 0-268.202667-268.202667l-67.050666 67.050667-67.050667-67.050667A189.653333 189.653333 0 1 0 176.725333 539.434667z"
                fill="#e6e6e6" p-id="4304"></path>
            <path
                d="M206.890667 301.397333a146.986667 146.986667 0 0 0 0 207.872L512 814.336l305.066667-305.066667a146.986667 146.986667 0 0 0-207.850667-207.872l-67.050667 67.050667a42.666667 42.666667 0 0 1-60.330666 0l-67.050667-67.050667a146.986667 146.986667 0 0 0-207.872 0zM146.56 569.6c-90.730667-90.709333-90.730667-237.802667 0-328.533333 90.709333-90.730667 237.802667-90.730667 328.533333 0L512 277.952l36.885333-36.906667c90.709333-90.709333 237.824-90.709333 328.533334 0 90.730667 90.752 90.730667 237.845333 0 328.554667L542.144 904.853333a42.666667 42.666667 0 0 1-60.330667 0L146.56 569.6z"
                fill="#e6e6e6" p-id="4305"></path>
          </svg>
          <svg v-if="post.isLike" t="1710380617321" class="icon" viewBox="0 0 1024 1024"
               version="1.1"
               xmlns="http://www.w3.org/2000/svg" p-id="4303" width="200" height="200">
            <path
                d="M176.725333 539.434667l335.253334 335.253333 335.253333-335.253333a189.653333 189.653333 0 1 0-268.202667-268.202667l-67.050666 67.050667-67.050667-67.050667A189.653333 189.653333 0 1 0 176.725333 539.434667z"
                fill="#ff3f4c" p-id="4304"></path>
            <path
                d="M206.890667 301.397333a146.986667 146.986667 0 0 0 0 207.872L512 814.336l305.066667-305.066667a146.986667 146.986667 0 0 0-207.850667-207.872l-67.050667 67.050667a42.666667 42.666667 0 0 1-60.330666 0l-67.050667-67.050667a146.986667 146.986667 0 0 0-207.872 0zM146.56 569.6c-90.730667-90.709333-90.730667-237.802667 0-328.533333 90.709333-90.730667 237.802667-90.730667 328.533333 0L512 277.952l36.885333-36.906667c90.709333-90.709333 237.824-90.709333 328.533334 0 90.730667 90.752 90.730667 237.845333 0 328.554667L542.144 904.853333a42.666667 42.666667 0 0 1-60.330667 0L146.56 569.6z"
                fill="#ff3f4c" p-id="4305"></path>
          </svg>
          &nbsp;{{ CountNums(post.like_count) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-content {
  display: inline-block;
  font-size: 22px;
  width: 100%;
  cursor: pointer;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-header .post-tag {
  font-size: 12px;
  line-height: 12px;
  margin-bottom: 20px;
}

.flex-vertical-center {
  display: flex;
  align-items: center;
}

.post-tag .item {
  display: flex;
  align-items: center;
}

.post-tag .top-section {
  color: #1db5b8;
}

.post-tag .item:not(:last-child):after {
  content: "";
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1px;
  height: 10px;
  margin: 0 16px;
  background: #f3f3f3;
}

.post-tag .self-section {
  font-weight: 500;
  color: #bfbfbf;
}

.post-header .header-section {
  display: flex;
  justify-content: space-between;
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

.post-main-content .post-title {
  font-size: 15px;
  font-weight: 500;
}

.post-main-content:hover {
  color: #1db5b8;
}

.post-main-content .post-p {
  font-size: 14px;
  font-weight: 400;
  color: #808893;
}

.post-content .post-img {
  display: grid;
}

.post-img .item-img {
  width: 160px;
  height: 160px;
  margin: 3px;
  border-radius: 10px;
}

.post-img .item-img:hover {
  box-shadow: 0px 2px 16px #409EFF;
}

.flex {
  display: flex;
}

.pd-6 {
  padding: 6px;
}

.active-box span {
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  color: #aeb6c2;
}

.active-box span:not(:last-child) {
  margin-right: 24px;
}

.active-box span .icon {
  height: 20px;
  width: 20px;
}
</style>