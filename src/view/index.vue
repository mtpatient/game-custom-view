<script>
import Post from "@/components/post.vue";
import {debounce} from "@/js/util";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'index',
  components: {Post},
  data() {
    return {
      backImg: require("../assets/pns-bg-GELQYdT2.png"),
      slideImg: [
        {
          id: 0,
          url: `https://game-custom-1312933264.cos.ap-guangzhou.myqcloud.com/img/2024-03-06/1a0j2908k00czmbuq6694u4900l61xj6`,
          post_id: 13
        },
        {
          id: 1,
          url: `https://game-custom-1312933264.cos.ap-guangzhou.myqcloud.com/img/2024-03-06/1a0j2908k00czmbvwzkjyrwc008a3a7g`,
          post_id: 17
        },
        {
          id: 3,
          url: `https://game-custom-1312933264.cos.ap-guangzhou.myqcloud.com/img/2024-03-18/x584fc0ic80czwq3wu92yuk1002br2bl`,
          post_id: 20,
        },
        {
          id: 4,
          url: 'https://game-custom-1312933264.cos.ap-guangzhou.myqcloud.com/img/2024-03-18/x584fc0ic80czwq3wu92yuk200jxeozx',
          post_id: 14
        }
      ],
      topPosts: [],
      posts: [],
      section: 0, // 0 推荐； 1 关注； 2 板块
      params: {
        id: 0,// section id
        page_size: 5,
        page_index: 1,
        showType: 1,
      },
      loading: false,
      end: false,
      sections: [],
      scroller: null,
    }
  },
  methods: {
    getPosts() {
      if (this.section === 1) {
        this.$axios.post('/post/follow', this.params).then(res => {
          if (res.data.code === 0) {
            const posts = res.data.data.posts
            if (posts != null) {
              this.posts.push(...posts)
              this.end = posts.length < this.params.page_size
            } else {
              this.end = true
            }
          }
        }).catch(err => {
          console.log(err)
        })
      } else {
        this.$axios.post('/post/list', this.params).then(res => {
          if (res.data.code === 0) {
            const posts = res.data.data.posts
            if (posts != null) {
              this.posts.push(...posts)
              this.end = posts.length < this.params.page_size
            } else {
              this.end = true
            }
          }
        }).catch(err => {
          console.log(err)
        })
      }
    },
    ToPostDetail(id) {
      const page = this.$router.resolve({
        path: `/post-detail/${id}`,
      })
      window.open(page.href, '_blank')
    },
    getFollow() {
      console.log('get follow')
      const user = this.$storage.get('user')
      if (user === null || user === undefined) {
        this.$message.error('请先登录')
        this.$router.push('/login')
        return
      }
      this.section = 1
      this.change()
    },
    getRecommend() {
      console.log('get recommend')
      this.section = 0
      this.params.id = 0
      this.change()
    },
    getSection(id) {
      console.log(id)
      this.section = 2
      this.params.id = id
      this.getTopPosts()
      this.change()
    },
    handleDefault() {
      const defaultLi = this.$refs.default
      const newLi = this.$refs.new
      if (!defaultLi.classList.contains('active')) {
        defaultLi.classList.add('active')
        newLi.classList.remove('active')
      }
      this.params.showType = 1
      this.change()
    },
    handleNew() {
      const defaultLi = this.$refs.default
      const newLi = this.$refs.new
      if (!newLi.classList.contains('active')) {
        newLi.classList.add('active')
        defaultLi.classList.remove('active')
      }
      this.params.showType = 2
      this.change()
    },
    getTopPosts() {
      this.$axios.get(`/post/top/${this.params.id}`).then(res => {
        if (res.data.code === 0) {
          this.topPosts = res.data.data.posts
        }
      }).catch(err => {
        console.log(err)
      })
    },
    change() {
      this.end = false
      this.params.page_index = 1
      this.posts = []
      this.getPosts()
    },
    handleScroll() {
      // 获取页面的滚动位置
      const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

      // 获取页面高度
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 检查是否滚动到页面底部
      if (scrollPosition + windowHeight >= documentHeight && !this.end) {
        // 触发函数
        this.params.page_index++
        this.getPosts()
        this.loading = false
      }
    },
  },
  created() {
    this.getRecommend()
    this.$axios.get('/section/all').then(res => {
      if (res.data.code === 0) {
        this.sections = res.data.data.sections
      }
    }).catch(err => {
      console.log(err)
    })
  },
  mounted() {
    this.$once('hook:updated', () => {
      const lis = document.querySelectorAll('.menu-item')
      lis.forEach(item => {
        // console.log(item)
        item.addEventListener('click', () => {
              for (let i = 0; i < lis.length; i++) {
                lis[i].classList.remove('active')
              }
              item.classList.add('active')
              const v = item.getAttribute('value')
              if (v === 'recommend') {
                this.getRecommend()
              } else if (v === 'follow') {
                this.getFollow()
              } else {
                this.getSection(item.value)
              }
            }
        )
      })
    })
    this.$nextTick(() => {
      this.scroller = debounce(() => {
        this.loading = !this.end;
      }, this.handleScroll, 200)
      window.addEventListener('scroll', this.scroller)
    })
  },
  updated() {
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.scroller)
  }
}
</script>

