<script>
import {quillEditor} from 'vue-quill-editor'
import "quill/dist/quill.core.css"; // import styles
import "quill/dist/quill.bubble.css"; // for bubble theme

export default {
  name: "commentBox",
  data() {
    return {
      comment: '',
      editorOption: {
        theme: 'bubble',
        placeholder: '请输入内容.....',
      },
    }
  },
  components: {
    quillEditor,
  },
  props: {
    isFloor: {
      type: [Boolean],
      required: true
    },
    postId: {
      type: [String, Number],
      required: true,
    },
    toUserId: {
      type: [String, Number],
      required: true,
    },
    parentId: {
      type: [String, Number],
      required: true,
    },
    commentId:{
      type: [String, Number],
      required: true,
    }
  },
  created() {
    console.log(this.isFloor, this.postId, this.toUserId, this.parentId, this.commentId)
  },
  mounted() {
  },
  computed: {
    disabled() {
      return this.comment.length <= 0;
    },
    commentLength() {
      let doc = new DOMParser().parseFromString(this.comment, 'text/html')
      return doc.body.textContent.length;
    }
  },
  methods: {
    commentSend() {
      if (this.commentLength > 1000) {
        this.$message.error('评论字数不能超过1000')
        return
      }
      this.$axios.post('/comment', {
        is_floor: this.isFloor,
        post_id: this.postId,
        to_user_id: this.toUserId,
        parent_id: this.parentId,
        content: this.comment,
        comment_id: this.commentId
      }).then(res => {
        if (res.data.code === 0) {
          this.$emit('refreshComment')
          this.comment = ''
          this.$message.success('评论成功')
        } else {
          this.$message.error('服务错误')
        }
      })
    },

  }
}
</script>

<template>
  <div class="box">
    <quill-editor class="input"
                  :options="editorOption" v-model="comment"></quill-editor>
    <!--    <el-input class="input" type="textarea" placeholder="请输入内容"-->
    <!--              maxlength="1000" show-word-limit-->
    <!--              :autosize="{minRows:5, maxRows:10}" resize="none"-->
    <!--              v-model="comment"></el-input>-->
    <div class="tool">
      <span class="tool-count">{{ commentLength + ' / 1000' }}</span>
      <el-button :disabled="disabled" class="button" type="primary" @click="commentSend">评论</el-button>
    </div>
  </div>
</template>

<style scoped>
.box {
  background-color: #f7f8fa;
  //z-index: 1;
}

.input {
  min-height: 100px;
  max-height: 300px;
  overflow: auto;
}

.input >>> .ql-container {
  font-size: 15px;
}

.input >>> .ql-editor {
  //padding: 0;
}

.tool {
  height: 30px;
  display: flex;
  padding-bottom: 10px;
  position: relative;
}

.button {
  position: absolute;
  display: flex;
  right: 10px;
  height: 20px;
  width: 50px;
  text-align: center;
  align-items: center;
  justify-content: center;
}

.button >>> span {
  //display: flex;
}

.button:hover {
  opacity: .7;
  transition: opacity .2s ease-in-out;
}

.tool-count {
  font-weight: 400;
  font-size: 14px;
  color: #aeb6c2;
  position: absolute;
  right: 80px;
  align-items: center;
  justify-content: center;
  display: flex;
}
</style>