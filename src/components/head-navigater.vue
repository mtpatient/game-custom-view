<script>
export default {
  name: "head_navigate",
  data() {
    return {
      searchText: '',
      notice: 'new',
      // avatar_ulr: 'https://prod-alicdn-community.kurobbs.com/headCode/RoleHeadR4Bianka.png',
      default_avatar: this.Default_Avatar,
      notices: [
        //   0：网站通知；1：回复我的；2：给我点赞的；3：@我的
        // TODO 获取通知消息并赋值
        {
          label: '通知', value: 0, count: '0'
        },
        {
          label: '评论', value: 1, count: '0'
        },
        {
          label: '点赞', value: 2, count: '0'
        },
        {
          label: '@我', value: 3, count: '0'
        }
      ],
      is_login: false,
      user: {
        id: 0,
        username: '',
        avatar: ''
      },
      logo: require('@/assets/logo.png')
    }
  },
  beforeCreate() {
  },
  created() {
    this.getUserInfoFromStorage()
  },
  mounted() {
    // 解决localstorage同步问题
    window.addEventListener('storage', () => {
      // console.log('update from storage')
      this.getUserInfoFromStorage()
    })
    // 动态更新用户信息
    this.$EventBus.$on('user_update', () => {
      // console.log('update from api')
      const uid = this.$storage.get('user').id
      if (uid === undefined || uid === null) {
        return
      }
      this.$axios.get(`/user/${uid}`).then(res => {
        if (res.data.code === 0) {
          this.user = res.data.data.user
          this.is_login = true
          this.$storage.set('user', this.user, this.ExpireTime)
        } else {
          this.$message.error('服务错误')
        }
      }).catch((reason) => {
        console.log(reason)
      })
    })
  },
  watch: {},
  methods: {
    // TODO 处理搜索
    handleSearch() {

    }
    ,
    handleNotice(value) {
      // TODO 进入通知页面
      console.log(value)
    }
    ,
    handleToUserDetail() {
      let page = this.$router.resolve({
        path: '/person-center/post',
        query: {id: this.user.id}
      })
      window.open(page.href, '_blank')
    }
    ,
    handelLogout() {
      this.$confirm('确定要退出吗？', '提示！', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(() => {
        this.$axios.get('/user/logout').then((res) => {
          if (res.data.code === 0) {
            this.is_login = false
            this.$storage.remove('token')
            this.$storage.remove('user')

            this.getUserInfoFromStorage()

            this.$router.push('/')
          } else {
            this.$message({
              message: '服务错误，登出失败！',
              type: "error"
            })
          }
        })
      }).catch(() => {

      })
    }
    ,
    handelToLogin() {
      this.$router.push('/login')
    },
    handelToEdit() {
      this.$axios.get('/user/is_login').then((res) => {
        if (res.data.data.is_login) {
          let page = this.$router.resolve({
            path: '/edit'
          })
          window.open(page.href, '_blank')
        } else {
          this.$storage.remove('token')
          this.$storage.remove('user')
          this.$router.push('/login')
          this.$message({
            message: '请先登录！',
            type: 'error'
          })
        }
      }).catch(() => {

      })
    },
    getUserInfoFromStorage() {
      const token = this.$storage.get('token')
      const user = this.$storage.get("user")
      if (user === null || token === null ||
          user === undefined || token === undefined) {
        console.log('token不存在或过期')
        this.is_login = false
        return
      }

      this.user = user
      this.is_login = true
    },
    handelAvatarError() {
      return true
    }
  }
}
</script>

<template>
  <div class="header flex-all-center">
    <!--    logo-->
    <img class="pns" @click="$router.push('/')"
         :src="logo"
         alt="战双帕弥什">
    <!--    搜索框-->
    <div class="search_container">
      <el-popover
          placement="bottom"
          width="400"
          trigger="click">
        <!--        TODO 搜索排行, 近期搜索-->
        <el-input slot="reference" placeholder="Search" v-model="searchText" class="search">
          <i slot="suffix"
             class="el-icon-search handleSearch"
             @click="handleSearch"></i>
        </el-input>
      </el-popover>
    </div>
    <!--    发布按钮-->
    <el-button @click="handelToEdit"
               style="margin-left: 20px" icon="el-icon-edit" type="primary">
      发布
    </el-button>
    <!--    通知按钮-->
    <div class="notice_container" v-if="is_login">
      <el-dropdown trigger="click">
        <el-badge :value="notice">
          <el-button icon="el-icon-bell" circle></el-button>
        </el-badge>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="n in notices"
                            style="width: 100px;position: relative;"
                            :key="n.value" @click="handleNotice(n.value)">
            {{ n.label }}
            <el-badge class="mask" :value="n.count"
                      style="position: absolute;right: 10px;top: 6px"></el-badge>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!--    头像：已登录-->
    <div class="avatar_container" v-if="is_login" @click="handleToUserDetail">
      <el-popover placement="bottom" width="160px" trigger="hover">
        <div class="avatar_box">
          <span class="userInfo">
            <el-avatar slot="reference" :size="50" :src="user.avatar" @error="handelAvatarError">
              <img :src="require('@/assets/defalut_avatar.png')"/>
            </el-avatar>
            <span class="userInfo_inbox">
              <span style="font-size: 16px; color:  #292B2F; font-weight: 700">{{ user.username }}</span>
              <span style="font-size: 12px;color: #cccccc">UID: {{ 10000000 + user.id }}</span>
            </span>
          </span>
          <div @click="handleToUserDetail">
            <svg t="1707223283427" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                 p-id="6390" width="200" height="200">
              <path
                  d="M512 74.666667c241.536 0 437.333333 195.797333 437.333333
                  437.333333S753.536 949.333333 512 949.333333 74.666667 753.536
                   74.666667 512 270.464 74.666667 512 74.666667z m0 64C305.813333
                   138.666667 138.666667 305.813333 138.666667 512S305.813333
                   885.333333 512 885.333333 885.333333 718.186667 885.333333 512
                   718.186667 138.666667 512 138.666667z m138.666667 170.666666a32
                   32 0 0 1 31.850666 28.928L682.666667 341.333333v106.666667a32 32
                   0 0 1-63.850667 3.072L618.666667 448v-106.666667a32 32 0 0 1
                   32-32z m-277.333334 0a32 32 0 0 1 31.850667 28.928L405.333333
                   341.333333v106.666667a32 32 0 0 1-63.850666 3.072L341.333333
                   448v-106.666667a32 32 0 0 1 32-32z"
                  fill="#8a8a8a" p-id="6391"></path>
            </svg>
            <span>个人中心</span>
          </div>
          <hr style="color: #cccccc"/>
          <div @click="handelLogout">
            <svg t="1707222561128" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                 p-id="5220" width="200" height="200">
              <path
                  d="M570.10688 47.2576H453.90336v525.52192h116.1984V47.2576z
                  m208.86016 86.8864L697.6512 214.9376c92.87168 63.45728 162.42688
                  173.14304 162.42688 300.05248 0 190.47936-156.544 346.28608-348.17536
                  346.28608-191.42656 0-348.17536-155.80672-348.17536-346.28608
                  0-126.90944 69.76-236.5952 168.30976-294.27712L245.0432
                  134.144C129.05472 220.71296 47.73376 359.18848 47.73376
                  514.99008c0 254.03904 209.0752 461.75232 464.16384 461.75232
                  255.29856 0 464.36864-207.70816 464.36864-461.75232
                  0.00512-155.8016-81.31072-294.27712-197.2992-380.84608z"
                  fill="" p-id="5221"></path>
            </svg>
            <span>退出登录</span>
          </div>
        </div>
        <el-avatar slot="reference" :size="50" :src="user.avatar" @error="handelAvatarError">
          <img :src="require('@/assets/defalut_avatar.png')"/>
        </el-avatar>
      </el-popover>
    </div>
    <!--    未登录: 跳转登录按钮-->
    <div class="avatar_container" v-if="!is_login" @click="handelToLogin">
      <el-popover placement="bottom" width="160px" trigger="hover">
        <div class="avatar_box">
          <span>
              <span style="font-size: 14px">~还未透露身份的双指~</span>
          </span>
        </div>
        <el-button type="primary" @click="handelToLogin"
                   style="width: 100%;text-align: center;
                   margin:0 auto;">立即登录
        </el-button>
        <el-avatar slot="reference" :size="50" :src="default_avatar"></el-avatar>
      </el-popover>
    </div>
  </div>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  width: 100%;
  height: 60px;
  background-color: #fff;
  min-width: 1208px;
  box-shadow: 0 8px 16px rgba(48, 85, 133, .08);
  margin: 0 auto;
  z-index: 1;
}

