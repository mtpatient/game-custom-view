<script>
import {isLogin} from "@/js/util";

export default {
  name: "personalCenter",

  data() {
    return {
      user: {
        id: 1,
        username: '',
        avatar: '',
        sex: 0,
        signature: '',
        fans_count: 0,
        like_count: 0,
        follow_count: 0,
        role: 0,
      },
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
  methods: {
    CountNums(v) {
      if (v < 1000) {
        return v
      }
      if (v > 1000 && v < 10000) {
        return (v / 1000).toFixed(2) + 'k'
      }

      return (v / 10000).toFixed(2) + 'w'
    },
    getUserInfo() {
      const uid = this.$route.query.id
      this.$axios.get(`/user/${uid}`).then(res => {
        if (res.data.code === 0) {
          const user = res.data.data.user
          this.user = user
          this.$storage.set('user', user, this.ExpireTime)
        } else {
          this.$message.error('服务错误')
        }
      }).catch((reason) => {
        console.log(reason)
      })
    },
    userUpdate(){
      this.getUserInfo()
      this.$emit('user_update')
    }
  },
  created() {
    this.getUserInfo()
  },
  mounted() {
    this.$nextTick(() => {
      const li_id = this.$route.name.split('-')[1]
      document.querySelector('#' + li_id).classList.add('active')

      let lis = document.querySelectorAll('.flex-vertical-center')
      lis.forEach(li => {
        li.addEventListener('click', () => {
          let v = li.getAttribute('value')
          if (v === 'back') {
            const page = this.$router.resolve({
              path: '/back-Management'
            })
            window.open(page.href, '_blank')
            return
          } else {
            this.$router.push({
              path: '/person-center/' + v,
              query: {id: this.user.id}
            })
          }
          for (let i = 0; i < lis.length; i++) {
            if (lis[i].classList.contains('active')) {
              lis[i].classList.remove('active')
              break
            }
          }
          li.classList.add('active')
        })
      })
    })
    window.addEventListener('storage', () => {
      const token = this.$storage.get('token')
      const user = this.$storage.get("user")
      if (user === null || token === null ||
          user === undefined || token === undefined) {
        console.log('token不存在或过期')
        return
      }
      this.user = user
    })
  }
}
</script>

<template>
  <div class="container">
    <div class="mask"></div>
    <div class="main-content">
      <div class="main-box flex">
        <div class="sub-section"></div>
        <div class="main-container">
          <div class="info-section flex">
            <div class="user-info-section">
              <div class="user-avatar-section">
                <el-image class="user-avatar" :src="user.avatar">
                  <div slot="error" class="image-slot">
                    <el-image :src="require('@/assets/defalut_avatar.png')"></el-image>
                  </div>
                </el-image>
              </div>
              <div class="user-info-data">
                <div>
                  <span class="user-name">{{ user.username }}</span>
                </div>
                <div><span
                    class="user-id">{{ 'ID：' + (10000000 + user.id) + (user.role === 1 ? '  |  管理员' : '') }}</span>
                </div>
                <div class="relation-section">
                  <span class="item pointer"> 关注：
                    <span class="number">{{ CountNums(user.follow_count) }}</span>
                  </span>
                  <span class="item pointer"> 粉丝：
                    <span class="number">{{ CountNums(user.fans_count) }}</span>
                  </span>
                  <span class="item pointer"> 获赞：
                    <span class="number">{{ CountNums(user.like_count) }}</span>
                  </span>
                </div>
                <p class="signature">{{ user.signature }}</p>
                <div class="info-footer">
                  <!--                  TODO 处理按钮事件-->
                  <el-button type="primary" v-if="!OnSelf">关注</el-button>
                  <el-button v-if="!OnSelf">已关注</el-button>
                  <el-button @click="$refs.edit.click()" type="info" v-if="OnSelf">编辑资料</el-button>
                </div>
              </div>
            </div>
            <div class="info-bg-section"></div>
          </div>
          <div class="content-section">
            <el-container>
              <el-aside>
                <div class="person-center-list aside-item">
                  <div class="aside-item-title">个人中心</div>
                  <ul class="aside-content">
                    <li class="flex-vertical-center" value="post" id="post">
                      <i class="el-icon-document aside-icon"></i>
                      <span>帖子</span></li>
                    <li class="flex-vertical-center" value="comment" id="comment">
                      <i class="el-icon-chat-line-square aside-icon"></i>
                      <span>评论</span></li>
                    <li class="flex-vertical-center" value="collect" id="collect">
                      <i class="el-icon-star-off aside-icon"></i>
                      <span>收藏</span></li>
                    <li class="flex-vertical-center" value="follow" id="follow">
                      <i class="el-icon-paperclip aside-icon"></i>
                      <span>关注</span></li>
                    <li class="flex-vertical-center" value="fans" id="fans">
                      <i class="el-icon-attract aside-icon"></i>
                      <span>粉丝</span></li>
                  </ul>
                </div>
                <div class="setting-management-list aside-item">
                  <div class="aside-item-title">设置管理</div>
                  <ul class="aside-content">
                    <li ref="edit" class="flex-vertical-center" value="edit" id="edit">
                      <i class="aside-icon el-icon-edit"></i>
                      <span>编辑资料</span></li>
                    <li class="flex-vertical-center" value="feedback" id="feedback">
                      <i class="aside-icon el-icon-s-promotion"></i>
                      <span>意见反馈</span></li>
                    <li class="flex-vertical-center" value="password" id="password">
                      <i class="aside-icon el-icon-finished"></i>
                      <span>修改密码</span></li>
                    <li class="flex-vertical-center" value="back" v-show="user.role">
                      <i class="aside-icon el-icon-office-building"></i>
                      <span>后台管理</span></li>
                  </ul>
                </div>
              </el-aside>
              <el-main class="el-main">
                <div class="main-content-box">
                  <router-view @user_update="userUpdate"></router-view>
                </div>
              </el-main>
            </el-container>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  background-color: #f7f8fa;
  margin: 0 auto;
  height: auto;
  width: 99.3%;
  //padding: 76px 0 24px;
  //box-sizing: content-box;
}

.main-content {
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

.flex {
  display: flex;
}

.sub-section {
  position: sticky;
  height: 100vh;
  left: 0;
  top: 76px;
  bottom: 0;
}

.main-container {
  width: 892px;
}

.info-section {
  position: relative;
  padding: 40px 24px 24px 44px;
  background: #fff;
  border-radius: 8px;
  height: auto;
  margin-top: 20px;
}

.user-info-section {
  display: flex;
  position: relative;
  margin-bottom: 12px;
}

.user-avatar-section {
  display: inline-block;
  margin-right: 20px;
}

.user-avatar {
  border-radius: 50%;
  width: 100px;
  height: 100px;
}

.user-info-data {
  display: inline-block;
}

.user-name {
  font-weight: 700;
  font-size: 24px;
  line-height: 32px;
  color: #292B2F;
  max-width: 292px;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
}

.user-id {
  display: flex;
  align-items: center;
  border-radius: 4px;
  font-weight: 400;
  color: #bfbfbf;
  word-break: break-word;
  margin-bottom: 8px;
  font-size: 12px;
  line-height: 20px;
  box-sizing: border-box;
}

.relation-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #8c95a3;
  margin-bottom: 12px;
}

.relation-section .item .number {
  font-weight: 700;
  color: #292B2F;
}

.relation-section .item .number:hover {
  color: #32b2b5;
}

.pointer {
  cursor: pointer;
}

.signature {
  max-height: 48px;
  font-weight: 400;
  color: #aeb6c2;
  font-size: 16px;
  line-height: 24px;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 20px;
}

.content-section {
  margin-top: 10px;
}

.aside-item {
  background-color: white;
  border-radius: 10px;
  padding: 10px;
}

.aside-item-title {
  font-weight: 700;
  border-bottom: 1px solid #edeff5;
  margin-bottom: 20px;
  color: #393f4d;
  font-size: 18px;
  line-height: 26px;
  padding-left: 32px;
  padding-right: 32px;
  padding-bottom: 20px;
}

.person-center-list {
  margin-bottom: 10px;
}

.el-main {
  padding: 0 0 0 10px;
  border-radius: 10px;
}

.main-content-box {
  background-color: white;
  min-height: 600px;
  padding: 10px;
  margin-bottom: 50px;
}

.aside-content {
  margin: 0;
  padding: 0;
}

.flex-vertical-center {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  cursor: pointer;
  color: #aeb6c2;
  padding: 12px 32px;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.aside-icon {
  margin-right: 8px;
}

.active {
  color: #1E7DFA;
  background: #f7f8fa;
  border-radius: 10px;
}
</style>
