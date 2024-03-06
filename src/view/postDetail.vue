<script>
export default {
  name: "postDetail",
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
        create_time: ''
      },
      comments: [],
      section: '',
      isLike: false,
      isCollect: false
    }
  },
  created() {
    console.log(this.$route.params.id)
    this.$axios.get(`/post/${this.$route.params.id}`).then(res => {
      if (res.data.code === 0) {
        this.post = res.data.data.post
        if (res.data.data.comments !== null) {
          this.comments = res.data.data.comments
        }
        this.section = res.data.data.section
      } else {
        this.$message.error('帖子不存在')
      }
    }).catch(() => {

    })
  },
  methods: {
    handleCollect() {
      this.isCollect = !this.isCollect
      if (this.isCollect) {
        this.post.collect_count++
      } else {
        this.post.collect_count--
      }
      // TODO 处理收藏
    },
    handleLike() {
      this.isLike = !this.isLike
      if (this.isLike) {
        this.post.like_count++
      } else {
        this.post.like_count--
      }
      // TODO 处理点赞
    }
  }
}
</script>

<template>
  <div class="main-container">
    <div class="mask"></div>
    <div class="main-content-container">
      <div class="main-box flex">
        <div class="aside-section">
          <div class="post-state-section">
            <div class="item">
              <el-badge type="info" :value="comments.length">
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
                  <div class="post-create-time flex">{{ '文章发布时间 ' + post.create_time }}</div>
                </div>
                <div class="post-content">
                  <div class="article" v-html="post.content">
                  </div>
                </div>
                <div class="post-footer">
                  阅读次数：{{ post.view_count }}
                </div>
              </div>
              <div class="comment-detail">
                <div class="comment-header"></div>
                <div class="comment-box">
                  <div class=""></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="aside-box"></div>
      </div>
    </div>
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


.aside-box {
  min-height: min(100vh - 60px - 18px - 24px, 100%);
  height: 100%;
  position: sticky;
  top: 76px;
  width: 304px;
  z-index: 0;
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
</style>