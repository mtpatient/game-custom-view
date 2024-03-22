<script>
import Post from "@/components/post.vue";
import {debounce} from "@/js/util";
import user from "@/router/user";
import SearchHistory from "@/components/SearchHistory.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "search",
  components: {SearchHistory, Post},
  data() {
    return {
      backImg: require("../assets/pns-bg-GELQYdT2.png"),
      posts: [],
      users: [],
      loading: false,
      post_end: false,
      user_end: false,
      scroller: null,
      search: '',
      params: {
        key: `${this.$route.query.q}`,
        page_index: 1,
        page_size: 5,
        showType: 1,
      },
      params_u: {
        keyword: `${this.$route.query.q}`,
        page_index: 1,
        page_size: 20,
      },
      show: '热门',
      section: 1,// 1：帖子 2：用户
    }
  },
  created() {
    this.handelAddHistory()
    console.log(this.$route.query.q)
    if (this.$route.query.q !== null && this.$route.query.q !== undefined
        && this.$route.query.q !== '') {
      this.search = this.$route.query.q
      this.getData()
    } else {
      this.$message.error('搜索内容不能为空')
    }
  },
  methods: {
    user() {
      return user
    },
    handleShow(show) {
      if (show === '热门') {
        this.params.showType = 1
        this.show = '热门'
      } else if (show === '最新') {
        this.params.showType = 2
        this.show = '最新'
      } else {
        console.log('参数错误')
      }
      this.params.page_index = 1
      this.post_end = false
      this.posts = []
      this.getData()
    },
    getData() {
      if (this.section === 1) {
        this.$axios.post('/post/search', this.params).then(res => {
          const posts = res.data.data.posts
          if (posts != null) {
            this.posts.push(...posts)
            this.post_end = posts.length < this.params.page_size
          } else {
            this.post_end = true
          }
        }).catch(err => {
          console.log(err)
        })
      } else if (this.section === 2) {
        this.$axios.post('/user/search', this.params_u).then(res => {
          if (res.data.code === 0) {
            const users = res.data.data.users
            if (users != null) {
              this.users.push(...users)
              this.user_end = users.length < this.params_u.page_size
            } else {
              this.user_end = true
            }
          }
        }).catch(err => {
          console.log(err)
        })
      }
    },
    handleScroll() {
      // 获取页面的滚动位置
      const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

      // 获取页面高度
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 检查是否滚动到页面底部
      if (scrollPosition + windowHeight >= documentHeight) {
        // 触发函数
        if (this.section === 1 && !this.post_end) {
          this.params.page_index++
          this.getData()
          // this.loading = false
        } else if (this.section === 2 && !this.user_end) {
          this.params_u.page_index++
          this.getData()

        }
        this.loading = false
      }
    },
    handlePost() {
      const post = this.$refs.post
      const user = this.$refs.user
      if (!post.classList.contains('active')) {
        post.classList.add('active')
      }
      if (user.classList.contains('active')) {
        user.classList.remove('active')
      }
      this.section = 1
      this.params.page_index = 1
      this.posts = []
      this.post_end = false
      this.getData()
    },
    handleUser() {
      const post = this.$refs.post
      const user = this.$refs.user
      if (!user.classList.contains('active')) {
        user.classList.add('active')
      }
      if (post.classList.contains('active')) {
        post.classList.remove('active')
      }
      this.section = 2
      this.params_u.page_index = 1
      this.users = []
      this.user_end = false
      this.getData()
    },
    handleFollow(f) {
      // console.log(f)
      if (f.is_follow === 0) {
        this.$axios.post(`/user/follow`, {
          id: f.id,
          operate: 1,
        }).then(res => {
          if (res.data.code === 0) {
            f.is_follow = 1
            // this.$emit('change', 'follow', 1)
            this.$message.success('关注成功')
          } else {
            this.$message.error(res.data.msg)
          }
        })

      } else if (f.is_follow === 1) {
        this.$confirm('确定取消关注该用户吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(() => {
          this.$axios.post(`/user/follow`, {
            id: f.id,
            operate: 2,
          }).then(res => {
            if (res.data.code === 0) {
              f.is_follow = 0
              // this.$emit('change', 'follow', -1)
            } else {
              this.$message.error(res.data.msg)
            }
          })
        }).catch((err) => {
          console.log(err)
        })
      } else {
        this.$message.error('未知错误')
      }
    },
    toUserDetail(id) {
      const page = this.$router.resolve({
        path: `/person-center/post`,
        query: {
          id: id
        }
      })
      window.open(page.href, '_blank')
    },
    handleSearchHistory(q) {
      this.$router.push({
        path: '/search',
        query: {
          q: q
        }
      })
      this.$router.go(0)
    },
    handelAddHistory() {
      let search_history = this.$storage.get('search_history')
      if (search_history === null || search_history === undefined) {
        search_history = [`${this.$route.query.q}`]
      } else {
        const index = search_history.indexOf(this.$route.query.q)
        if (index > -1) {
          search_history.splice(index, 1)
        }
        search_history.unshift(this.$route.query.q)
      }
      this.$storage.set('search_history', search_history)
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.scroller = debounce(() => {
        if (this.section === 1) {
          this.loading = !this.post_end;
        } else if (this.section === 2) {
          this.loading = !this.user_end;
        }
      }, this.handleScroll, 200)
      window.addEventListener('scroll', this.scroller)
    })
  },
  updated() {
    this.handelAddHistory()
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
        <!--        <div class="aside-left">-->
        <!--          <div class="section-ul"></div>-->
        <!--        </div>-->
        <div class="flex">
          <div class="main-section">
            <div class="main-content-section">
              <div class="section">
                <ul class="filter-section">
                  <li ref="post" @click="handlePost" class="item pointer active">帖子</li>
                  <li ref="user" @click="handleUser" class="item pointer">用户</li>
                </ul>
                <el-dropdown v-if="section === 1">
                  <!--                  TODO 优化按钮显示-->
                  <el-button style="margin-right: 10px" type="info" size="mini">{{ show }}</el-button>
                  <el-dropdown-menu>
                    <el-dropdown-item @click.native="handleShow('热门')">热门</el-dropdown-item>
                    <el-dropdown-item @click.native="handleShow('最新')">最新</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
              <p class="tip">搜索“{{ search }}”, 结果如下：</p>
              <div style="position: relative; width: 640px">
                <ul v-if="section === 1" class="post-list">
                  <li class="item" v-for="p in posts" :key="p.id">
                    <post :on-post="false" :post="p" :is-user="false"></post>
                  </li>
                </ul>
                <ul v-if="section === 2" class="user-list">
                  <li class="item" v-for="u in users" :key="u.id">
                    <div class="user-item-content">
                      <div class="info-section flex">
                        <div class="avatar-box" @click="toUserDetail(u.id)">
                          <el-image class="avatar" :src="u.avatar"></el-image>
                        </div>
                        <div class="info-content">
                          <p class="name txt-overflow-ellipsis-1">{{ u.username }}</p>
                          <p class="signature txt-overflow-ellipsis-1">{{
                              u.signature === '' ? '该用户很懒，还没有签名~' : u.signature
                            }}</p>
                        </div>
                      </div>
                      <el-button @click="handleFollow(u)" class="button" v-if="!u.is_follow" type="primary" size="mini">
                        关注
                      </el-button>
                      <el-button @click="handleFollow(u)" class="button" v-else type="info" size="mini">已关注
                      </el-button>
                    </div>
                  </li>
                </ul>
              </div>
              <p class="end" v-if="((posts.length && section === 1) || (section === 2 && users.length)) && loading">-
                加载中
                -</p>
              <p class="end"
                 v-if="(posts.length && section === 1 && post_end) || (section === 2 && users.length && user_end)">-
                暂无更多内容
                -</p>
              <div v-if="(!posts.length && section === 1) || (section === 2 && !users.length)"
                   class="no-content-box">
                <div class="no-content">
                  <el-image style="margin-bottom: 24px;height: 168px;width: 195px"
                            :src="require('@/assets/no-content.png')"></el-image>
                  <span style="font-weight: 400;
                  color: #aeb6c2;font-size: 14px;
                  line-height: 22px;">- 没有搜索到结果，请重新搜索 -</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="aside-right">
          <div class="inside-box">
            <div class="item">
              <SearchHistory @search="handleSearchHistory"></SearchHistory>
            </div>
          </div>
        </div>
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

.aside-right {
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
  width: 300px;
  height: auto;
  background-color: #fff;
  border-radius: 8px;
}

.section {
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  height: 46px;
  border-radius: 8px;
  margin-bottom: 8px;
  margin-top: 16px;
  font-weight: 500;
  align-items: center;
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
  top: 32px;
  left: 50%;
  transform: translate(-50%);
  display: block;
  content: "";
  width: 36px;
  height: 4px;
  background-color: #409EFF;
}

.filter-section {
  display: flex;
  align-items: center;
  line-height: 30px;
  color: #8c95a3;
}

.pointer {
  cursor: pointer;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
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

.tip {
  font-weight: 400;
  color: #aeb6c2;
  font-size: 14px;
  line-height: 22px;
  margin-bottom: 12px;
  padding-left: 24px;
}

.no-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  word-break: break-word;
}

.no-content-box {
  width: 100%;
  height: 600px;
  background-color: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  width: 640px;
}

.user-list .item {
  background-color: #fff;
  //padding: 20px 24px 12px;
  border-radius: 8px;
  box-sizing: border-box;
}

.user-list .item:not(:last-child) {
  margin-bottom: 0;
}

.user-item-content {
  width: 316px;
  height: 80px;
  border-radius: 8px;
  //background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
}

.avatar-box {
  width: 40px;
  height: 40px;
  min-width: 40px;
  position: relative;
  margin-right: 8px;
}

.avatar-box .avatar {
  width: 100%;
  height: auto;
  background: #f3f3f3;
  background-size: 100% 100%;
  font-size: 12px;
  border-radius: 100%;
  object-fit: cover;
  cursor: pointer;
}

.flex {
  display: flex;
}

.txt-overflow-ellipsis-1 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-content .name {
  font-size: 16px;
  font-weight: 500;
  color: #393f4d;
  width: 144px;
  line-height: 20px;
  margin-bottom: 0;
}

.info-content .signature {
  width: 144px;
  font-weight: 400;
  color: #aeb6c2;
  font-size: 12px;
  line-height: 20px;
  margin-top: 0;
}

.user-item-content .button {
  margin-right: 10px;
}


</style>