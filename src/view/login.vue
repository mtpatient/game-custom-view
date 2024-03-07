<script>
import {checkNickName} from "@/js/util";
import CryptoJS from 'crypto-js'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'login',
  data() {
    return {
      labelPosition: 'left',
      user: {
        username: '',
        password: '',
        repwd: '',
        email: '',
      },
      NickName: '',
      activeTab: "login",
      checked: 'false',
      img: require('@/assets/bg.jpg'),
      isDisabled: false,
      dialogVisible: false,
      email: '',
      buttonText: '获取验证码',
      authCode: '',
      new_password: '',
      confirm_password: '',
    }
  },
  props: [],
  beforeCreate() {
    this.$axios.get('/user/is_login').then((res) => {
      const data = res.data.data
      if (data !== undefined && data.is_login) {
        this.$message({
          message: "你已经登录",
          type: 'success'
        })
        this.$router.push('/')
      }
    }).catch((err) => {
      console.log(err)
    })
  },
  created() {

  },
  watch: {},
  computed: {},
  methods: {
    handleMouseEnter() {
      this.$refs.container.classList.add("back");
      this.$refs.img.classList.add("bg-mask");
    },
    handleMouseLeave() {
      this.$refs.container.classList.remove("back");
      this.$refs.img.classList.remove("bg-mask");
    },
    handleNickNameBlur() {
      const username = this.user.username
      if (!checkNickName(username)) {
        return false
      }
      let url = '/user/name-exist/' + encodeURIComponent(username)

      this.$axios.get(url).then((res) => {
        if (res.data.data.exist === true) {
          this.$message({
            message: '昵称已存在',
            type: 'error',
          })
          return false
        }
        return true
      })
    },
    handlePwdBlur() {
      const pwd = this.user.password
      if (pwd.length < 6 || pwd.length > 63) {
        this.$message({
          message: '密码长度为6-63位',
          type: 'error'
        })
        return false
      }
      if (this.user.repwd !== '') {
        return this.handleRePwdBlur()
      }
      return true
    },
    handleRePwdBlur() {
      const pwd = this.user.password
      const repwd = this.user.repwd
      if (pwd !== repwd) {
        this.$message({
          message: '两次输入的密码不一致',
          type: 'error'
        })
        return false
      }
      return true
    },
    register() {
      if (this.handleNickNameBlur()) {
        return;
      }
      if (!this.handlePwdBlur()) {
        // console.log("pwd")
        return;
      }
      if (!this.handleRePwdBlur()) {
        // console.log("repwd")
        return;
      }
      if (!checkNickName(this.user.email)) {
        this.$message.error('邮箱格式错误')
        return;
      }
      const pwd = CryptoJS.MD5(this.user.password).toString()
      const repwd = CryptoJS.MD5(this.user.repwd).toString()
      this.$axios.post('/register', {
        username: this.user.username,
        password: pwd,
        repwd: repwd,
        email: this.user.email
      }).then((res) => {
        if (res.data.code === 0) {
          this.$confirm('注册成功，是否直接登录？', '注册成功', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'success'
          }).then(() => {
            this.login()
          }).catch(() => {
            location.reload()
          })
        } else {
          this.$confirm(res.data.msg, '服务错误', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
          }).then(() => {
            location.reload()
          }).catch(() => {

          })
        }
      })
    },
    login() {
      if (!checkNickName(this.user.username)) {
        return
      }
      const pwd = CryptoJS.MD5(this.user.password).toString()
      // console.log(pwd)
      this.$axios.post('/login', {
        username: this.user.username,
        password: pwd
      }).then((res) => {
        const data = res.data
        if (data.code === 0) {

          try {
            this.$storage.set("token", data.data.token, this.ExpireTime)
            // console.log("token:" + data.data.token)
            this.$storage.set("user", data.data.user, this.ExpireTime)
            // console.log("user:", JSON.stringify(data.data.user))
          } catch (e) {
            console.log("localstorage" + e)
          }
          const role = data.data.user.role
          if (role === 0) {
            this.$router.push('/')
          }
          if (role === 1) {
            this.$router.push('/back-Management')
          }
          // 刷新顶头导航栏
          this.$EventBus.$emit('user_update')
        } else {
          this.$confirm('用户名或密码错误！', '登录失败！', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
          }).then(() => {
          }).catch(() => {

          })
        }
      }).catch()
    },
    getAuthCode() {
      if (this.NickName === '') {
        this.$message.error('请输入昵称或邮箱！')
        return
      }
      // 点击后按钮需要等待60s才能重新点击
      this.isDisabled = true
      let count = 60
      let timer = setInterval(() => {
        this.buttonText = count + 's后可重新发送'
        if (count === 0) {
          console.log('计时结束')
          this.isDisabled = false
          this.buttonText = '获取验证码'
          clearInterval(timer)
        }
        count--
      }, 1000)

      this.$axios.get(`/user/authCode/${encodeURIComponent(this.NickName)}`).then((res) => {
        if (res.data.code === 0) {
          this.$message.success('验证码已发送至邮箱！')
        } else {
          this.$confirm(res.data.msg, '获取验证码失败', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
          }).then(() => {
          }).catch(() => {
          })
        }
      })
    },
    handleResetPwd() {
      if (this.NickName === '') {
        this.$message.error('请输入昵称！')
        return
      }
      if (this.authCode === '') {
        this.$message.error('请输入验证码！')
        return
      }
      if (this.new_password.length < 6 || this.new_password.length > 63) {
        this.$message.error('密码长度为6-63位！')
        return
      }
      if (this.confirm_password !== this.new_password) {
        this.$message.error('两次输入的密码不一致！')
        return
      }
      this.$axios.post('/user/resetPwd', {
        username: this.NickName,
        code: this.authCode,
        new_pwd: CryptoJS.MD5(this.new_password).toString(),
        confirm_pwd: CryptoJS.MD5(this.confirm_password).toString()
      }).then((res) => {
        if (res.data.code === 0) {
          this.$message.success('重置密码成功！')
          location.reload()
        } else {
          this.$confirm(res.data.msg, '重置密码失败, 请稍后再试！', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
          }).then().catch((res) => {
            console.log(res)
          })
        }
      })
    }
  }
}
</script>

