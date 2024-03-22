<script>
import {quillEditor} from 'vue-quill-editor'
import "quill/dist/quill.core.css"; // import styles
import "quill/dist/quill.snow.css"; // for snow theme
import {addQuillTitle} from "@/js/quill-titlle";
import Quill from 'quill'
import QuillCustomTag from "@/js/quill-custom-tag";
import {generateRandomStrings, handleImgCompress} from "@/js/util";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "edit",
  components: {
    quillEditor,
  },
  data() {
    return {
      text: '',
      img_nums: 0,
      err: '',
      editorOption: {
        theme: 'snow',
        placeholder: '请输入内容.....',
        modules: {
          toolbar: {
            container: [
              // 加粗 斜体 下划线 删除线 -----['bold', 'italic', 'underline', 'strike']
              ['bold', 'italic', 'underline', 'strike'],
              //自定义：设置字体大小按钮
              // ['small', false, 'large'],
              // 引用  代码块-----['blockquote', 'code-block']
              ['blockquote', 'code-block'],
              // 1、2 级标题-----[{ header: 1 }, { header: 2 }]
              [{header: 1}, {header: 2}],
              // 有序、无序列表-----[{ list: 'ordered' }, { list: 'bullet' }]
              [{list: 'ordered'}, {list: 'bullet'}],
              // 上标/下标-----[{ script: 'sub' }, { script: 'super' }]
              [{script: 'sub'}, {script: 'super'}],
              // 缩进-----[{ indent: '-1' }, { indent: '+1' }]
              [{indent: '-1'}, {indent: '+1'}],
              // 文本方向-----[{'direction': 'rtl'}]
              [{direction: 'rtl'}],
              [{color: []}, {background: []}],
              // 字体种类-----[{ font: [] }]
              // [{font: []}],
              // 对齐方式-----[{ align: [] }]
              [{align: []}],
              // 清除文本格式-----['clean']
              ['clean'],
              // 链接、图片、视频-----['link', 'image', 'video']
              ['link', 'image'],
            ],
            handlers: {
              'image': () => {
                this.handleImage()
              }
            }
          },
        }
      },
      sections: [],
      cur_section: '',
      isPrivate: false,
      post: {
        id: 0,
        title: "",
        user_id: 0,
        content: "",
        created_time: '',
        section: 0,
        view_count: 0,
        like_count: 0,
        collect_count: 0,
        top_self: 0,
        top_section: 0,
        status: 0, //0：正常，1：禁用，2：仅自己可见，3：申请恢复
      },
      role: this.$storage.get('user').role,
      update: false,
      backImg: require("../assets/pns-bg-GELQYdT2.png")
    }
  },
  created() {
    // TODO 处理编辑文章
    this.$axios.get('/section/all').then(res => {
      if (res.data.code === 0) {
        this.sections = res.data.data.sections
      } else {
        this.$message.error('获取板块列表错误!')
      }
    }).catch(err => {
      console.log(err)
    })

    if (this.$route.query.id !== null && this.$route.query.id !== undefined) {
      this.update = true
      this.$axios.get(`/post/${this.$route.query.id}`).then(res => {
        if (res.data.code === 0) {
          const post = res.data.data.post
          this.post = post
          if (post.status === 2) {
            this.isPrivate = true
          }
          this.$axios.get(`/section/${post.section}`).then(res => {
            if (res.data.code === 0) {
              this.cur_section = res.data.data.section.name
            }
          }).catch(err => {
            console.log(err)
          })
        }
      }).catch(err => {
        console.log(err)
      })
    }
  },
  mounted() {
    addQuillTitle()
    QuillCustomTag(Quill)
  },
  computed: {
    // eslint-disable-next-line vue/return-in-computed-property
    textLength() {
      return this.text.length + this.img_nums * 100
    },
    getSectionId() {
      let id = 0
      this.sections.forEach(item => {
        if (item.name === this.cur_section) {
          id = item.id
        }
      })
      return id
    }
  },
  methods: {
    handleTitle() {
      if (this.post.title === '') {
        this.$message({
          message: '标题不能为空!',
          type: 'error'
        })
      }
    },
    handlePublish() {
      if (this.post.title === '') {
        this.$message.error('标题不能为空！')
        return;
      }
      if (this.textLength === 0) {
        this.$message.error('正文不能为空！')
        return;
      }
      this.post.section = this.getSectionId
      if (this.post.section === 0) {
        this.$message.error('请选择所属板块！')
        return;
      }
      this.post.status = this.isPrivate ? 2 : 0
      let imgList = []
      this.post.user_id = this.$storage.get('user').id
      document.querySelectorAll('.ql-editor img').forEach(item => {
        const src = item.getAttribute('src')
        if (src) {
          imgList.push(src)
        }
      })
      if (this.update) {
        this.$axios.put('/post', {
          "post": this.post,
          "images": imgList
        }).then(res => {
          if (res.data.code === 0) {
            this.$message.success('发布成功!')
            this.$router.push('/post-detail/' + this.post.id)
          } else {
            this.$message.error('服务错误!')
            location.reload()
          }
        }).catch(err => {
          console.log(err)
        })
      } else {
        this.$axios.post('/post', {
          "post": this.post,
          "images": imgList
        }).then(res => {
          if (res.data.code === 0) {
            this.$message.success('发布成功!')
            this.$router.push('/post-detail/' + res.data.data.id)
          } else {
            this.$message.error('服务错误!')
            location.reload()
          }
        }).catch(err => {
          console.log(err)
        })
      }
    },
    handleImage() {
      // this.isLoading = true
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.setAttribute('multiple', 'true')
      input.click();
      input.onchange = async () => {
        const files = input.files;
        if (files.length + this.img_nums > 9) {
          this.$message.error('你上传的图片太多了！限上传9张！')
          return
        }
        if (files.length > 0) {
          const ids = generateRandomStrings(8, files.length)
          // console.log(ids)
          this.handleImgUpload(files, ids)
          for (let i = 0; i < files.length; i++) {
            const quill = this.$refs.quill_editor.quill
            const selection = quill.getSelection()
            try {
              quill.insertEmbed(selection.index || 0, 'AppPanelEmbed',
                  `<div contenteditable="true" class="editor-image-container">
                <img id="${ids[i]}" src="${this.Editor_Img_Uploading}"
                 class="editor-img">
             </div>`)
            } catch (err) {
              console.log(err)
            }
          }
        }
        // this.isLoading = false
      };
    },
    handleEditorChange(e) {
      this.text = this.removeHtmlTag(e)
      this.img_nums = document.querySelectorAll('.ql-editor img').length
    },
    removeHtmlTag(html) {
      let doc = new DOMParser().parseFromString(html, 'text/html')
      return doc.body.textContent || '';
    },
    handleImgUpload(pendFiles, ids) {
      if (pendFiles.length === 0) {
        return;
      }
      // 图片压缩
      handleImgCompress(pendFiles).then((files) => {
        if (files.length > 0) {
          // 上传图片: COS
          this.$axios.getCOSSignature(files.length).then((res) => {
            if (res.data.code === 0) {
              const signatures = res.data.data.signatures
              // console.log(signatures)
              if (signatures !== null && signatures.length !== files.length) {
                this.$message.error("请求错误")
                return
              }
              for (let i = 0; i < files.length; i++) {
                this.$axios.putImg(signatures[i], files[i], function () {
                  let url = signatures[i].split('?') // 处理签名为url
                  // console.log(url[0])
                  document.querySelector('#' + ids[i]).src = url[0]
                })
              }
            } else {
              this.$message.error('服务错误!')
            }
          }).catch((error) => {
            console.log(error)
            this.$message.error('服务错误')
          })
        }
      })
    }
  },
}
</script>

