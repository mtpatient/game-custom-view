<script>
import CryptoJS from 'crypto-js'

export default {
  name: "user-password",
  data() {
    return {
      form: {
        cur_password: '',
        password: '',
        confirm_password: '',
      }
    }
  },
  methods: {
    reset() {
      this.form.cur_password = ''
      this.form.password = ''
      this.form.confirm_password = ''
    },
    submit() {
      if (this.form.cur_password === '' || this.form.password === '' || this.form.confirm_password === '') {
        this.$message.error('请填写完整信息')
        return
      }
      if (this.check()) {
        const user = this.$storage.get('user')
        this.$axios.post('/user/password', {
          user_id: user.id,
          cur_pwd: CryptoJS.MD5(this.form.cur_password).toString(),
          new_pwd: CryptoJS.MD5(this.form.password).toString(),
          confirm_pwd: CryptoJS.MD5(this.form.confirm_password).toString()
        }).then((res) => {
          if (res.data.code === 0) {
            this.$message.success('修改成功')
            this.reset()
          } else {
            this.$message.error(res.data.msg)
          }
        })
      }
    },

    check() {
      if (this.form.cur_password === this.form.password) {
        this.$message.error('新密码不能与当前密码相同')
        return false
      }
      if (this.form.password.length < 6 || this.form.password.length > 63) {
        this.$message.error('密码长度为6-63位')
        return false
      }
      if (this.form.password !== this.form.confirm_password) {
        this.$message.error('两次输入的密码不一致')
        return false
      }
      return true
    }
  }
}
</script>

<template>
  <div>
    <div class="content-item-title">
      <h2 class="title">修改密码</h2>
    </div>
    <div class="content">
      <div class="form">
        <el-form v-model="form">
          <el-form-item label="当前密码">
            <el-input type="password" v-model="form.cur_password" placeholder="请输入当前密码"></el-input>
          </el-form-item>
          <el-form-item label="新的密码">
            <el-input type="password" v-model="form.password" placeholder="请输入新密码"></el-input>
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input type="password" v-model="form.confirm_password" placeholder="请再次输入新密码"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div>
        <el-button @click="reset">重置</el-button>
        <el-button type="primary" @click="submit">提交</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-item-title {
  border-bottom: 1px solid #EDEFF5;
  padding-bottom: 20px;
}

.content-item-title .title {
  display: inline;
  width: 100%;
  font-size: 18px;
  line-height: 26px;
  font-weight: 700;
  color: #393f4d;
  margin: 0;
}

.content {
}
</style>