<template>
  <div style="width: 98vw; height: 100vh">
    <img class="back_img" alt="" :src="img" ref="img">
    <div class="container" ref="container"
         @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
      <el-tabs class="tab" v-model="activeTab" stretch="">
        <el-tab-pane name="login">
          <span slot="label"><img style="max-height: 35px; float: left;"
                                  src="https://prod-alicdn-community.kurobbs.com/postBanner/1702370576858915978.png"
                                  alt="">登录</span>
          <el-form class="form" label-width="80px" :model="user" label-position="right">
            <el-form-item label="昵称">
              <el-input v-model="user.username"
                        style="width: 220px;"
                        placeholder="请输入昵称或邮箱"></el-input>
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="user.password" style="width: 220px;" type="password"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="login">登录</el-button>
              <el-button type="info" @click="dialogVisible = true">找回密码</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane name="register">
          <span slot="label">注册</span>
          <el-form class="form" label-width="80px" :model="user">
            <el-form-item label="昵称">
              <el-input v-model="user.username" style="width: 220px;"
                        @blur="handleNickNameBlur"></el-input>
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input placeholder="用于找回密码" v-model="user.email" style="width: 220px;"></el-input>
            </el-form-item>
            <el-form-item label="密码">
              <el-input ref="pwd" v-model="user.password" style="width: 220px;" type="password"
                        @blur="handlePwdBlur"></el-input>
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input ref="repwd" v-model="user.repwd" style="width: 220px;" type="password"
                        @blur="handleRePwdBlur"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="register">注册</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-dialog width="200" title="找回密码" :visible="dialogVisible" @close="dialogVisible = false">
      <el-form label-positon="left">
        <el-form-item label="昵称">
          <el-input v-model="NickName" placeholder="请输入昵称或邮箱">
            <el-button :disabled="isDisabled" @click="getAuthCode" slot="append" type="primary">{{
                buttonText
              }}
            </el-button>
          </el-input>
        </el-form-item>
        <el-form-item label="验证码">
          <el-input v-model="authCode">
          </el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input placeholder="请输入新密码" v-model="new_password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="confirm_password" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleResetPwd">确认</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<style scoped>
.container {
  width: 350px;
  //height: auto;
  max-height: 350px;
  border: 2px solid #ccc;
  border-radius: 20px;
  position: relative;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  background-color: transparent;
  z-index: 1;
  backdrop-filter: blur(5px);
  transition: all 1s;
}

/* 或者使用 >>> 穿透样式作用域 */
.container >>> .el-tabs__item {
  /* ... 其他样式 ... */
  transition: width 0.3s ease, height 0.3s ease;
}

.back {
  border: 1px solid rgb(232, 183, 255) !important;
  box-shadow: 1px 0 10px 3px rgba(232, 183, 255, 0.6) !important;
  background-color: #fff !important;
}

.bg-mask {
  filter: blur(5px);
  transition: all 1s;
}

.tab {
  width: 100%;
  height: 100%;
}


.back_img {
  width: 100%;
  height: calc(100vh - 60px);
  object-fit: cover;
  z-index: -1;
  position: fixed;
}
</style>