<template>
  <div id="edit">
    <el-image class="back_img" :src="backImg"></el-image>
    <div id="editor_container">
      <div id="editor_container_text">
        <div id="title-box">
          <b class="mustSelect">标题</b> ： <input v-model="post.title"
                                                  id="title" placeholder="标题(必填)"
                                                  @blur="handleTitle" maxlength="30"/>
          <span style="color: #c0c4cc">{{ post.title.length + ' / 30' }}</span>
        </div>
        <div id="editor-box">
          <quill-editor ref="quill_editor" :options="editorOption"
                        id="editor" v-model="post.content"
                        @input="handleEditorChange($event)"
          >
          </quill-editor>
          <div style="color: #c0c4cc;
                text-align: right;
                ">
            {{ textLength + ' / 20000' }}
          </div>
        </div>
        <div class="postOption_box">
          <span class="mustSelect" style="font-size: 18px">所属板块 : </span>
          <el-radio-group v-model="cur_section">
            <template v-for="s in sections">
              <el-radio-button v-if="role >= s.role"
                               :key="s.id"
                               :label="s.name"></el-radio-button>
            </template>
          </el-radio-group>
        </div>
        <div class="postOption_box" style="font-size: 18px">
          <el-switch v-model="isPrivate" active-text="仅自己可见"></el-switch>
        </div>
        <div class="postOption_box">
          <el-button @click="handlePublish" icon="el-icon-edit" type="primary">
            发布
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#edit {
  width: 99%;
  min-width: 1200px;
  //background-color: #f6f7f8;
  //height: auto;
  min-height: 950px;
  overflow-y: auto;
  overflow-x: hidden;
}

