<script>
import {handleImgCompress} from "@/js/util";

export default {
  name: "user-feedback",
  data() {
    return {
      content: '',
      imgList: [],
      loading: false
    }
  },
  methods: {
    reset() {
      this.content = ''
      this.imgList = []
    },
    submit() {
      if (this.content === '') {
        this.$message.error('请填写意见')
        return
      }
      const user = this.$storage.get('user')
      this.$axios.post('/feedback', {
        feedback: {
          user_id: user.id,
          comment: this.content,
        },
        images: this.imgList
      }).then((res) => {
        if (res.data.code === 0) {
          this.$message.success('提交成功')
          this.reset()
        } else {
          this.$message.error('提交失败')
        }
      })
    },
    handleImg() {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.setAttribute('multiple', 'true')
      input.click();

      input.onchange = async () => {
        const files = input.files;
        if (files.length + this.imgList.length > 3) {
          this.$message.error('你上传的图片太多了！')
          return
        }
        this.loading = true
        if (files.length > 0) {
          await handleImgCompress(files).then((files) => {
            this.$axios.getCOSSignature(files.length).then(res => {
              if (res.data.code === 0) {
                const signatures = res.data.data.signatures
                if (signatures !== null && signatures.length !== files.length) {
                  this.$message.error("请求错误")
                  return
                }
                for (let i = 0; i < files.length; i++) {
                  this.$axios.putImg(signatures[i], files[i], () => {
                    this.imgList.push(signatures[i].split('?')[0])
                  })
                }
                this.loading = false
              } else {
                this.$message.error('服务错误')
              }
            })
          })
        }
      }
    }
  }
}
</script>

<template>
  <div v-loading="loading">
    <div class="content-item-title">
      <h2 class="title">意见反馈</h2>
      <span style="right: 0; float: right">
        <el-button type="info" size="mini" @click="reset">重置</el-button>
        <el-button type="primary" size="mini" @click="submit">确认</el-button>
      </span>
    </div>
    <div class="content">
      <div style="margin-bottom: 10px;font-size: 14px"> 意见反馈(必填)</div>
      <div>
        <el-input
            type="textarea"
            placeholder="请输入内容"
            v-model="content"
            maxlength="200"
            show-word-limit
            rows="7"
        ></el-input>
      </div>
      <div style="margin-bottom: 10px;margin-top: 20px;
      font-size: 14px">添加图片（最多3张）
        <el-button @click="handleImg" size="mini" type="primary" icon="el-icon-circle-plus-outline">添加</el-button>
      </div>
      <div>
        <el-image class="feedback-img" v-for="(item, index) in imgList" :key="index" :src="item"
                  :preview-src-list="[item]"
                  style="margin-right: 10px"></el-image>
      </div>
      <div>

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
  padding: 20px;
}

.feedback-img {
  width: 160px;
}
</style>