<template>
  <div class="main-container">
    <el-image class="back_img" :src="backImg"></el-image>
    <div class="main-container-section">
      <div class="main-box flex">
        <div class="aside-left">
          <div class="section-ul">
            <div class="logo-section">
              <el-image :src="require('@/assets/logo.png')"></el-image>
            </div>
            <ul>
              <li class="menu-item" value="follow">
                <div class="flex-vertical-center">
                  <el-image class="menu-item-icon" :src="require('@/assets/icon/follow.jpg')">
                  </el-image>
                  <span class="menu-item-title">关注</span>
                </div>
              </li>
              <li class="menu-item active" value="recommend">
                <div class="flex-vertical-center">
                  <el-image class="menu-item-icon" :src="require('@/assets/icon/recommend.jpg')">
                  </el-image>
                  <span class="menu-item-title">推荐</span>
                </div>
              </li>
              <li class="menu-item" :value="s.id"
                  v-for="s in sections" :key="s.id">
                <div class="flex-vertical-center">
                  <el-image class="menu-item-icon" :src="s.icon">
                  </el-image>
                  <span class="menu-item-title">{{ s.name }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="flex">
          <div class="main-section">
            <div class="main-content-section">
              <div class="header" v-if="section === 1">我的关注</div>
              <div v-if="section !== 1" class="slideshow">
                <el-carousel :interval="5000"
                             indicator-position="outside"
                             trigger="hover"
                             type="card" height="200px">
                  <el-carousel-item height="300px" v-for="item in slideImg" :key="item.id">
                    <el-image @click="ToPostDetail(item.post_id)" :src="item.url" fit="cover"
                              class="carousel-img"></el-image>
                  </el-carousel-item>
                </el-carousel>
              </div>
              <ul v-if="section === 2 && topPosts != null" class="top-posts">
                <li class="top-post pointer" @click="ToPostDetail(item.id)"
                    v-for="item in topPosts" :key="item.id">
                  <div class="name-section">
                    <span class="tag">置顶</span>
                    <div class="top-post-title">{{ item.title }}</div>
                  </div>
                </li>
              </ul>
              <ul v-if="section === 2" class="filter-section">
                <li ref="default" @click="handleDefault" class="item pointer active">默认</li>
                <!--                <li class="item pointer">最多浏览</li>-->
                <li ref="new" @click="handleNew" class="item pointer">最新发布</li>
              </ul>
              <ul class="post-list">
                <li class="item" v-for="p in posts" :key="p.id">
                  <post :on-post="false" :post="p" :is-user="false"></post>
                </li>
              </ul>
              <p class="end" v-if="posts.length && loading">- 加载中 -</p>
              <p class="end" v-if="posts.length && end">- 暂无更多内容 -</p>
            </div>
          </div>
        </div>
        <!--        TODO 搜索历史，搜索排行榜显示-->
<!--        <div class="aide-right">-->
<!--          <div class="inside-box">-->
<!--            <div class="item"></div>-->
<!--          </div>-->
<!--        </div>-->
      </div>
    </div>
  </div>
</template>

<style scoped>
.back_img {
  position: fixed;
  top: 60px;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100vw;
  height: calc(100vh - 60px);
  background-color: #f7f8fa;
  object-fit: cover;
  z-index: -1;
  background-position: center;
  background-size: cover;
}

.flex {
  display: flex;
}

.main-container {
  height: 100vh;
  width: 99%;
}

.main-container-section {
  height: 100%;
  width: 1208px;
  margin: 0 auto;
  position: relative;
  justify-content: center;
  z-index: 0;
}

.main-box {
  position: relative;
  justify-content: center;
}

.aside-left {
  position: sticky;
  height: 100vh;
  left: 0;
  top: 76px;
  bottom: 0;
}

.aide-right {
  min-height: min(100vh - 60px - 18px - 24px, 100%);
  height: 100%;
  position: sticky;
  top: 76px;
  width: 304px;
  z-index: 0;
}

.section-ul {
  width: 220px;
  padding: 24px 12px;
  background-color: #fff;
  text-align: center;
  border-radius: 8px;
  min-height: calc(100vh - 102px);
  margin-right: 12px;
}

.main-section {
  z-index: 0;
  height: 100%;
  margin-right: 12px;
}

.main-content-section {
  width: 640px;
  min-height: 100vh;
  border-radius: 8px;
  padding-bottom: 20px;
}

.inside-box .item {
  width: 100%;
  height: 50px;
  background-color: #fff;
  border-radius: 8px;
}

.slideshow {
  top: 20px;
  position: relative;
  margin-bottom: 24px;
}

.carousel-img {
  border-radius: 8px;
}

.logo-section {
  margin-bottom: 24px;
  height: 36px;
}

.logo-section >>> img {
  height: 36px;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  text-align: left;
}

.menu-item:not(:last-child) {
  margin-bottom: 8px;
}

.menu-item {
  padding: 8px 32px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 18px;
  line-height: 24px;
  font-weight: 500;
}

.flex-vertical-center {
  display: flex;
  align-items: center;
}

.menu-item-icon {
  height: 42px;
  width: 42px;
  margin-right: 12px;
  opacity: 0.6;
}

.menu-item-title {
  font-weight: 500;
  font-size: 16px;
  color: #aeb6c2;
}

.active .menu-item-title {
  color: #409EFF;
}

.active .menu-item-icon {
  opacity: 1;
}

.top-posts {
  background: #fff;
  border-radius: 8px;
  padding: 10px 24px;
  //min-height: 64px;
  margin-bottom: 12px;
}

.filter-section {
  display: flex;
  align-items: center;
  //font-size: 14px;
  line-height: 30px;
  color: #8c95a3;
  background-color: #fff;
  height: 66px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-weight: 500;
}

.pointer {
  cursor: pointer;
}

.top-posts .top-post:not(:last-child) {
  margin-bottom: 12px;
}

.top-posts .name-section {
  display: flex;
  align-items: center;
  flex: 1;
}

.top-post .tag {
  font-weight: 500;
  display: block;
  padding: 1px 10px;
  border-radius: 4px;
  color: #fff;
  background: #bda757;
  font-size: 14px;
  line-height: 22px;
  margin-right: 12px;
}

.top-post .top-post-title {
  font-weight: 500;
  color: #393f4d;
  font-size: 15px;
  line-height: 24px;
}

.top-post .top-post-title:hover {
  color: #1db5b8;
}

.filter-section .item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  height: 100%;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
}

.filter-section .active {
  position: relative;
  color: #292b2f;
  font-weight: 900;
}

.filter-section .active:after {
  position: absolute;
  top: 62px;
  left: 50%;
  transform: translate(-50%);
  display: block;
  content: "";
  width: 36px;
  height: 4px;
  background-color: #409EFF;
}

.post-list {
  margin-top: 12px;
}

.post-list .item {
  padding: 10px;
  border-radius: 8px;
  background-color: #fff;
}

.post-list .item:not(:last-child) {
  margin-bottom: 12px;
}

.end {
  text-align: center;
  font-weight: 400;
  color: #8c95a3;
  font-size: 14px;
  line-height: 22px;
  padding-top: 12px;
  padding-bottom: 12px;
}

.header {
  padding: 20px 24px;
  background-color: #fff;
  border-radius: 8px;
  font-weight: 700;
  font-size: 18px;
  line-height: 24px;
  margin: 16px 0 12px;
}
</style>