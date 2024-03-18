<script>
import {debounce} from "@/js/util";

export default {
  name: "postDetail",
  components: {
    comment: () => import('../components/comment.vue')
  },
  data() {
    return {
      post: {
        id: 0,
        user_id: 0,
        title: '',
        content: '',
        status: 0,
        section: 0,
        isPrivate: '',
        view_count: 0,
        like_count: 0,
        collect_count: 0,
        create_time: '',
        update_time: '',
      },
      user: {
        id: 1,
        username: '测试',
        avatar: '',
        sex: 0,
        signature: '个性签名限制长度为20字符是不是太少了。',
        fans_count: 0,
        like_count: 0,
        follow_count: 0,
        role: 0,
      },
      comments: [],
      section: {
        id: 0,
        name: '占位',
        dc: '',
        icon: ''
      },
      isLike: false,
      isCollect: false,
      isFollow: false,
      isGetData: false,
      dialogVisible: false,
      commentDetail: null,
      replyId: 0, // 回复的评论id
      showReply: false,
      getComments: {
        post_id: this.$route.params.id,
        page_size: 20,
        is_only_publisher: 0,
        page_index: 1,
        show_type: 1,
      },
      commentCount: 0,
      loading: false,
      end: false,
      scroller: null,
      commentId: 0,
    }
  },
  computed: {
    OnSelf() {
      const user = this.$storage.get('user')
      if (user === null || user === undefined) {
        return false
      }
      return user.id === this.user.id;
    }
  },
  created() {
    this.$axios.get(`/post/${this.$route.params.id}`).then(res => {
      if (res.data.code === 0) {
        this.post = res.data.data.post
        this.isLike = res.data.data.is_like
        this.isCollect = res.data.data.is_collect
        this.isFollow = res.data.data.is_follow
        this.commentCount = res.data.data.comment_count
        this.$axios.get(`/user/${this.post.user_id}`).then(res => {
          if (res.data.code === 0) {
            this.user = res.data.data.user
            this.isGetData = true
          } else {
            this.$message.error('获取用户数据失败！')
          }
        }).catch((err) => {
          console.log(err)
        })
        // 获取帖子所属板块
        this.$axios.get(`/section/${this.post.section}`).then(res => {
          if (res.data.code === 0) {
            this.section = res.data.data.section
          }
        }).catch(err => {
          console.log(err)
        })
      } else {
        this.$message.error('帖子不存在')
      }
    }).catch(() => {
      console.log('获取帖子失败')
    })
    this.getCommentList()

  },
  mounted() {
    this.$nextTick(() => {
      // TODO 滚动到评论区
      if (this.$route.query.comment) {
        console.log(this.$route.query.comment)
        this.scrollToSection()
      }
      this.scroller = debounce(() => {
        if (!this.end) {
          this.loading = true
        } else {
          this.loading = false
        }
      }, this.handleScroll, 300)
      window.addEventListener('scroll', this.scroller)
    })

  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.scroller)
  },
  methods: {
    handleScroll() {
      // 获取页面的滚动位置
      const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

      // 获取页面高度
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 检查是否滚动到页面底部
      if (scrollPosition + windowHeight >= documentHeight && !this.end) {
        // 触发函数
        this.getComments.page_index++
        this.getCommentList()
        this.loading = false
      }
    },
    handleCollect() {
      this.isCollect = !this.isCollect
      if (this.isCollect) {
        this.$axios.post('/post/collect', {
          post_id: this.post.id,
          operate: 1,
          status: this.post.status
        }).then(res => {
          if (res.data.code === 0) {
            this.$message.success('收藏成功！')
            this.post.collect_count++
          } else {
            this.$message.error('收藏失败！')
            this.isCollect = !this.isCollect
          }
        })

      } else {
        this.$axios.post('/post/collect', {
          post_id: this.post.id,
          operate: 2,
          status: this.post.status
        }).then(res => {
          if (res.data.code === 0) {
            this.$message.success('取消收藏！')
            this.post.collect_count--
          } else {
            this.$message.error('取消收藏失败！')
            this.isCollect = !this.isCollect
          }
        })

      }
    },
    handleLike() {
      this.isLike = !this.isLike
      if (this.isLike) {
        this.$axios.post('/post/like', {
          post_id: this.post.id,
          user_id: this.post.user_id,
          operate: 1,
          status: this.post.status
        }).then(res => {
          if (res.data.code === 0) {
            this.$message.success('点赞成功！')
            this.post.like_count++
            this.user.like_count++
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
            this.post.like_count--
            this.user.like_count--
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
    handleFollow() {
      this.isFollow = !this.isFollow
      if (this.isFollow) {
        this.$axios.post('/user/follow', {
          id: this.user.id,
          operate: 1,
        }).then(res => {
          if (res.data.code === 0) {
            this.$message.success('关注成功！')
            this.user.fans_count++
          } else {
            this.$message.error('关注失败！')
            this.isFollow = !this.isFollow
          }
        })
      } else {
        this.$axios.post('/user/follow', {
          id: this.user.id,
          operate: 2,
        }).then(res => {
          if (res.data.code === 0) {
            this.$message.success('取消关注！')
            this.user.fans_count--
          } else {
            this.$message.error('取消关注失败！')
            this.isFollow = !this.isFollow
          }
        })
      }
    },
    ToUserDetail(id) {
      let page = this.$router.resolve({
        path: '/person-center/post',
        query: {id: id}
      })
      window.open(page.href, '_blank')
    },
    ToFollow(id) {
      let page = this.$router.resolve({
        path: '/person-center/follow',
        query: {id: id}
      })
      window.open(page.href, '_blank')
    },
    Tofans(id) {
      let page = this.$router.resolve({
        path: '/person-center/fans',
        query: {id: id}
      })
      window.open(page.href, '_blank')
    },
    scrollToSection() {
      const s = document.getElementsByClassName('comment-detail')

      if (s[0]) {
        s[0].scrollIntoView({
          behavior: 'smooth'
        })
      }
    },
    handleCommentDetail(comment) {
      this.dialogVisible = true
      this.commentDetail = comment
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
    getCommentList() {
      this.$axios.post('/comment/getPostCommentList', this.getComments).then(res => {
        if (res.data.code === 0) {
          if (res.data.data.comments != null) {
            this.comments.push(...res.data.data.comments)
            if (res.data.data.comments.length < 20) {
              this.end = true
            }
          } else {
            this.end = true
          }
        } else {
          this.$message.error('获取评论失败！')
        }
      })
    },
    addComment() {
      this.getComments.page_index = 1
      this.end = false
      this.showReply = false
      this.dialogVisible = false
      this.commentCount++
      this.comments = []
      this.getCommentList()
    },
    handleDelete(id) {
      this.$confirm('确认删除该评论？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(() => {
        this.$axios.del(`/comment/${id}`).then(res => {
          if (res.data.code === 0) {
            this.$message.success('删除成功！')
            this.commentCount--
            this.comments = []
            this.getCommentList()
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
    changeFilter(v) {
      this.end = false
      this.getComments.page_index = 1
      let allLi = this.$refs["all-li"]
      let publisherLi = this.$refs["only-publisher-li"]
      if (v === 'all') {
        this.getComments.is_only_publisher = 0
        if (!allLi.classList.contains('active')) {
          allLi.classList.add('active')
        }
        publisherLi.classList.remove('active')
      } else if (v === 'only-publisher') {
        this.getComments.is_only_publisher = 1
        if (!publisherLi.classList.contains('active')) {
          publisherLi.classList.add('active')
        }
        allLi.classList.remove('active')
      } else {
        console.log('error', v)
      }
      this.comments = []
      this.getCommentList()
    },
    changeSort(v) {
      this.end = false
      this.getComments.page_index = 1
      let newLi = this.$refs["new-li"]
      let defaultLi = this.$refs["default-li"]
      if (v === 'new') {
        this.getComments.show_type = 2
        if (!newLi.classList.contains('active')) {
          newLi.classList.add('active')
        }
        defaultLi.classList.remove('active')
      } else if (v === 'default') {
        this.getComments.show_type = 1
        if (!defaultLi.classList.contains('active')) {
          defaultLi.classList.add('active')
        }
        newLi.classList.remove('active')
      } else {
        console.log('error', v)
      }
      this.comments = []
      this.getCommentList()
    }
  },
}
</script>

<template>
  <div v-if="isGetData" class="main-container">
    <div class="mask"></div>
    <div class="main-content-container">
      <div class="main-box flex">
        <div class="aside-section">
          <div class="post-state-section">
            <div class="item" @click="scrollToSection">
              <el-badge type="info" :value="commentCount">
                <svg t="1709716345900" class="icon" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="4361" width="200" height="200">
                  <path
                      d="M711.1 292.5V164.3H89v494.2h128v128.3l397.6-0.5 73.5 73.4 73.5-73 173.4 0.1V292.5H711.1zM135 612.5V210.3h530.1v82.2H217v320h-82z m754 128.3l-146.3-0.1-54.5 54.1-54.6-54.5-370.6 0.5V338.5h626v402.3z"
                      p-id="4362" fill="#bfbfbf"></path>
                  <path d="M336.1 516.6h96v46h-96zM528 516.6h96v46h-96zM722.7 516.6h96v46h-96z" p-id="4363"
                        fill="#bfbfbf"></path>
                </svg>
              </el-badge>
            </div>
            <div class="item" @click="handleLike">
              <el-badge type="info" :value="post.like_count">
                <svg v-if="!isLike" t="1709717675931" class="icon" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="12788" width="200" height="200">
                  <path
                      d="M960.4 374.1c0 67.3-25.8 134.4-76.9 185.8L544 899.3c-17.7 17.7-46.4 17.7-64.1 0L140.5 559.8C38 457.2 38 291 140.5 188.3c51.3-51.1 118.4-76.9 185.8-76.9 55.7 0 111.3 17.7 157.9 52.7 16.6 12.5 39 12.5 55.6 0 103-77.5 249.9-69.5 343.7 24.1 51.1 51.5 76.9 118.5 76.9 185.9z"
                      p-id="12789" fill="#e6e6e6"></path>
                </svg>
                <svg v-if="isLike" t="1709717675931" class="icon" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="12788" width="200" height="200">
                  <path
                      d="M960.4 374.1c0 67.3-25.8 134.4-76.9 185.8L544 899.3c-17.7 17.7-46.4 17.7-64.1 0L140.5 559.8C38 457.2 38 291 140.5 188.3c51.3-51.1 118.4-76.9 185.8-76.9 55.7 0 111.3 17.7 157.9 52.7 16.6 12.5 39 12.5 55.6 0 103-77.5 249.9-69.5 343.7 24.1 51.1 51.5 76.9 118.5 76.9 185.9z"
                      p-id="12789" fill="#fd7680"></path>
                </svg>
              </el-badge>
            </div>
            <div class="item" @click="handleCollect">
              <el-badge type="info" :value="post.collect_count">
                <svg v-if="!isCollect" t="1709716527625" class="icon" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="6754" width="200" height="200">
                  <path
                      d="M557.568 807.68l211.2 77.44-9.216-248.32a64 64 0 0 1 13.632-41.856l153.408-195.456-216.384-61.44a128 128 0 0 1-71.296-51.84l-125.44-186.752-125.312 186.752a128 128 0 0 1-71.296 51.84l-216.32 61.44 138.88 177.024a128 128 0 0 1 27.2 83.776l-8.32 224.768 211.2-77.44a128 128 0 0 1 88.064 0zM280.32 945.152a64 64 0 0 1-85.952-62.464l8.32-224.832a64 64 0 0 0-13.568-41.856L50.176 439.04a64 64 0 0 1 32.832-101.12l216.32-61.44a64 64 0 0 0 35.712-25.92L460.416 63.744a64 64 0 0 1 106.24 0l125.44 186.816a64 64 0 0 0 35.584 25.856l216.384 61.568a64 64 0 0 1 32.832 101.056l-153.344 195.392 9.216 248.32a64 64 0 0 1-86.016 62.4l-211.2-77.44a64 64 0 0 0-44.032 0l-211.2 77.44z"
                      fill="#bfbfbf" p-id="6755"></path>
                </svg>
                <svg v-if="isCollect" t="1709717444653" class="icon" viewBox="0 0 1080 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="11717" width="200" height="200">
                  <path
                      d="M1076.605738 381.666759c-9.300782-26.325397-33.328338-45.699344-62.228346-49.857341L733.184824 290.905288l-122.229653-248.218239c-12.808689-26.055062-40.363463-42.687049-70.65376-42.687049-30.225932 0-57.729213 16.62555-70.621578 42.687049L347.43087 290.898851 66.244739 331.809418c-28.893571 4.157997-52.927564 23.531944-62.209036 49.857341-9.275036 26.460564-2.278531 55.605159 18.14457 75.468282l206.065421 201.295955-47.784778 279.107133c-4.859578 28.17268 7.582229 56.34536 32.002413 72.835743a81.203228 81.203228 0 0 0 44.952707 13.555326c12.950293 0 25.977824-3.108843 37.788852-9.223543l245.122269-129.136047 245.180197 129.136047a82.130088 82.130088 0 0 0 37.698741 9.22998c15.814548 0 31.526111-4.61499 44.978452-13.555327 24.426621-16.496819 36.849119-44.669499 32.008851-72.842179l-47.784779-279.100697 206.097604-201.295954c20.390918-19.882433 27.419606-49.020592 18.099515-75.474719z m-249.138662-28.475197l4.788776 0.695145-2.523119 0.193096-2.265657-0.888241z"
                      p-id="11718" fill="#e4ce76"></path>
                </svg>
              </el-badge>
            </div>
          </div>
        </div>
        <div class="flex">
          <div class="post-main-container">
            <div class="detail-container">
              <div class="post-detail">
                <div class="post-title-container">
                  <div class="post-title">{{ post.title }}</div>
                  <div class="post-create-time flex">
                    {{
                      (post.status === 2 ? '仅自己可见 | ' : '') + '发布时间 ' + post.create_time + ' | 更新时间 ' + post.update_time
                    }}
                  </div>
                </div>
                <div class="post-content">
                  <div class="article" v-html="post.content">
                  </div>
                </div>
                <div class="post-footer">
                  阅读次数：{{ post.view_count }}
                </div>
              </div>
              <!--              评论区-->
              <div class="comment-detail">
                <div class="comment-header">
                  <ul class="filter-section">
                    <li ref="all-li"
                        @click="changeFilter('all')"
                        class="active item">全部评论
                    </li>
                    <li @click="changeFilter('only-publisher')"
                        ref="only-publisher-li" class="item">只看楼主
                    </li>
                  </ul>
                  <ul class="dropdown-list">
                    <li ref="default-li" class="active">
                      <button @click="changeSort('default')" class="btn">默认</button>
                    </li>
                    <li ref="new-li">
                      <button @click="changeSort('new')" class="btn">最新</button>
                    </li>
                  </ul>
                </div>
                <div class="comment-box">
                  <div class="comment-add-box">
                    <div id="comment-add" class="comment-add">
                      <comment
                          v-on:refreshComment="addComment"
                          :is-floor="true"
                          :to-user-id="post.user_id"
                          :parent-id="0"
                          :comment-id="0"
                          :post-id="post.id"></comment>
                    </div>
                  </div>
                  <div class="comment-list">
                    <div class="no-content" v-if="comments.length === 0">
                      <el-image class="no-content-image" :src="require('@/assets/no-content.png')"></el-image>
                      <span class="no-content-txt">暂无评论</span>
                    </div>
                    <ul>
                      <li class="comment-item" v-for="(c, index) in comments" :key="c.id">
                        <template>
                          <div class="main-comment">
                            <div class="comment-item-header">
                              <div class="flex-all-center">
                                <div class="comment-item-avatar">
                                  <el-image
                                      @click="ToUserDetail(c.user_id)"
                                      :src="c.avatar"
                                      class="comment-avatar"></el-image>
                                </div>
                                <span class="comment-item-name">
                                  {{ c.username }}
                                </span>
                                <span v-if="c.user_id === user.id" class="tag">楼主</span>
                              </div>
                            </div>
                            <div class="comment-item-content">
                              <div class="ml-56">
                                <div v-html="c.content"></div>
                              </div>
                            </div>
                            <comment class="ml-56"
                                     @refreshComment="addComment"
                                     :is-floor="false"
                                     :to-user-id="c.user_id"
                                     :parent-id="c.id"
                                     :post-id="c.post_id"
                                     :comment-id="c.id"
                                     v-if="showReply && replyId === c.id"></comment>
                            <div class="comment-item-footer flex">
                              <div class="comment-item-time">
                                <span style="margin-right: 8px">{{ c.floor + '楼' }}</span>
                                <span>{{ c.create_time }}</span>
                              </div>
                              <div class="comment-item-handle">
                                <button class="comment-item-btn" @click="handleDelete(c.id)" v-if="c.isOwn">删除
                                </button>
                                <button class="comment-item-btn" @click="handleReply(c.id)">回复</button>
                                <button @click="handleCommentLike(c)"
                                        class="comment-item-btn">
                                  <svg v-if="!c.isLike" t="1710380617321" class="icon" viewBox="0 0 1024 1024"
                                       version="1.1"
                                       xmlns="http://www.w3.org/2000/svg" p-id="4303" width="200" height="200">
                                    <path
                                        d="M176.725333 539.434667l335.253334 335.253333 335.253333-335.253333a189.653333 189.653333 0 1 0-268.202667-268.202667l-67.050666 67.050667-67.050667-67.050667A189.653333 189.653333 0 1 0 176.725333 539.434667z"
                                        fill="#e6e6e6" p-id="4304"></path>
                                    <path
                                        d="M206.890667 301.397333a146.986667 146.986667 0 0 0 0 207.872L512 814.336l305.066667-305.066667a146.986667 146.986667 0 0 0-207.850667-207.872l-67.050667 67.050667a42.666667 42.666667 0 0 1-60.330666 0l-67.050667-67.050667a146.986667 146.986667 0 0 0-207.872 0zM146.56 569.6c-90.730667-90.709333-90.730667-237.802667 0-328.533333 90.709333-90.730667 237.802667-90.730667 328.533333 0L512 277.952l36.885333-36.906667c90.709333-90.709333 237.824-90.709333 328.533334 0 90.730667 90.752 90.730667 237.845333 0 328.554667L542.144 904.853333a42.666667 42.666667 0 0 1-60.330667 0L146.56 569.6z"
                                        fill="#e6e6e6" p-id="4305"></path>
                                  </svg>
                                  <svg v-if="c.isLike" t="1710380617321" class="icon" viewBox="0 0 1024 1024"
                                       version="1.1"
                                       xmlns="http://www.w3.org/2000/svg" p-id="4303" width="200" height="200">
                                    <path
                                        d="M176.725333 539.434667l335.253334 335.253333 335.253333-335.253333a189.653333 189.653333 0 1 0-268.202667-268.202667l-67.050666 67.050667-67.050667-67.050667A189.653333 189.653333 0 1 0 176.725333 539.434667z"
                                        fill="#ff3f4c" p-id="4304"></path>
                                    <path
                                        d="M206.890667 301.397333a146.986667 146.986667 0 0 0 0 207.872L512 814.336l305.066667-305.066667a146.986667 146.986667 0 0 0-207.850667-207.872l-67.050667 67.050667a42.666667 42.666667 0 0 1-60.330666 0l-67.050667-67.050667a146.986667 146.986667 0 0 0-207.872 0zM146.56 569.6c-90.730667-90.709333-90.730667-237.802667 0-328.533333 90.709333-90.730667 237.802667-90.730667 328.533333 0L512 277.952l36.885333-36.906667c90.709333-90.709333 237.824-90.709333 328.533334 0 90.730667 90.752 90.730667 237.845333 0 328.554667L542.144 904.853333a42.666667 42.666667 0 0 1-60.330667 0L146.56 569.6z"
                                        fill="#ff3f4c" p-id="4305"></path>
                                  </svg>
                                  <span>{{ c.like_count }}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                          <ul class="comment-in-section"
                              v-if="c.child != null && c.child.length > 0">
                            <li class="comment-in-item" v-for="(ch,j) in  c.child.slice(0,2)">
                              <div class="comment-in-item-content">
                                <div class="comment-in-main-content">
                                  <div class="txt-overflow-ellipsis-2 mb-4">
                                    <span class="name text-14">{{ ch.username }}</span>
                                    <span class="txt text-14"> 回复 </span>
                                    <span class="name text-14"> {{ ch.reply_name }}</span>
                                    <span class="txt text-14"> : <span v-html="ch.content"></span></span>
                                  </div>
                                </div>
                                <comment
                                    @refreshComment="addComment"
                                    :is-floor="false"
                                    :to-user-id="ch.user_id"
                                    :parent-id="c.id"
                                    :post-id="c.post_id"
                                    :comment-id="ch.id"
                                    v-if="showReply && replyId === ch.id"></comment>
                                <div class="comment-in-item-footer flex">
                                  <div class="comment-in-item-time">
                                    <!--                                    <span style="margin-right: 8px">{{ c.floor + '楼' }}</span>-->
                                    <span>{{ ch.create_time }}</span>
                                  </div>
                                  <div class="comment-item-handle">
                                    <button class="comment-item-btn" @click="handleDelete(ch.id)" v-if="ch.isOwn">删除
                                    </button>
                                    <button class="comment-item-btn" @click="handleReply(ch.id)">回复</button>
                                    <button class="comment-item-btn"
                                            @click="handleCommentLike(ch)">
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
                            </li>

                            <p @click="handleCommentDetail(c)" class="mt-20 count" v-if="c.child.length > 2">
                              {{ '查看全部 ' + c.child.length + ' 条回复 >>' }}</p>
                          </ul>
                        </template>
                      </li>
                    </ul>
                    <p v-if="comments.length > 0 && loading" class="txt text-14"
                       style="padding-bottom: 12px;padding-top: 12px; text-align: center">- 加载中，请稍后 -</p>
                    <p v-if="comments.length > 0 && end && !loading" class="txt text-14"
                       style="padding-bottom: 12px;padding-top: 12px; text-align: center">- 暂无更多内容 -</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="aside-box">
          <div class="inside-box">
            <div class="aside-box-section">
              <div class="aside-box-userInfo flex">
                <div class="info-avatar">
                  <el-image @click="ToUserDetail(user.id)" :src="user.avatar">
                    <div slot="error" class="image-slot">
                      <el-image @click="ToUserDetail(user.id)"
                                :src="require('@/assets/defalut_avatar.png')"></el-image>
                    </div>
                  </el-image>
                </div>
                <div class="info-section">
                  <div @click="ToUserDetail(user.id)" class="userinfo-name">{{ user.username }}
                    <span v-if="user.sex === 0"><i class="el-icon-female icon" style="color: red"></i></span>
                    <span v-if="user.sex === 1"><i class="el-icon-male icon" style="color: dodgerblue"></i></span>
                  </div>
                  <div class="userinfo-uid">{{ 'UID:' + (user.id + 10000000) }}</div>
                </div>
              </div>
              <div class="aside-box-userdata">
                <span class="item" @click="ToFollow(user.id)">
                  <p>关注</p>
                  <span class="number">{{ CountNums(user.follow_count) }}</span>
                </span>
                <span class="item" @click="Tofans(user.id)">
                  <p>粉丝</p>
                  <span class="number">{{ CountNums(user.fans_count) }}</span>
                </span>
                <span class="item">
                  <p>获赞</p>
                  <span class="number">{{ CountNums(user.like_count) }}</span>
                </span>
              </div>
              <div class="aside-box-usersignature">
                {{ user.signature }}
              </div>
              <el-button @click="handleFollow" v-if="!OnSelf && !this.isFollow" type="primary" style="width: 100%">
                关注
              </el-button>
              <el-button @click="handleFollow" v-if="!OnSelf && this.isFollow" type="info" style="width: 100%">已关注
              </el-button>
            </div>
            <div class="aside-box-section">
              <div class="section-container">
                <span style="margin-right: 16px">板块：</span>
                <!--                TODO 处理板块跳转-->
                <span class="section-box"><span>{{ section.name }}</span></span>
              </div>
            </div>
            <!--            <div class="aside-box-section">-->
            <!--              暂时不知道放什么-->
            <!--            </div>-->
          </div>
        </div>
      </div>
    </div>
    <el-dialog :visible.sync="dialogVisible" v-if="commentDetail !== null">
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
                <span v-if="commentDetail.user_id === user.id" class="tag">楼主</span>
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
            <div v-for="(ch,index) in commentDetail.child" class="main-comment">
              <div class="item-header">
                <div class="flex-all-center">
                  <el-image class="comment-item-avatar" style="border-radius: 50%"
                            :src="ch.avatar"></el-image>
                  <span class="comment-item-name">{{ ch.username }}</span>
                  <span v-if="ch.user_id === user.id" class="tag">楼主</span>
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
.main-container {
  height: 100vh;
  width: 99%;
}

.main-container .mask {
  position: fixed;
  top: 60px;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100vw;
  height: calc(100vh - 60px);
  z-index: 0;
  background-color: #f7f8fa;
}

.flex {
  display: flex;
}

.main-content-container {
  height: 100%;
  width: 1208px;
  position: relative;
  justify-content: center;
  align-items: center;
  z-index: 0;
  margin: 10px auto 0;
}

.main-box {
  position: relative;
  justify-content: center;
  //align-items: center;
}

.aside-section {
  position: sticky;
  height: 100vh;
  left: 0;
  top: 76px;
  bottom: 0;
}

.aside-section .post-state-section {
  padding-top: 56px;
  text-align: center;
  z-index: 10;
  user-select: none;
  margin-right: 20px;
}

.post-state-section .item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 20px;
  cursor: pointer;
  width: 54px;
  height: 54px;
  border: 1px solid #edeff5;
  border-radius: 100%;
  background-color: #fff;
}

.item svg {
  width: 32px;
  height: 32px;
}


.post-main-container {
  z-index: 0;
  height: 100%;
}

.detail-container {
  width: 740px;
  position: relative;
  border-radius: 8px;
}

.post-detail {
  padding: 32px 32px 25px;
  background-color: #fff;
  border-radius: 8px;
}

.post-title-container {
  border-bottom: 1px solid #edeff5;
  margin-bottom: 16px;
  box-sizing: border-box;
  list-style: none;
  padding: 0;
}

.post-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.post-create-time {
  color: #aeb6c2;
  font-weight: 400;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 22px;
}

.post-content {
  margin-bottom: 22px;
}

.article {
  font-size: 16px;
  line-height: 32px;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #aeb6c2;
  font-weight: 400;
  font-size: 14px;
}

.article >>> img {
  width: 100%;
  cursor: pointer;
}

.article >>> p {
  font-size: 15px;
  font-weight: 340;
}


.aside-box {
  min-height: min(100vh - 60px - 18px - 24px, 100%);
  height: 100%;
  position: sticky;
  top: 76px;
  width: 304px;
  z-index: 0;
}

.inside-box {
  margin-left: 10px;
}

.aside-box-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.aside-box-section:not(:last-child) {
  margin-bottom: 12px;
}

.aside-box-userInfo {

}

.info-avatar {
  width: 48px;
  height: 48px;
  min-width: 48px;
  position: relative;
  margin-right: 16px;
}

.info-avatar >>> img {
  width: 100%;
  height: auto;
  background: #f3f3f3;
  background-size: 100% 100%;
  font-size: 12px;
  border-radius: 100%;
  object-fit: cover;
  cursor: pointer;
}

.userinfo-name {
  font-weight: 700;
  max-width: 180px;
  font-size: 14px;
  line-height: 22px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 20px;
  cursor: pointer;
}

.userinfo-uid {
  font-weight: 400;
  color: #8c95a3;
  font-size: 14px;
  line-height: 22px;
  margin-bottom: 10px;
}

.aside-box-userdata {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #8c95a3;
  margin-bottom: 12px;
  margin-top: 20px;
  background: #f7f8fa;
  border-radius: 10px;
}

.aside-box-userdata .item .number {
  font-weight: 700;
  color: #292B2F;
}

.aside-box-userdata .item {
  cursor: pointer;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-bottom: 10px;
}

.aside-box-userdata .item .number:hover {
  color: #32b2b5;
}

.aside-box-usersignature {
  font-weight: 400;
  color: #aeb6c2;
  font-size: 14px;
  line-height: 22px;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 10px;
}

.section-box {
  font-size: 14px;
  line-height: 22px;
  color: #8c95a3;
  font-weight: 400;
  padding: 5px 12px;
  background: #f7f8fa;
  border-radius: 4px;
  cursor: pointer;
}

.section-box:hover {
  color: #32b2b5;
}

.comment-detail {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 48px;
  margin-top: 12px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #edeff5;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  overflow: hidden;
  align-items: center;
}

ul {
  list-style: none;
  magin: 0;
  padding: 0;
}

.filter-section {
  display: flex;
  align-items: center;
  font-size: 20px;
  line-height: 30px;
  color: #8c95a3;
  background-color: #fff;
  padding: 20px 24px;
}

.filter-section .item {
  margin-right: 32px;
  font-size: 18px;
  line-height: 26px;
  cursor: pointer;
}

.filter-section .active {
  position: relative;
  color: #292B2F;
  font-weight: 900;
}

.filter-section .active::after {
  position: absolute;
  top: 42px;
  left: 50%;
  transform: translate(-50%);
  display: block;
  content: "";
  width: 36px;
  height: 4px;
  background-color: #1E7DFA;
}

.dropdown-list {
  display: flex;
  margin-right: 32px;
}

.dropdown-list li {
  display: flex;
  align-items: center;
}

.dropdown-list li:not(:last-child):after {
  display: block;
  content: "";
  width: 1px;
  height: 12px;
  background-color: #d9d9d9;
  margin: 0 20px;
}

.dropdown-list li.active .btn {
  color: #333333;
  font-size: 16px;
  line-height: 24px;
}

.dropdown-list li .btn {
  color: #8c95a3;
  background: initial;
  padding: 0;
}

.btn {
  font-size: 14px;
  line-height: 22px;
  font-weight: 500;
  color: #393f4d;
  background: #f3f6f8;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  outline: none;
  border: none;
}

.comment-box {
  padding-left: 32px;
  padding-right: 32px;
  padding-top: 20px;
  padding-bottom: 20px;
}

.comment-add {
  position: relative;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  background: #f7f8fa;
  border-radius: 8px;
  //cursor: pointer;
  margin-bottom: 16px;
}

.comment-list {
  position: relative;
  height: 100%;
  background-color: #ffffff;
  border-radius: 8px;
  min-height: 284px;
}

.no-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.no-content .no-content-image {
  width: 195px;
  height: 168px;
  margin-bottom: 24px;
}

.no-content-txt {
  font-weight: 400;
  color: #aeb6c2;
  font-size: 14px;
  line-height: 22px;
}

.comment-item:not(:last-child) {
  padding-bottom: 16px;
  border-bottom: 1px solid #edeff5;
  margin-bottom: 16px;
}

.main-comment {

}

.comment-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.flex-all-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.comment-item-avatar {
  width: 40px;
  height: 40px;
  min-width: 40px;
  position: relative;
  margin-right: 16px;
}

.comment-item-name {
  font-weight: 400;
  color: #8c95a3;
  font-size: 14px;
  line-height: 22px;
}

.comment-avatar {
  width: 100%;
  height: auto;
  background: #f3f3f3;
  background-size: 100% 100%;
  font-size: 12px;
  border-radius: 100%;
  object-fit: cover;
  cursor: pointer;
}

.comment-item-content {
  font-weight: 400;
  color: #292B2F;
  font-size: 15px;
  line-height: 24px;
  margin-bottom: 12px;
  border-left: 1px solid #edeff5;
}

.ml-56 {
  margin-left: 56px;
}

.comment-item-footer {
  margin-left: 54px;
  align-items: center;
  justify-content: space-between;
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

.comment-in-section {
  margin-left: 54px;
  margin-top: 20px;
}

.mt-20 {
  mrgin-top: 20px;
}

.comment-in-section .count {
  font-weight: 400;
  color: #1db5b8;
  cursor: pointer;
  font-size: 14px;
  line-height: 22px;
}

.comment-in-item {
  margin-bottom: 20px;
}

.comment-in-item-content {
  //cursor: pointer;
}

.comment-in-item-footer {
  align-items: center;
  justify-content: space-between;
}

.comment-in-item-time {
  font-weight: 400;
  color: #aeb6c2;
  font-size: 13px;
  line-height: 21px;
}

.txt-overflow-ellipsis-2 {
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mb-4 {
  margin-bottom: 4px;
}

.txt {
  font-weight: 400;
  color: #586370;
}

.text-14 {
  font-size: 14px;
  line-height: 22px;
}

.comment-in-item .name {
  font-weight: 500;
  color: #1db5b8;
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
</style>