.flex-all-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.pns {
  max-height: 60px;
  //margin-left: 230px;
  //position: absolute;
}

.pns:hover {
  cursor: pointer;
}

.search_container {
  width: auto;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 100px;
  border: 0;
}


.search {
  flex: 1;
  margin-left: 20px;
  border: none;
  width: 400px;
}

.search:hover {
  border-bottom-color: #409EFF;
  border: none;
}


.handleSearch {
  background-color: white;
  font-size: 20px;
  margin-top: 10px;
}

.handleSearch:hover {
  cursor: pointer;
}

.notice_container {
  height: 100%;
  margin-left: 40px;
  margin-top: 22px;
  width: 50px;
  border: none;
}

.avatar_container {
  margin-left: 100px;
}

.avatar_container:hover {
  cursor: pointer;
}

.avatar_box div {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  height: 30px;
  display: flex;
  color: #cccccc;
}

.avatar_box div:hover {
  color: black;
  cursor: pointer;
}

.avatar_box svg {
  fill: #cccccc;
  max-height: 18px;
  width: auto;
  margin-right: 40px;
}

.userInfo {
  display: flex;
  margin-bottom: 10px;
  height: 50px;
  width: auto;
  justify-content: center;
}

.userInfo_inbox {
  height: 50px;
  width: 100px;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  //background-color: #cccccc;
}

.userInfo_inbox span {
  display: inline-block;
}
</style>