#editor_container {
  width: 900px;
  background-color: white;
  margin: 10px auto;
  //height: 100%;
  min-height: 700px;
  display: flex;
  //align-items: center;
  justify-content: center;
  border-radius: 10px;
  position: relative;
  border: 1px;
}

#editor_container_text {
  width: 800px;
  height: 940px;
  margin-top: 20px;
}


#title-box {
}

#title {
  border: 1px solid #c0c4cc;
  border-radius: 5px;
  width: 680px;
  height: 100%;
  padding: 10px 15px;
  box-sizing: border-box;
  font-family: "Microsoft soft", serif;
  margin-right: 6px;
}

.postOption_box {
  position: relative;
  font-size: 20px;
  height: 40px;
  width: 100%;
  margin-bottom: 20px;
}

.mustSelect:before {
  content: "*";
  color: red;
  //margin-right: 4px;
}

#editor-box {
  min-height: 430px;
  height: auto;
  position: relative;
}

#editor {
  //height: 680px;
}


#editor-box >>> .ql-editor {
  margin-top: 10px;
  height: 680px;
  //border-radius: 10px;
  border-top: 1px solid #bfbfbf;
  box-sizing: border-box;
  line-height: 1.42;
  //height: 100%;
  outline: none;
  overflow-y: auto;
  padding: 12px 15px;
  -o-tab-size: 4;
  tab-size: 10;
  -moz-tab-size: 4;
  text-align: left;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 15px;
  position: relative;
}

#editor-box >>> .ql-toolbar {
  position: absolute;
  right: -44px;
  fill: white;
  margin: 0 auto;
  height: 680px;
  background-color: white;
  border-radius: 10px;
  width: 40px;
  transition-property: top;
  transition-duration: 0.5s;
}

#editor-box >>> .editor-image-container {
  font-family: sans-serif;
  word-wrap: break-word;
  -webkit-user-modify: read-only;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 12px auto;
  overflow: hidden;
  cursor: default;
}

#editor-box >>> .editor-img {
  font-family: sans-serif;
  word-wrap: break-word;
  cursor: default;
  aspect-ratio: auto 5000 / 2700;
  display: block;
  max-width: 100%;
  max-height: 400px;
  border-radius: 10px;
  border: 3px solid transparent;
}

.editor-img:hover {
  border: 3px solid #409EFF;
  cursor: not-allowed;
}

.editor-img-btn {
  word-wrap: break-word;
  align-items: center;
  margin-left: 4px;
  display: flex;
  justify-content: center;
  font-size: 14px;
  line-height: 24px;
  font-weight: 500;
  color: #fff;
  background: rgba(0, 0, 0, .5);
  position: absolute;
  right: 28px;
  bottom: 5px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.ql-editor > p > img {
  background-color: gray !important;
  //text-align: center;
}

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

/*

//#editor-spinner{
//  //z-index: 100;
//  position: absolute;
//  top: 20%;
//  left: 50%;
//  transform: translate(-50%, -50%);
//}


.ql-toolbar .ql-small:before {
  content: 'S';
  font-size: 18px;
  font-weight: bold;
  color: #444444;
}

.ql-toolbar .ql-undefined:before {
  content: 'N';
  font-size: 18px;
  font-weight: bold;
  color: #444444;
}

.ql-toolbar .ql-large:before {
  content: 'L';
  font-size: 18px;
  font-weight: bold;
  color: #444444;
}
 */
</style>