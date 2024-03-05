<script>

import {checkNickName} from "@/js/util";

export default {
  name: "user-update",
  data() {
    return {
      user: {
        id: 1,
        username: '',
        avatar: '',
        sex: 0,
        signature: '',
        email: ''
      },
      dialogFormVisible: false,
      avatars: [],
      avatar_id: 0,
      avatar_url: '',
      pre_avatar: {
        id: 0,
        url: ''
      }
    }
  },
  created() {
    this.getUserInfo()
  },
  methods: {
    getUserInfo() {
      const uid = this.$route.query.id
      this.$axios.get(`/user/${uid}`).then(res => {
        if (res.data.code === 0) {
          const user = res.data.data.user
          this.user = user
          this.pre_avatar.url = user.avatar
          this.avatar_url = user.avatar
          this.$storage.set('user', user, this.ExpireTime)
        } else {
          this.$message.error('服务错误')
        }
      }).catch((reason) => {
        console.log(reason)
      })
    },
    handleSelectAvatar() {
      this.dialogFormVisible = true

      this.$axios.get('/img/avatars').then(res => {
        if (res.data.code === 0) {
          this.avatars = res.data.data.avatars
        } else {
          this.$message.error('获取头像列表错误！')
        }
      }).catch(res => {
        console.log(res)
      })
    },
    handleConfirmAvatar() {
      this.user.avatar = this.pre_avatar.url
      this.avatar_id = this.pre_avatar.id
      this.avatar_url = this.pre_avatar.url
      this.dialogFormVisible = false
    },
    handleSubmit() {
      if (checkNickName(this.user.username) === false) {
        return
      }
      this.user.avatar = this.avatar_id
      this.$axios.put('/user', this.user).then(res => {
        if (res.data.code === 0) {
          this.$message.success('更新成功')
          this.getUserInfo()
          this.$emit('user_update')
        } else {
          this.$message.error('更新失败')
        }
      })
    }
  }
}
</script>

<template>
  <div>
    <div class="content-item-title">
      <h2 class="title">编辑资料</h2>
    </div>
    <div class="content">
      <div class="avatar-container">
        <el-image @click="handleSelectAvatar" class="avatar-img" :src="avatar_url">
          <div slot="error" class="image-slot">
            <el-image @click="handleSelectAvatar" :src="require('@/assets/defalut_avatar.png')"></el-image>
          </div>
        </el-image>
      </div>
      <div class="form">
        <el-form ref="form" :model="user" label-width="100px" size="mini">
          <el-form-item label="昵称">
            <el-input v-model="user.username" placeholder="请输入昵称(2~12)"
                      maxlength="12">
              <span slot="suffix">{{ user.username.length + " / 12 " }}</span>
            </el-input>
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="user.sex">
              <el-radio :label="0"><i class="el-icon-female" style="color: red"></i> 女</el-radio>
              <el-radio :label="1"><i class="el-icon-male" style="color: dodgerblue"></i> 男</el-radio>
              <el-radio :label="2">保密</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="签名">
            <el-input v-model="user.signature" placeholder="个性签名(0~20)"
                      maxlength="20">
              <span slot="suffix">{{ user.signature.length + " / 20 " }}</span>
            </el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="user.email" placeholder="邮箱可用于找回密码"
                      maxlength="20"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="getUserInfo">重置</el-button>
            <el-button type="primary" @click="handleSubmit">提交</el-button>
          </el-form-item>
        </el-form>
      </div>

    </div>
    <el-dialog title="修改头像" :visible.sync="dialogFormVisible" :append-to-body='true'>
      <el-divider></el-divider>
      <div style="display: flex">
        <div class="icon-list-section">
          <ul class="default-avatar-list">
            <li v-for="a in avatars" :key="a.id">
              <el-image class="avatar" lazy
                        :src="a.url" @click="pre_avatar.url=a.url;pre_avatar.id=a.id"></el-image>
            </li>
          </ul>
        </div>
        <div class="header-section">
          <div>
            <el-image class="dialog-avatar-img" :src="pre_avatar.url">
              <div slot="error" class="image-slot">
                <el-image :src="require('@/assets/defalut_avatar.png')"></el-image>
              </div>
            </el-image>
            <div class="dialog-footer-section">
              <el-button type="primary" @click="handleConfirmAvatar">确定</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
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

.avatar-container {
  position: relative;
  margin: 20px auto 48px;
  text-align: center;
  display: flex;
  justify-content: center;
  border-radius: 100%;
  overflow: hidden;
}

.avatar-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  cursor: pointer;
}

.icon-list-section {
  max-height: 300px;
  overflow: auto;
  width: 344px;
  display: inline-block;
}

.default-avatar-list {
  padding: 20px 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin: 0;
}

.default-avatar-list li {
  list-style-type: none;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 100%;
  border: .5px solid rgba(0, 0, 0, .2);
  cursor: pointer;
}

.header-section {
  display: inline-block;
  position: relative;
  text-align: center;
  height: 300px;
  width: calc(100% - 344px);
}

.dialog-avatar-img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  margin-top: 60px;
}

.dialog-footer-section {
  position: absolute;
  bottom: 20px;
  left: 70%;
  //transform: translate(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>